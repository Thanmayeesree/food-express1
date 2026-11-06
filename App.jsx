import React, { useEffect, useMemo, useState } from "react";
import {
  Utensils, ShoppingCart, ClipboardList, UserRound, LogIn,
  LogOut, Home, Store, ShieldCheck, Plus, Minus, Trash2,
  Tag, Bike, Menu as MenuIcon, X, CheckCircle2
} from "lucide-react";

const foods = [
  { id: 1, name: "Chicken Biryani", price: 220, category: "Indian", restaurant: "Spice Hub", img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=700" },
  { id: 2, name: "Veg Biryani", price: 160, category: "Indian", restaurant: "Spice Hub", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700" },
  { id: 3, name: "Pizza", price: 250, category: "Italian", restaurant: "Pizza Point", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700" },
  { id: 4, name: "Burger", price: 140, category: "Fast Food", restaurant: "Burger House", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700" },
  { id: 5, name: "Masala Dosa", price: 90, category: "South Indian", restaurant: "Spice Hub", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700" }
];

const readStore = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const money = (value) => `₹${Number(value || 0).toFixed(2).replace(/\\.00$/, "")}`;

export default function App() {
  const [page, setPage] = useState("home");
  const [users, setUsers] = useState(() => readStore("users", []));
  const [cart, setCart] = useState(() => readStore("cart", []));
  const [orders, setOrders] = useState(() => readStore("orders", []));
  const [current, setCurrent] = useState(() => readStore("current", null));
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [checkout, setCheckout] = useState({ customer: "", phone: "", address: "", payment: "Cash on Delivery" });

  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("orders", JSON.stringify(orders)), [orders]);
  useEffect(() => {
    if (current) localStorage.setItem("current", JSON.stringify(current));
    else localStorage.removeItem("current");
  }, [current]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const total = Math.max(0, subtotal - discount);

  function navigate(next) {
    setPage(next);
    setMobileOpen(false);
    setNotice("");
    if (next === "cart" || next === "checkout") setCouponMessage("");
  }
  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }
  function register(event) {
    event.preventDefault();
    const u = { ...registerForm, name: registerForm.name.trim(), email: registerForm.email.trim().toLowerCase() };
    if (!u.name || !u.email || !u.password) return flash("Please fill in all registration fields.");
    if (users.some((x) => x.email === u.email)) return flash("An account with this email already exists.");
    setUsers((old) => [...old, u]);
    setRegisterForm({ name: "", email: "", password: "", role: "user" });
    flash("Registration successful. Please log in.");
    navigate("login");
  }
  function login(event) {
    event.preventDefault();
    const u = users.find((x) => x.email === loginForm.email.trim().toLowerCase() && x.password === loginForm.password);
    if (!u) return flash("Invalid login details. Please try again.");
    setCurrent(u);
    setLoginForm({ email: "", password: "" });
    navigate(u.role === "admin" ? "admin" : "dashboard");
  }
  function logout() {
    setCurrent(null);
    setDiscount(0);
    navigate("home");
    flash("You have been logged out.");
  }
  function addToCart(id) {
    const item = foods.find((f) => f.id === id);
    setCart((old) => {
      const found = old.find((x) => x.id === id);
      return found ? old.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x) : [...old, { ...item, qty: 1 }];
    });
    flash(`${item.name} added to your cart.`);
  }
  function changeQty(id, amount) {
    setCart((old) => old.map((x) => x.id === id ? { ...x, qty: x.qty + amount } : x).filter((x) => x.qty > 0));
    setDiscount(0);
    setCouponMessage("Your cart changed. Apply the coupon again.");
  }
  function applyCoupon(event) {
    event?.preventDefault();
    if (coupon.trim().toUpperCase() === "FOOD10" && subtotal > 0) {
      const amount = Math.min(subtotal * 0.1, 100);
      setDiscount(amount);
      setCouponMessage("10% discount applied successfully!");
    } else {
      setDiscount(0);
      setCouponMessage("Invalid coupon code. Try FOOD10.");
    }
  }
  function placeOrder(event) {
    event.preventDefault();
    if (!current) { navigate("login"); return flash("Please log in before placing an order."); }
    if (!cart.length) return flash("Your cart is empty.");
    if (!checkout.customer.trim() || !checkout.phone.trim() || !checkout.address.trim()) return flash("Please complete all delivery details.");
    if (!/^[0-9]{10}$/.test(checkout.phone.trim())) return flash("Enter a valid 10-digit phone number.");
    const order = {
      id: Date.now(), email: current.email, name: checkout.customer.trim(),
      phone: checkout.phone.trim(), address: checkout.address.trim(),
      payment: checkout.payment, items: cart, subtotal, discount, total,
      status: "Order Placed", createdAt: new Date().toLocaleString()
    };
    setOrders((old) => [...old, order]);
    setCart([]);
    setDiscount(0);
    setCoupon("");
    setCouponMessage("");
    setCheckout({ customer: "", phone: "", address: "", payment: "Cash on Delivery" });
    navigate("orders");
    flash("Your order has been placed successfully!");
  }
  function updateStatus(id, status) {
    setOrders((old) => old.map((o) => o.id === id ? { ...o, status } : o));
    flash("Order status updated.");
  }

  const navItems = [
    ["home", "Home", Home], ["restaurants", "Restaurants", Store],
    ["menu", "Menu", Utensils], ["cart", "Cart", ShoppingCart],
    ["orders", "Orders", ClipboardList]
  ];
  const userNav = current
    ? [...navItems, ...(current.role === "admin" ? [["admin", "Admin", ShieldCheck]] : [["dashboard", "Dashboard", UserRound]])]
    : [...navItems, ["register", "Register", UserRound], ["login", "Login", LogIn]];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")}><span className="brand-mark"><Bike size={22}/></span><span>Food<span>Express</span></span></button>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X/> : <MenuIcon/>}</button>
        <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
          {userNav.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? "nav-link active" : "nav-link"} onClick={() => navigate(id)}>
              <Icon size={16}/>{label}{id === "cart" && cart.length > 0 && <span className="cart-count">{cart.reduce((s,x)=>s+x.qty,0)}</span>}
            </button>
          ))}
          {current && <button className="nav-link logout-link" onClick={logout}><LogOut size={16}/>Logout</button>}
        </nav>
      </header>

      <main>
        {notice && <div className="toast"><CheckCircle2 size={18}/>{notice}</div>}

        {page === "home" && <>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">GOOD FOOD, GOOD MOOD</span>
              <h1>Your cravings,<br/><em>delivered.</em></h1>
              <p>Discover delicious meals from your favourite local restaurants and get them delivered right to your door.</p>
              <div className="hero-actions"><button className="primary-btn" onClick={() => navigate("restaurants")}>Explore restaurants <span>→</span></button><span className="delivery-note"><Bike size={18}/> Fast & fresh delivery</span></div>
            </div>
            <div className="hero-art">
              <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000" alt="A table full of delicious food"/>
              <div className="floating-tag"><span>✦</span><div><strong>Freshly made</strong><small>Just for you</small></div></div>
            </div>
          </section>
          <section className="section-block">
            <div className="section-heading"><div><span className="eyebrow">HANDPICKED FOR YOU</span><h2>Popular right now</h2></div><button className="text-btn" onClick={() => navigate("menu")}>View full menu →</button></div>
            <FoodGrid items={foods.slice(0, 3)} onAdd={addToCart}/>
          </section>
          <section className="promo-strip"><div><span className="eyebrow">A LITTLE TREAT</span><h2>Good food deserves a good deal.</h2><p>Use code <strong>FOOD10</strong> at checkout and get 10% off your order, up to ₹100.</p></div><span className="promo-stamp"><Tag size={24}/> FOOD10</span></section>
        </>}

        {page === "register" && <AuthPanel title="Create your account" subtitle="Join FoodExpress and get your favourites delivered." onSubmit={register} button="Create account">
          <Field label="Full name"><input value={registerForm.name} onChange={e=>setRegisterForm({...registerForm,name:e.target.value})} placeholder="Your full name" required/></Field>
          <Field label="Email address"><input type="email" value={registerForm.email} onChange={e=>setRegisterForm({...registerForm,email:e.target.value})} placeholder="you@example.com" required/></Field>
          <Field label="Password"><input type="password" value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} placeholder="Create a password" required/></Field>
          <Field label="Account type"><select value={registerForm.role} onChange={e=>setRegisterForm({...registerForm,role:e.target.value})}><option value="user">Customer</option><option value="admin">Admin</option></select></Field>
          <p className="form-foot">Already have an account? <button type="button" onClick={()=>navigate("login")}>Log in</button></p>
        </AuthPanel>}

        {page === "login" && <AuthPanel title="Welcome back" subtitle="Log in to continue your FoodExpress journey." onSubmit={login} button="Log in">
          <Field label="Email address"><input type="email" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="you@example.com" required/></Field>
          <Field label="Password"><input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} placeholder="Your password" required/></Field>
          <p className="form-foot">New to FoodExpress? <button type="button" onClick={()=>navigate("register")}>Create an account</button></p>
        </AuthPanel>}

        {page === "dashboard" && <section className="page-section"><PageTitle eyebrow="YOUR SPACE" title={`Hello, ${current?.name || "there"}!`} subtitle="What are you in the mood for today?"/><div className="dashboard-actions"><button className="primary-btn" onClick={()=>navigate("menu")}>Browse food</button><button className="secondary-btn" onClick={()=>navigate("orders")}>My orders</button><button className="secondary-btn" onClick={()=>navigate("cart")}>My cart ({cart.length})</button></div></section>}

        {page === "restaurants" && <section className="page-section"><PageTitle eyebrow="FIND YOUR FAVOURITE" title="Restaurants" subtitle="A little something for every craving."/><div className="restaurant-grid">{[["Spice Hub","Indian favourites","🌶️"],["Pizza Point","Freshly baked Italian","🍕"],["Burger House","Burgers, fries & more","🍔"]].map(([name,desc,emoji])=><button className="restaurant-card" key={name} onClick={()=>navigate("menu")}><span className="restaurant-emoji">{emoji}</span><h3>{name}</h3><p>{desc}</p><span className="restaurant-cta">Explore menu →</span></button>)}</div></section>}

        {page === "menu" && <section className="page-section"><PageTitle eyebrow="MADE WITH LOVE" title="Explore the menu" subtitle="Tasty picks, made fresh and ready for your table."/><FoodGrid items={foods} onAdd={addToCart}/></section>}

        {page === "cart" && <section className="page-section"><PageTitle eyebrow="ALMOST THERE" title="Your cart" subtitle="Everything you love, all in one place."/>
          {cart.length === 0 ? <EmptyState text="Your cart is waiting for something delicious." action="Browse the menu" onClick={()=>navigate("menu")}/> :
          <div className="cart-layout"><div className="cart-list">{cart.map(item=><div className="cart-item" key={item.id}><img src={item.img} alt={item.name}/><div className="cart-item-info"><h3>{item.name}</h3><p>{item.restaurant}</p><strong>{money(item.price)}</strong></div><div className="quantity"><button onClick={()=>changeQty(item.id,-1)} aria-label="Decrease quantity"><Minus size={15}/></button><b>{item.qty}</b><button onClick={()=>changeQty(item.id,1)} aria-label="Increase quantity"><Plus size={15}/></button></div><button className="remove-btn" onClick={()=>changeQty(item.id,-item.qty)} aria-label="Remove item"><Trash2 size={17}/></button></div>)}</div>
            <aside className="summary-card"><h3>Order summary</h3><div className="coupon-row"><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Coupon code"/><button onClick={applyCoupon}>Apply</button></div>{couponMessage && <p className={discount ? "success-text" : "helper-text"}>{couponMessage}</p>}<div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Discount</span><b className="discount-value">−{money(discount)}</b></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary-btn full-btn" onClick={()=>current?navigate("checkout"):(navigate("login"),flash("Please log in to continue."))}>Continue to checkout</button><small className="secure-note">A delicious meal is just a few steps away.</small></aside>
          </div>}
        </section>}

        {page === "checkout" && <section className="page-section"><PageTitle eyebrow="FINAL STEP" title="Delivery details" subtitle="Where should we bring your order?"/>{!cart.length ? <EmptyState text="Your cart is empty." action="Browse the menu" onClick={()=>navigate("menu")}/> : <div className="checkout-layout"><form className="panel form-panel" onSubmit={placeOrder}><Field label="Customer name"><input value={checkout.customer} onChange={e=>setCheckout({...checkout,customer:e.target.value})} placeholder="Name for the order" required/></Field><Field label="Phone number"><input value={checkout.phone} onChange={e=>setCheckout({...checkout,phone:e.target.value})} placeholder="10-digit mobile number" inputMode="numeric" maxLength="10" required/></Field><Field label="Delivery address"><textarea value={checkout.address} onChange={e=>setCheckout({...checkout,address:e.target.value})} placeholder="House number, street, area, city..." rows="4" required/></Field><Field label="Payment method"><select value={checkout.payment} onChange={e=>setCheckout({...checkout,payment:e.target.value})}><option>Cash on Delivery</option><option>UPI (Demo)</option><option>Card (Demo)</option></select></Field><button className="primary-btn full-btn" type="submit">Place order · {money(total)}</button></form><aside className="summary-card"><h3>Your order</h3>{cart.map(item=><div className="summary-line" key={item.id}><span>{item.name} × {item.qty}</span><b>{money(item.price*item.qty)}</b></div>)}<div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Discount</span><b className="discount-value">−{money(discount)}</b></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div></aside></div>}</section>}

        {page === "orders" && <section className="page-section"><PageTitle eyebrow="YOUR FOOD JOURNEY" title="My orders" subtitle="Keep up with the delicious things coming your way."/>{!current ? <EmptyState text="Log in to view your orders." action="Log in" onClick={()=>navigate("login")}/> : <OrderList orders={orders.filter(o=>o.email===current.email)} onBrowse={()=>navigate("menu")}/>}</section>}

        {page === "admin" && <section className="page-section"><PageTitle eyebrow="CONTROL CENTRE" title="Admin dashboard" subtitle="A quick overview of FoodExpress orders."/>{current?.role !== "admin" ? <EmptyState text="Admin login is required to view this page." action="Log in" onClick={()=>navigate("login")}/> : <><div className="stats-grid"><div className="stat-card"><span>Total orders</span><strong>{orders.length}</strong></div><div className="stat-card"><span>Total revenue</span><strong>{money(orders.reduce((s,o)=>s+o.total,0))}</strong></div><div className="stat-card"><span>Registered users</span><strong>{users.length}</strong></div></div><h2 className="subheading">Recent orders</h2>{orders.length === 0 ? <EmptyState text="No orders have been placed yet."/> : <div className="admin-orders">{[...orders].reverse().map(o=><div className="admin-order" key={o.id}><div><strong>Order #{String(o.id).slice(-6)}</strong><p>{o.name} · {o.items.map(i=>`${i.name} × ${i.qty}`).join(", ")}</p><b>{money(o.total)}</b></div><div className="status-control"><span className="status-pill">{o.status}</span><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}><option>Order Placed</option><option>Preparing</option><option>Out for Delivery</option><option>Delivered</option></select></div></div>)}</div>}</>}</section>}
      </main>
      <footer><div className="footer-brand">Food<span>Express</span></div><p>Good food. Great moments. Delivered.</p><small>© {new Date().getFullYear()} FoodExpress. Made for food lovers.</small></footer>
    </div>
  );
}

function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label>; }
function AuthPanel({title,subtitle,children,onSubmit,button}) {
  return <section className="auth-wrap"><form className="panel auth-panel" onSubmit={onSubmit}><span className="auth-icon"><Utensils size={23}/></span><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}<button className="primary-btn full-btn" type="submit">{button} <span>→</span></button></form></section>;
}
function PageTitle({eyebrow,title,subtitle}) { return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>; }
function FoodGrid({items,onAdd}) {
  return <div className="food-grid">{items.map(item=><article className="food-card" key={item.id}><div className="food-image"><img src={item.img} alt={item.name}/><span>{item.category}</span></div><div className="food-details"><div><h3>{item.name}</h3><p>{item.restaurant}</p></div><div className="food-bottom"><strong>{money(item.price)}</strong><button onClick={()=>onAdd(item.id)} aria-label={`Add ${item.name} to cart`}><Plus size={18}/></button></div></div></article>)}</div>;
}
function EmptyState({text,action,onClick}) {
  return <div className="empty-state"><span>🍽️</span><h3>Nothing on the plate yet</h3><p>{text}</p>{action && <button className="primary-btn" onClick={onClick}>{action} →</button>}</div>;
}
function OrderList({orders,onBrowse}) {
  if (!orders.length) return <EmptyState text="You haven't placed an order yet." action="Explore the menu" onClick={onBrowse}/>;
  return <div className="order-grid">{[...orders].reverse().map(o=><article className="order-card" key={o.id}><div className="order-top"><span>ORDER #{String(o.id).slice(-6)}</span><span className="status-pill">{o.status}</span></div><h3>{o.items.map(i=>i.name).join(", ")}</h3><p>{o.createdAt || "Order placed"}</p><div className="summary-line"><span>Items</span><b>{o.items.reduce((s,i)=>s+i.qty,0)}</b></div><div className="summary-line"><span>Payment</span><b>{o.payment}</b></div><div className="summary-total"><span>Total paid</span><strong>{money(o.total)}</strong></div><p className="delivery-address">{o.address}</p></article>)}</div>;
}
