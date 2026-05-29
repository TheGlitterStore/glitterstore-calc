import { useState, useEffect } from "react";
import Head from "next/head";
import { loadSettings, saveSettings, CATEGORIES, calcProduct, DEFAULT_SETTINGS } from "../lib/calc";
import SettingsModal from "../components/SettingsModal";

// ─── UTILS ───────────────────────────────────────────────────────────────────
const usd = (n) => "$" + (n || 0).toFixed(2);
const bs = (n) => "Bs. " + (n || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n) => (n || 0).toFixed(0) + "%";

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Card({ children, accent, style }) {
  return (
    <div style={{
      background: "#13131c", border: `1px solid ${accent ? "rgba(0,229,180,.35)" : "#22222f"}`,
      borderRadius: 12, padding: "22px 20px", position: "relative", overflow: "hidden", ...style
    }}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:2, background: accent ? "linear-gradient(90deg,#00e5b4,transparent)" : "linear-gradient(90deg,#2a2a3a,transparent)" }} />
      {children}
    </div>
  );
}

function SectionTitle({ num, label }) {
  return (
    <p style={{ fontSize:10,letterSpacing:2,color:"#6b6b85",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:16 }}>
      {num} — {label}
    </p>
  );
}

function Lbl({ children }) {
  return <label style={{ display:"block",fontSize:11,color:"#6b6b85",marginBottom:5,fontFamily:"'DM Mono',monospace",letterSpacing:.4 }}>{children}</label>;
}

function Inp({ style, ...p }) {
  const [focus, setFocus] = useState(false);
  return (
    <input {...p}
      onFocus={e => { setFocus(true); p.onFocus?.(e); }}
      onBlur={e => { setFocus(false); p.onBlur?.(e); }}
      style={{ width:"100%",background:"#0a0a0f",border:`1px solid ${focus?"#00e5b4":"#22222f"}`,color:"#f0f0f5",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:600,padding:"10px 12px",borderRadius:8,outline:"none",marginBottom:14,transition:"border-color .15s",...style }}
    />
  );
}

function Sel({ children, ...p }) {
  return (
    <select {...p} style={{ width:"100%",background:"#0a0a0f",border:"1px solid #22222f",color:p.value?"#f0f0f5":"#6b6b85",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:600,padding:"10px 12px",borderRadius:8,outline:"none",marginBottom:14,cursor:"pointer",appearance:"none" }}>
      {children}
    </select>
  );
}

function StatBox({ val, lbl, color, big }) {
  return (
    <div style={{ background:"#0a0a0f",border:"1px solid #22222f",borderRadius:10,padding:"14px 12px",textAlign:"center",flex:1,minWidth:110 }}>
      <p style={{ fontSize:big?22:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:color||"#f0f0f5",lineHeight:1 }}>{val}</p>
      <p style={{ fontSize:10,color:"#6b6b85",marginTop:6,letterSpacing:.8,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",lineHeight:1.3 }}>{lbl}</p>
    </div>
  );
}

function CurrencyRow({ label, usdVal, bsValBCV, bsValBinance, bsValEuro, highlight }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)",alignItems:"center" }}>
      <span style={{ fontSize:13,color:highlight?"#f0f0f5":"#9090a8",fontWeight:highlight?700:400 }}>{label}</span>
      <span style={{ fontSize:13,fontFamily:"'DM Mono',monospace",color:highlight?"#00e5b4":"#f0f0f5",fontWeight:highlight?800:500,textAlign:"right" }}>{usd(usdVal)}</span>
      <span style={{ fontSize:12,fontFamily:"'DM Mono',monospace",color:"#f59e0b",textAlign:"right" }}>{bs(bsValBCV)}</span>
      <span style={{ fontSize:12,fontFamily:"'DM Mono',monospace",color:"#a78bfa",textAlign:"right" }}>{bs(bsValBinance)}</span>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState("calc"); // "calc" | "cart"

  // Calculator state
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [manualWeight, setManualWeight] = useState("");
  const [qty, setQty] = useState("1");
  const [marginPct, setMarginPct] = useState("80");
  const [result, setResult] = useState(null);

  // Cart state
  const [cart, setCart] = useState([]);
  const [cartName, setCartName] = useState("");
  const [cartPrice, setCartPrice] = useState("");
  const [cartCat, setCartCat] = useState("");
  const [cartWeight, setCartWeight] = useState("");
  const [cartQty, setCartQty] = useState("1");
  const [cartMargin, setCartMargin] = useState("80");

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    // Load saved cart
    try {
      const c = localStorage.getItem("gs_cart");
      if (c) setCart(JSON.parse(c));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && cart.length > 0) {
      localStorage.setItem("gs_cart", JSON.stringify(cart));
    }
  }, [cart]);

  if (!settings) return null;

  const getWeight = (cat, manual) => {
    if (manual && parseFloat(manual) > 0) return parseFloat(manual);
    if (cat && CATEGORIES[cat]) return CATEGORIES[cat].weightAvg;
    return 0.5;
  };

  const getDefaultMargin = (cat) => {
    if (cat && CATEGORIES[cat]) return String(CATEGORIES[cat].marginSug);
    return "80";
  };

  const handleCategoryChange = (val, setMar) => {
    setMar(getDefaultMargin(val));
  };

  // ── CALCULATE ──
  const handleCalc = () => {
    const p = parseFloat(price);
    if (!p || p <= 0) return alert("Ingresá el precio del producto.");
    const w = getWeight(category, manualWeight);
    const r = calcProduct({ price: p, weight: w, qty: parseInt(qty)||1, marginPct: parseFloat(marginPct)||80, settings });
    setResult({ ...r, name: productName || "Producto", weightUsed: w, category });
    setTimeout(() => document.getElementById("res")?.scrollIntoView({ behavior:"smooth" }), 80);
  };

  // ── CART ──
  const addToCart = () => {
    const p = parseFloat(cartPrice);
    if (!p || p <= 0) return alert("Ingresá el precio.");
    const w = getWeight(cartCat, cartWeight);
    const r = calcProduct({ price: p, weight: w, qty: parseInt(cartQty)||1, marginPct: parseFloat(cartMargin)||80, settings });
    const item = { id: Date.now(), name: cartName || "Producto", category: cartCat, weight: w, qty: parseInt(cartQty)||1, price: p, marginPct: parseFloat(cartMargin)||80, result: r };
    setCart(prev => [...prev, item]);
    setCartName(""); setCartPrice(""); setCartCat(""); setCartWeight(""); setCartQty("1"); setCartMargin("80");
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { setCart([]); localStorage.removeItem("gs_cart"); };

  const cartTotals = cart.reduce((acc, item) => ({
    cost: acc.cost + item.result.unitCost * item.result.qty,
    sale: acc.sale + item.result.salePrice * item.result.qty,
    gross: acc.gross + item.result.grossProfit * item.result.qty,
    net: acc.net + item.result.netProfit * item.result.qty,
    weight: acc.weight + item.result.totalWeight,
  }), { cost:0, sale:0, gross:0, net:0, weight:0 });

  // ── STYLES ──
  const tabBtn = (t) => ({
    flex:1, padding:"12px 8px", background: tab===t ? "#00e5b4" : "transparent",
    border: tab===t ? "none" : "1px solid #22222f",
    color: tab===t ? "#000" : "#6b6b85",
    borderRadius:8, cursor:"pointer", fontFamily:"'Syne',sans-serif",
    fontSize:13, fontWeight:800, transition:"all .2s",
  });

  return (
    <>
      <Head>
        <title>✨ The Glitter Store — Precios</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0a0f;color:#f0f0f5;font-family:'Syne',sans-serif;min-height:100vh;}
        body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(0,229,180,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,180,.02) 1px,transparent 1px);background-size:44px 44px;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
        input[type=number]{-moz-appearance:textfield;}
        select option{background:#13131c;color:#f0f0f5;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .35s ease both;}
        .fu1{animation:fadeUp .35s .07s ease both;}
        .fu2{animation:fadeUp .35s .14s ease both;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0a0a0f;}
        ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px;}
      `}</style>

      {showSettings && <SettingsModal settings={settings} onSave={s => setSettings(s)} onClose={() => setShowSettings(false)} />}

      <div style={{ maxWidth:860,margin:"0 auto",padding:"28px 16px 80px",position:"relative",zIndex:1 }}>

        {/* HEADER */}
        <header style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,flexWrap:"wrap",gap:12 }}>
          <div>
            <h1 style={{ fontSize:"clamp(24px,5vw,38px)",fontWeight:800,letterSpacing:"-1.5px",lineHeight:1 }}>
              ✨ The Glitter Store
            </h1>
            <p style={{ color:"#6b6b85",fontSize:11,marginTop:5,fontFamily:"'DM Mono',monospace",letterSpacing:.5 }}>
              simulador de precios · USA → Venezuela
            </p>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
            {/* Rates display */}
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {[
                { lbl:"BCV",     val:settings.tasaBCV,     color:"#f59e0b" },
                { lbl:"Binance", val:settings.tasaBinance, color:"#a78bfa" },
                { lbl:"€ BCV",   val:settings.tasaEuro,    color:"#38bdf8" },
              ].map(({ lbl, val, color }) => (
                <div key={lbl} onClick={() => setShowSettings(true)} style={{ background:"rgba(255,255,255,.04)",border:"1px solid #22222f",borderRadius:6,padding:"5px 10px",cursor:"pointer",textAlign:"center" }}>
                  <p style={{ fontSize:9,color:"#6b6b85",fontFamily:"'DM Mono',monospace",letterSpacing:1 }}>{lbl}</p>
                  <p style={{ fontSize:12,color,fontFamily:"'DM Mono',monospace",fontWeight:700 }}>Bs.{val}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSettings(true)} style={{ background:"rgba(255,255,255,.05)",border:"1px solid #22222f",color:"#f0f0f5",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:1 }}>
              ⚙️ CONFIG
            </button>
          </div>
        </header>

        {/* TABS */}
        <div style={{ display:"flex",gap:8,marginBottom:24 }}>
          <button style={tabBtn("calc")} onClick={() => setTab("calc")}>🧮 Calculadora</button>
          <button style={tabBtn("cart")} onClick={() => setTab("cart")}>🛒 Carrito {cart.length > 0 && `(${cart.length})`}</button>
        </div>

        {/* ══════════ CALCULADORA TAB ══════════ */}
        {tab === "calc" && (
          <div className="fu">
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

              {/* Producto */}
              <Card>
                <SectionTitle num="01" label="Producto" />
                <Lbl>Nombre (opcional)</Lbl>
                <Inp value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ej: Funda iPhone 15..." />
                <Lbl>Precio naranja / oferta (USD $)</Lbl>
                <Inp type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" />
                <Lbl>Cantidad</Lbl>
                <Inp type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="1" min="1" />
              </Card>

              {/* Categoría y Peso */}
              <Card>
                <SectionTitle num="02" label="Categoría y Peso" />
                <Lbl>Categoría del producto</Lbl>
                <Sel value={category} onChange={e => { setCategory(e.target.value); handleCategoryChange(e.target.value, setMarginPct); }}>
                  <option value="">— Seleccionar categoría —</option>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </Sel>

                {category && CATEGORIES[category] && (
                  <div style={{ background:"rgba(0,229,180,.05)",border:"1px solid rgba(0,229,180,.15)",borderRadius:8,padding:"10px 12px",marginBottom:14 }}>
                    <p style={{ fontSize:11,color:"#00e5b4",fontFamily:"'DM Mono',monospace",marginBottom:4 }}>📦 Peso estimado:</p>
                    <p style={{ fontSize:13,color:"#f0f0f5",fontFamily:"'DM Mono',monospace" }}>
                      {CATEGORIES[category].weightMin} – {CATEGORIES[category].weightMax} lbs
                      <span style={{ color:"#6b6b85" }}> (prom. {CATEGORIES[category].weightAvg} lbs)</span>
                    </p>
                    <p style={{ fontSize:10,color:"#6b6b85",marginTop:4,fontFamily:"'DM Mono',monospace" }}>
                      Costo envío prom: {usd(CATEGORIES[category].weightAvg * settings.shippingRate)}
                    </p>
                  </div>
                )}

                <Lbl>Peso exacto (lbs) — override opcional</Lbl>
                <Inp type="number" value={manualWeight} onChange={e => setManualWeight(e.target.value)} placeholder={category && CATEGORIES[category] ? `Default: ${CATEGORIES[category].weightAvg} lbs` : "0.00"} step="0.01" />
              </Card>
            </div>

            {/* Margen */}
            <Card style={{ marginTop:16 }}>
              <SectionTitle num="03" label="Margen de Ganancia" />
              <div style={{ display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
                <div style={{ flex:1,minWidth:200 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                    <Lbl>Margen de ganancia</Lbl>
                    {category && CATEGORIES[category] && (
                      <span style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}>
                        Rango: {CATEGORIES[category].marginMin}%–{CATEGORIES[category].marginMax}%
                      </span>
                    )}
                  </div>
                  <input type="range" min="5" max="250" step="5" value={marginPct}
                    onChange={e => setMarginPct(e.target.value)}
                    style={{ width:"100%",accentColor:"#00e5b4",cursor:"pointer" }} />
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                    <span style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}>5%</span>
                    <span style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}>250%</span>
                  </div>
                </div>
                <div>
                  <input type="number" value={marginPct} onChange={e => setMarginPct(e.target.value)} min="5" max="300"
                    style={{ width:72,background:"#0a0a0f",border:"1px solid #22222f",color:"#00e5b4",fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:800,padding:"8px",borderRadius:8,textAlign:"center",outline:"none" }} />
                  <p style={{ fontSize:10,color:"#6b6b85",textAlign:"center",marginTop:4,fontFamily:"'DM Mono',monospace" }}>%</p>
                </div>
                {category && CATEGORIES[category] && (
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {[
                      { lbl:"Mínimo", val:CATEGORIES[category].marginMin, color:"#6b6b85" },
                      { lbl:"Sugerido", val:CATEGORIES[category].marginSug, color:"#00e5b4" },
                      { lbl:"Alto", val:CATEGORIES[category].marginMax, color:"#f97316" },
                    ].map(({ lbl, val, color }) => (
                      <button key={lbl} onClick={() => setMarginPct(String(val))} style={{ background:"rgba(255,255,255,.04)",border:`1px solid ${color}33`,color,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700 }}>
                        {lbl} {val}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleCalc} style={{ width:"100%",marginTop:18,padding:16,background:"#00e5b4",border:"none",borderRadius:10,color:"#000",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,cursor:"pointer",letterSpacing:.5,textTransform:"uppercase",transition:"all .2s" }}
                onMouseEnter={e => e.target.style.boxShadow="0 0 28px rgba(0,229,180,.4)"}
                onMouseLeave={e => e.target.style.boxShadow="none"}>
                ⚡ CALCULAR PRECIO
              </button>
            </Card>

            {/* RESULTS */}
            {result && (
              <div id="res" className="fu1" style={{ marginTop:20 }}>

                {/* Risk alert */}
                {result.isAtRisk && (
                  <div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.45)",borderRadius:10,padding:"14px 18px",marginBottom:16,display:"flex",gap:10,alignItems:"center" }}>
                    <span style={{ fontSize:22 }}>🚨</span>
                    <div>
                      <p style={{ color:"#ef4444",fontWeight:800,fontSize:14 }}>Riesgo de pérdida</p>
                      <p style={{ color:"#fca5a5",fontSize:12,fontFamily:"'DM Mono',monospace",marginTop:2 }}>
                        Ganancia ({usd(result.grossProfit)}) está por debajo del mínimo ({usd(settings.minProfitUSD)}). Subí el margen.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stat boxes */}
                <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:14 }}>
                  <StatBox val={`${result.totalWeight.toFixed(2)} lbs`} lbl="Peso total" />
                  <StatBox val={usd(result.shipping)} lbl="Costo envío" />
                  <StatBox val={usd(result.opCost + result.errorCost)} lbl="Costos extra" />
                  <StatBox val={usd(result.unitCost)} lbl="Costo real/u" color="#00e5b4" big />
                </div>

                {/* Main result card */}
                <Card accent style={{ marginBottom:14 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,textAlign:"center" }}>
                    <div>
                      <p style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace",letterSpacing:1,marginBottom:8,textTransform:"uppercase" }}>Precio de Venta</p>
                      <p style={{ fontSize:"clamp(26px,5vw,38px)",fontWeight:800,fontFamily:"'DM Mono',monospace",color:result.isAtRisk?"#ef4444":"#00e5b4",lineHeight:1 }}>{usd(result.salePrice)}</p>
                      <p style={{ fontSize:11,color:"#6b6b85",marginTop:5,fontFamily:"'DM Mono',monospace" }}>+{pct(result.marginPct)} margen</p>
                    </div>
                    <div style={{ borderLeft:"1px solid #22222f",borderRight:"1px solid #22222f",padding:"0 8px" }}>
                      <p style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace",letterSpacing:1,marginBottom:8,textTransform:"uppercase" }}>Ganancia Bruta</p>
                      <p style={{ fontSize:"clamp(22px,4vw,32px)",fontWeight:800,fontFamily:"'DM Mono',monospace",color:result.grossProfit>=settings.minProfitUSD?"#22c55e":"#ef4444",lineHeight:1 }}>{usd(result.grossProfit)}</p>
                      <p style={{ fontSize:11,color:"#6b6b85",marginTop:5,fontFamily:"'DM Mono',monospace" }}>precio − costo</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace",letterSpacing:1,marginBottom:8,textTransform:"uppercase" }}>Ganancia Neta</p>
                      <p style={{ fontSize:"clamp(22px,4vw,32px)",fontWeight:800,fontFamily:"'DM Mono',monospace",color:result.netProfit>0?"#a3e635":"#ef4444",lineHeight:1 }}>{usd(result.netProfit)}</p>
                      <p style={{ fontSize:11,color:"#6b6b85",marginTop:5,fontFamily:"'DM Mono',monospace" }}>−costos op.</p>
                    </div>
                  </div>
                </Card>

                {/* Currency table */}
                <Card style={{ marginBottom:14 }}>
                  <SectionTitle num="💱" label="Precios en todas las monedas" />
                  <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:10 }}>
                    <span style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}></span>
                    <span style={{ fontSize:10,color:"#00e5b4",fontFamily:"'DM Mono',monospace",textAlign:"right",letterSpacing:1 }}>USD</span>
                    <span style={{ fontSize:10,color:"#f59e0b",fontFamily:"'DM Mono',monospace",textAlign:"right",letterSpacing:1 }}>Bs BCV</span>
                    <span style={{ fontSize:10,color:"#a78bfa",fontFamily:"'DM Mono',monospace",textAlign:"right",letterSpacing:1 }}>Bs Binance</span>
                  </div>
                  <CurrencyRow label="Costo real / unidad" usdVal={result.unitCost} bsValBCV={result.unitCost*settings.tasaBCV} bsValBinance={result.unitCost*settings.tasaBinance} />
                  <CurrencyRow label={`Precio de venta (+${pct(result.marginPct)})`} usdVal={result.salePrice} bsValBCV={result.salePriceBCV} bsValBinance={result.salePriceBinance} highlight />
                  <CurrencyRow label="Ganancia bruta" usdVal={result.grossProfit} bsValBCV={result.grossProfit*settings.tasaBCV} bsValBinance={result.grossProfit*settings.tasaBinance} />
                  <CurrencyRow label="Ganancia neta" usdVal={result.netProfit} bsValBCV={result.netProfit*settings.tasaBCV} bsValBinance={result.netProfit*settings.tasaBinance} />
                  <p style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace",marginTop:12,lineHeight:1.7 }}>
                    Tasas usadas: BCV Bs.{settings.tasaBCV} · Binance Bs.{settings.tasaBinance} · Euro Bs.{settings.tasaEuro} — <span style={{ color:"#00e5b4",cursor:"pointer",textDecoration:"underline" }} onClick={() => setShowSettings(true)}>actualizar tasas</span>
                  </p>
                </Card>

                {/* Desglose */}
                <Card style={{ marginBottom:14 }}>
                  <SectionTitle num="📋" label="Desglose completo" />
                  {[
                    { lbl:"Precio naranja (producto × " + result.qty + ")", val: result.productTotal },
                    { lbl:`Envío (${result.totalWeight.toFixed(2)} lbs × $${settings.shippingRate}/lb)`, val: result.shipping },
                    { lbl:`Costos operativos (${settings.opCostPct}%)`, val: result.opCost },
                    { lbl:`Margen de error (${settings.errorMarginPct}%)`, val: result.errorCost },
                    { lbl:"= COSTO REAL POR UNIDAD", val: result.unitCost, accent:"#00e5b4", bold:true },
                    { lbl:`+ Margen de ganancia (${pct(result.marginPct)})`, val: result.grossProfit, accent:"#22c55e" },
                    { lbl:"= PRECIO DE VENTA", val: result.salePrice, bold:true },
                    { lbl:"Ganancia bruta (venta − costo)", val: result.grossProfit, accent:result.grossProfit>=settings.minProfitUSD?"#22c55e":"#ef4444" },
                    { lbl:"Ganancia neta (bruta − costos extra)", val: result.netProfit, accent:result.netProfit>0?"#a3e635":"#ef4444", bold:true },
                  ].map(({ lbl, val, accent, bold }) => (
                    <div key={lbl} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ fontSize:13,color:bold?"#f0f0f5":"#9090a8",fontWeight:bold?700:400 }}>{lbl}</span>
                      <span style={{ fontSize:14,color:accent||"#f0f0f5",fontFamily:"'DM Mono',monospace",fontWeight:bold?800:500 }}>{usd(val)}</span>
                    </div>
                  ))}
                </Card>

                {/* Add to cart button */}
                <button onClick={() => {
                  const item = { id: Date.now(), name: result.name, category, weight: result.totalWeight/result.qty, qty: result.qty, price: parseFloat(price), marginPct: parseFloat(marginPct), result };
                  setCart(prev => [...prev, item]);
                  setTab("cart");
                }} style={{ width:"100%",padding:13,background:"transparent",border:"1px solid #22222f",color:"#f0f0f5",borderRadius:10,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,transition:"all .2s" }}
                  onMouseEnter={e => e.target.style.borderColor="#00e5b4"}
                  onMouseLeave={e => e.target.style.borderColor="#22222f"}>
                  🛒 Agregar al carrito
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════ CARRITO TAB ══════════ */}
        {tab === "cart" && (
          <div className="fu">
            {/* Add to cart form */}
            <Card style={{ marginBottom:16 }}>
              <SectionTitle num="+" label="Agregar producto al carrito" />
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <Lbl>Nombre</Lbl>
                  <Inp value={cartName} onChange={e => setCartName(e.target.value)} placeholder="Nombre del producto" />
                  <Lbl>Precio naranja (USD)</Lbl>
                  <Inp type="number" value={cartPrice} onChange={e => setCartPrice(e.target.value)} placeholder="0.00" step="0.01" />
                  <Lbl>Cantidad</Lbl>
                  <Inp type="number" value={cartQty} onChange={e => setCartQty(e.target.value)} placeholder="1" min="1" />
                </div>
                <div>
                  <Lbl>Categoría</Lbl>
                  <Sel value={cartCat} onChange={e => { setCartCat(e.target.value); handleCategoryChange(e.target.value, setCartMargin); }}>
                    <option value="">— Categoría —</option>
                    {Object.entries(CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </Sel>
                  <Lbl>Peso exacto (lbs) — opcional</Lbl>
                  <Inp type="number" value={cartWeight} onChange={e => setCartWeight(e.target.value)} placeholder={cartCat && CATEGORIES[cartCat] ? `${CATEGORIES[cartCat].weightAvg} lbs` : "0.00"} step="0.01" />
                  <Lbl>Margen (%)</Lbl>
                  <Inp type="number" value={cartMargin} onChange={e => setCartMargin(e.target.value)} placeholder="80" min="5" />
                </div>
              </div>
              <button onClick={addToCart} style={{ width:"100%",padding:13,background:"#00e5b4",border:"none",borderRadius:10,color:"#000",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,cursor:"pointer" }}>
                + Agregar al carrito
              </button>
            </Card>

            {/* Cart items */}
            {cart.length === 0 ? (
              <div style={{ textAlign:"center",padding:"48px 20px",color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}>
                <p style={{ fontSize:32,marginBottom:12 }}>🛒</p>
                <p>El carrito está vacío.</p>
                <p style={{ fontSize:12,marginTop:6 }}>Agregá productos desde la calculadora o desde aquí.</p>
              </div>
            ) : (
              <>
                {/* Item list */}
                <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:16 }}>
                  {cart.map((item, i) => (
                    <Card key={item.id} accent={item.result.isAtRisk ? false : true} style={{ borderColor: item.result.isAtRisk ? "rgba(239,68,68,.35)" : undefined }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap" }}>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700,fontSize:14,marginBottom:4 }}>
                            {item.result.isAtRisk && <span style={{ color:"#ef4444",marginRight:6 }}>🚨</span>}
                            {item.name}
                          </p>
                          <p style={{ fontSize:11,color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}>
                            {CATEGORIES[item.category]?.label || "General"} · {item.result.totalWeight.toFixed(2)} lbs · ×{item.qty} · {pct(item.marginPct)} margen
                          </p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:12 }}>✕</button>
                      </div>
                      <div style={{ display:"flex",gap:8,marginTop:10,flexWrap:"wrap" }}>
                        {[
                          { lbl:"Costo/u",  val:usd(item.result.unitCost),    color:"#f0f0f5" },
                          { lbl:"Venta/u",  val:usd(item.result.salePrice),   color:"#00e5b4" },
                          { lbl:"G. bruta", val:usd(item.result.grossProfit), color:item.result.grossProfit>=settings.minProfitUSD?"#22c55e":"#ef4444" },
                          { lbl:"G. neta",  val:usd(item.result.netProfit),   color:item.result.netProfit>0?"#a3e635":"#ef4444" },
                          { lbl:"Bs BCV",   val:bs(item.result.salePriceBCV), color:"#f59e0b" },
                          { lbl:"Bs Bin.",  val:bs(item.result.salePriceBinance), color:"#a78bfa" },
                        ].map(({ lbl, val, color }) => (
                          <div key={lbl} style={{ background:"#0a0a0f",border:"1px solid #22222f",borderRadius:7,padding:"7px 10px",textAlign:"center",minWidth:90 }}>
                            <p style={{ fontSize:12,fontFamily:"'DM Mono',monospace",color,fontWeight:700,lineHeight:1 }}>{val}</p>
                            <p style={{ fontSize:10,color:"#6b6b85",marginTop:4,letterSpacing:.5,fontFamily:"'DM Mono',monospace" }}>{lbl}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Cart totals */}
                <Card accent style={{ marginBottom:14 }}>
                  <SectionTitle num="∑" label={`Total del carrito (${cart.length} producto${cart.length>1?"s":""})`} />
                  <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:16 }}>
                    <StatBox val={usd(cartTotals.cost)}  lbl="Costo total"   />
                    <StatBox val={usd(cartTotals.sale)}  lbl="Venta total"   color="#00e5b4" big />
                    <StatBox val={usd(cartTotals.gross)} lbl="G. bruta total" color="#22c55e" />
                    <StatBox val={usd(cartTotals.net)}   lbl="G. neta total"  color={cartTotals.net>0?"#a3e635":"#ef4444"} />
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:6 }}>
                    <span style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace" }}></span>
                    <span style={{ fontSize:10,color:"#f59e0b",fontFamily:"'DM Mono',monospace",textAlign:"right" }}>Bs BCV</span>
                    <span style={{ fontSize:10,color:"#a78bfa",fontFamily:"'DM Mono',monospace",textAlign:"right" }}>Bs Binance</span>
                  </div>
                  {[
                    { lbl:"Total venta",   bcv: cartTotals.sale*settings.tasaBCV,   bin: cartTotals.sale*settings.tasaBinance,   bold:true },
                    { lbl:"Ganancia bruta",bcv: cartTotals.gross*settings.tasaBCV,  bin: cartTotals.gross*settings.tasaBinance },
                    { lbl:"Ganancia neta", bcv: cartTotals.net*settings.tasaBCV,    bin: cartTotals.net*settings.tasaBinance,    bold:true },
                  ].map(({ lbl, bcv, bin, bold }) => (
                    <div key={lbl} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ fontSize:13,color:bold?"#f0f0f5":"#9090a8",fontWeight:bold?700:400 }}>{lbl}</span>
                      <span style={{ fontSize:12,fontFamily:"'DM Mono',monospace",color:"#f59e0b",textAlign:"right",fontWeight:bold?800:500 }}>{bs(bcv)}</span>
                      <span style={{ fontSize:12,fontFamily:"'DM Mono',monospace",color:"#a78bfa",textAlign:"right",fontWeight:bold?800:500 }}>{bs(bin)}</span>
                    </div>
                  ))}
                  <p style={{ fontSize:10,color:"#6b6b85",fontFamily:"'DM Mono',monospace",marginTop:10 }}>
                    Peso total del carrito: {cartTotals.weight.toFixed(2)} lbs · Envío estimado: {usd(cartTotals.weight * settings.shippingRate)}
                  </p>
                </Card>

                <button onClick={clearCart} style={{ width:"100%",padding:12,background:"transparent",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444",borderRadius:10,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700 }}>
                  🗑️ Vaciar carrito
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </>
  );
}
