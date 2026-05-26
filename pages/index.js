import { useState, useEffect } from "react";
import Head from "next/head";
import { loadSettings, CATEGORIES, calculate } from "../lib/calc";
import SettingsModal from "../components/SettingsModal";

const fmt = (n) => "$" + (n || 0).toFixed(2);
const fmtPct = (n) => (n || 0).toFixed(1) + "%";

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Form state
  const [url, setUrl] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [productName, setProductName] = useState("");
  const [orangePrice, setOrangePrice] = useState("");
  const [category, setCategory] = useState("");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");
  const [weightAvg, setWeightAvg] = useState("");
  const [weightReason, setWeightReason] = useState("");
  const [manualWeight, setManualWeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [marginPct, setMarginPct] = useState("40");
  const [urlAnalyzed, setUrlAnalyzed] = useState(false);

  // Result state
  const [result, setResult] = useState(null);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setMarginPct(String(s.defaultMarginPct));
  }, []);

  const effectiveWeight = () => {
    if (manualWeight && parseFloat(manualWeight) > 0) return parseFloat(manualWeight);
    if (weightAvg && parseFloat(weightAvg) > 0) return parseFloat(weightAvg);
    if (category && CATEGORIES[category]) return CATEGORIES[category].weightAvg;
    return 0.6;
  };

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) return;
    setLoadingUrl(true);
    setUrlError("");
    setUrlAnalyzed(false);
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProductName(data.productName || "");
      setCategory(data.category || "otro");
      setWeightMin(String(data.weightMin || ""));
      setWeightMax(String(data.weightMax || ""));
      setWeightAvg(String(data.weightAvg || ""));
      setWeightReason(data.weightReason || "");
      if (data.priceHint) setOrangePrice(String(data.priceHint));
      setUrlAnalyzed(true);
    } catch (e) {
      setUrlError("No se pudo analizar la URL. Ingresá los datos manualmente.");
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleCalculate = () => {
    const price = parseFloat(orangePrice);
    if (!price || price <= 0) return alert("Ingresá el precio del producto.");
    const w = effectiveWeight();
    const res = calculate({
      productPrice: price,
      weight: w,
      quantity: parseInt(quantity) || 1,
      marginPct: parseFloat(marginPct) || 40,
      settings,
    });
    setResult({ ...res, weightUsed: w, weightMin: parseFloat(weightMin) || null, weightMax: parseFloat(weightMax) || null });
    setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleReset = () => {
    setUrl(""); setProductName(""); setOrangePrice(""); setCategory("");
    setWeightMin(""); setWeightMax(""); setWeightAvg(""); setWeightReason("");
    setManualWeight(""); setQuantity("1"); setResult(null); setUrlAnalyzed(false); setUrlError("");
    setMarginPct(String(settings?.defaultMarginPct || 40));
  };

  if (!settings) return null;

  const riskColor = result?.isAtRisk ? "#ef4444" : "#22c55e";
  const riskBg = result?.isAtRisk ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.08)";
  const riskBorder = result?.isAtRisk ? "rgba(239,68,68,.35)" : "rgba(34,197,94,.25)";

  return (
    <>
      <Head>
        <title>The Glitter Store — Simulador de Precios</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; color: #f0f0f5; font-family: 'Syne', sans-serif; min-height: 100vh; }
        body::before {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(0,229,180,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,180,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        input, select, textarea { font-family: 'Syne', sans-serif; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        ::selection { background: rgba(0,229,180,.3); }
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
        .fade-up { animation: fadeUp .4s ease both; }
        .fade-up-1 { animation: fadeUp .4s .08s ease both; }
        .fade-up-2 { animation: fadeUp .4s .16s ease both; }
        .fade-up-3 { animation: fadeUp .4s .24s ease both; }
      `}</style>

      {showSettings && (
        <SettingsModal settings={settings} onSave={s => { setSettings(s); setMarginPct(String(s.defaultMarginPct)); }} onClose={() => setShowSettings(false)} />
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 18px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1 }}>
              ✨ The Glitter Store
            </h1>
            <p style={{ color: "#6b6b85", fontSize: 12, marginTop: 6, fontFamily: "'DM Mono', monospace", letterSpacing: ".5px" }}>
              // simulador de precios · USA → Venezuela
            </p>
          </div>
          <button onClick={() => setShowSettings(true)} style={{
            background: "rgba(255,255,255,.05)", border: "1px solid #2a2a3a", color: "#f0f0f5",
            padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono', monospace",
            fontSize: 12, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6
          }}>⚙️ CONFIGURAR</button>
        </header>

        {/* STEP 1 — URL */}
        <Section num="01" title="URL del Producto" className="fade-up">
          <Row>
            <div style={{ flex: 1 }}>
              <Label>Pega el link de Shein, Temu, Amazon, etc.</Label>
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  value={url}
                  onChange={e => { setUrl(e.target.value); setUrlAnalyzed(false); }}
                  placeholder="https://shein.com/producto..."
                  onKeyDown={e => e.key === "Enter" && handleAnalyzeUrl()}
                  style={{ flex: 1 }}
                />
                <button onClick={handleAnalyzeUrl} disabled={loadingUrl || !url.trim()} style={{
                  background: loadingUrl ? "#2a2a3a" : "#00e5b4", color: loadingUrl ? "#6b6b85" : "#000",
                  border: "none", borderRadius: 8, padding: "10px 18px", cursor: loadingUrl ? "default" : "pointer",
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap",
                  transition: "all .2s", animation: loadingUrl ? "pulse 1s infinite" : "none"
                }}>
                  {loadingUrl ? "Analizando..." : "🔍 Analizar"}
                </button>
              </div>
              {urlError && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>{urlError}</p>}
            </div>
          </Row>

          {urlAnalyzed && (
            <div style={{ marginTop: 16, background: "rgba(0,229,180,.06)", border: "1px solid rgba(0,229,180,.2)", borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 11, color: "#00e5b4", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>✅ PRODUCTO DETECTADO</p>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{productName}</p>
              <p style={{ fontSize: 12, color: "#6b6b85", fontFamily: "'DM Mono', monospace" }}>
                {CATEGORIES[category]?.label} · Peso estimado: {weightMin}–{weightMax} lbs (prom. {weightAvg} lbs)
              </p>
              {weightReason && <p style={{ fontSize: 12, color: "#a0a0b8", marginTop: 6, fontStyle: "italic" }}>{weightReason}</p>}
            </div>
          )}
        </Section>

        {/* STEP 2 — Datos del producto */}
        <Section num="02" title="Datos del Producto" className="fade-up-1">
          <Row>
            <Field label="Nombre del producto">
              <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ej: Blusa floral manga corta" />
            </Field>
            <Field label="Precio naranja / oferta (USD)">
              <Input type="number" value={orangePrice} onChange={e => setOrangePrice(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </Field>
          </Row>
          <Row>
            <Field label="Categoría">
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Cantidad">
              <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1" min="1" />
            </Field>
          </Row>
        </Section>

        {/* STEP 3 — Peso */}
        <Section num="03" title="Peso del Producto" className="fade-up-1">
          <Row>
            <Field label="Peso mínimo (lbs)">
              <Input type="number" value={weightMin} onChange={e => setWeightMin(e.target.value)} placeholder="0.0" step="0.05" />
            </Field>
            <Field label="Peso máximo (lbs)">
              <Input type="number" value={weightMax} onChange={e => setWeightMax(e.target.value)} placeholder="0.0" step="0.05" />
            </Field>
            <Field label="Peso promedio (lbs)">
              <Input type="number" value={weightAvg} onChange={e => setWeightAvg(e.target.value)} placeholder="0.0" step="0.05" />
            </Field>
          </Row>
          <div style={{ marginTop: 4 }}>
            <Label>Peso manual exacto (override) — opcional</Label>
            <Input type="number" value={manualWeight} onChange={e => setManualWeight(e.target.value)} placeholder="Dejá vacío para usar el promedio" step="0.05" style={{ maxWidth: 220 }} />
          </div>
          <p style={{ fontSize: 11, color: "#6b6b85", marginTop: 10, fontFamily: "'DM Mono', monospace" }}>
            Peso usado en cálculo: <span style={{ color: "#00e5b4" }}>{effectiveWeight().toFixed(2)} lbs</span>
            {" · "}Costo envío: <span style={{ color: "#00e5b4" }}>{fmt(effectiveWeight() * settings.shippingRate)}/u</span>
            {" · "}Tarifa: ${settings.shippingRate}/lb
          </p>
        </Section>

        {/* STEP 4 — Margen */}
        <Section num="04" title="Margen de Ganancia" className="fade-up-2">
          <Row>
            <Field label={`Margen de ganancia (%) — mínimo alerta: $${settings.minProfitUSD}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="range" min="5" max="200" step="5" value={marginPct}
                  onChange={e => setMarginPct(e.target.value)}
                  style={{ flex: 1, accentColor: "#00e5b4", height: 6, cursor: "pointer" }}
                />
                <div style={{ minWidth: 60, textAlign: "center" }}>
                  <input
                    type="number" value={marginPct} onChange={e => setMarginPct(e.target.value)}
                    style={{ width: 60, background: "#0a0a0f", border: "1px solid #2a2a3a", color: "#00e5b4", padding: "6px 8px", borderRadius: 6, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, outline: "none" }}
                  />
                  <p style={{ fontSize: 10, color: "#6b6b85", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>%</p>
                </div>
              </div>
            </Field>
          </Row>
          <button onClick={handleCalculate} style={{
            marginTop: 20, width: "100%", padding: "16px", background: "#00e5b4",
            border: "none", borderRadius: 10, color: "#000", fontFamily: "'Syne', sans-serif",
            fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: ".5px", textTransform: "uppercase",
            transition: "all .2s", boxShadow: "0 0 0 0 rgba(0,229,180,.4)"
          }}
          onMouseEnter={e => e.target.style.boxShadow = "0 0 28px rgba(0,229,180,.4)"}
          onMouseLeave={e => e.target.style.boxShadow = "0 0 0 0 rgba(0,229,180,.4)"}
          >
            ⚡ CALCULAR PRECIO
          </button>
        </Section>

        {/* RESULTS */}
        {result && (
          <div id="results-section" style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Resultado{productName ? `: ${productName}` : ""}</h2>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #2a2a3a, transparent)" }} />
              <button onClick={handleReset} style={{ background: "transparent", border: "1px solid #2a2a3a", color: "#6b6b85", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>↺ Reiniciar</button>
            </div>

            {/* Risk alert */}
            {result.isAtRisk && (
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.4)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🚨</span>
                <div>
                  <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>Riesgo de pérdida</p>
                  <p style={{ color: "#fca5a5", fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                    Ganancia bruta ({fmt(result.grossProfit)}) está por debajo del mínimo (${settings.minProfitUSD}). Ajustá el margen.
                  </p>
                </div>
              </div>
            )}

            {/* Cost breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }} className="fade-up">
              {[
                { val: fmt(result.productTotal), lbl: `Producto × ${result.qty}` },
                { val: `${result.totalWeight.toFixed(2)} lbs`, lbl: "Peso total" },
                { val: fmt(result.shipping), lbl: "Envío" },
                { val: fmt(result.opCost + result.errorCost), lbl: "Costos extra" },
                { val: fmt(result.unitCost), lbl: "Costo real / u", accent: true },
              ].map(({ val, lbl, accent }) => (
                <div key={lbl} style={{ background: "#111118", border: `1px solid ${accent ? "rgba(0,229,180,.3)" : "#2a2a3a"}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: accent ? "#00e5b4" : "#f0f0f5", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 10, color: "#6b6b85", marginTop: 6, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'DM Mono', monospace" }}>{lbl}</p>
                </div>
              ))}
            </div>

            {/* Main price result */}
            <div style={{
              background: riskBg, border: `2px solid ${riskBorder}`,
              borderRadius: 14, padding: "28px 24px", marginBottom: 20,
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
              textAlign: "center"
            }} className="fade-up-1">
              <div>
                <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>PRECIO DE VENTA</p>
                <p style={{ fontSize: "clamp(28px,6vw,42px)", fontWeight: 800, fontFamily: "'DM Mono', monospace", color: riskColor, lineHeight: 1 }}>{fmt(result.salePrice)}</p>
                <p style={{ fontSize: 12, color: "#6b6b85", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>+{fmtPct(parseFloat(marginPct))} margen</p>
              </div>
              <div style={{ borderLeft: "1px solid #2a2a3a", borderRight: "1px solid #2a2a3a", padding: "0 16px" }}>
                <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>GANANCIA BRUTA</p>
                <p style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, fontFamily: "'DM Mono', monospace", color: result.grossProfit >= settings.minProfitUSD ? "#22c55e" : "#ef4444", lineHeight: 1 }}>{fmt(result.grossProfit)}</p>
                <p style={{ fontSize: 12, color: "#6b6b85", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>precio − costo</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>GANANCIA NETA</p>
                <p style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, fontFamily: "'DM Mono', monospace", color: result.netProfit > 0 ? "#a3e635" : "#ef4444", lineHeight: 1 }}>{fmt(result.netProfit)}</p>
                <p style={{ fontSize: 12, color: "#6b6b85", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>−costos operativos</p>
              </div>
            </div>

            {/* Diff explanation */}
            <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }} className="fade-up-2">
              <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 12 }}>DESGLOSE COMPLETO</p>
              {[
                { lbl: "Precio naranja (producto)", val: fmt(parseFloat(orangePrice) || 0), color: "#f0f0f5" },
                { lbl: `Envío (${result.totalWeight.toFixed(2)} lbs × $${settings.shippingRate}/lb)`, val: fmt(result.shipping), color: "#f0f0f5" },
                { lbl: `Costos operativos (${(settings.opCostPct * 100).toFixed(0)}%)`, val: fmt(result.opCost), color: "#f0f0f5" },
                { lbl: `Margen de error (${(settings.errorMarginPct * 100).toFixed(0)}%)`, val: fmt(result.errorCost), color: "#f0f0f5" },
                { lbl: "= COSTO REAL POR UNIDAD", val: fmt(result.unitCost), color: "#00e5b4", bold: true },
                { lbl: `+ Margen de ganancia (${marginPct}%)`, val: fmt(result.grossProfit), color: "#22c55e" },
                { lbl: "= PRECIO DE VENTA", val: fmt(result.salePrice), color: "#f0f0f5", bold: true },
                { lbl: "Ganancia bruta (precio − costo total)", val: fmt(result.grossProfit), color: "#22c55e" },
                { lbl: "Ganancia neta (bruta − costos op. extra)", val: fmt(result.netProfit), color: result.netProfit > 0 ? "#a3e635" : "#ef4444", bold: true },
              ].map(({ lbl, val, color, bold }) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <span style={{ fontSize: 13, color: bold ? "#f0f0f5" : "#9090a8", fontWeight: bold ? 700 : 400 }}>{lbl}</span>
                  <span style={{ fontSize: 14, color, fontFamily: "'DM Mono', monospace", fontWeight: bold ? 800 : 500 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Weight ranges if available */}
            {(result.weightMin || result.weightMax) && (
              <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 10, padding: "14px 18px" }} className="fade-up-3">
                <p style={{ fontSize: 11, color: "#a855f7", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>ESCENARIOS DE PESO</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {result.weightMin && (
                    <div>
                      <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace" }}>Mejor caso ({result.weightMin} lbs)</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", fontFamily: "'DM Mono', monospace" }}>
                        {fmt(result.salePrice - (result.totalWeight - result.weightMin) * settings.shippingRate / result.qty)}
                      </p>
                    </div>
                  )}
                  {result.weightMax && (
                    <div>
                      <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace" }}>Peor caso ({result.weightMax} lbs)</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#f97316", fontFamily: "'DM Mono', monospace" }}>
                        {fmt(result.salePrice + (result.weightMax - result.totalWeight) * settings.shippingRate / result.qty)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Helper components
function Section({ num, title, children, className }) {
  return (
    <div className={className} style={{ background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 12, padding: 24, marginBottom: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #00e5b4, transparent)" }} />
      <p style={{ fontSize: 11, color: "#6b6b85", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 18, textTransform: "uppercase" }}>
        {num} — {title}
      </p>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <label style={{ display: "block", fontSize: 11, color: "#6b6b85", marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: .5 }}>{children}</label>;
}

function Input({ style, ...props }) {
  return (
    <input {...props} style={{
      width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", color: "#f0f0f5",
      fontSize: 14, fontWeight: 600, padding: "10px 12px", borderRadius: 8, outline: "none",
      marginBottom: 14, transition: "border-color .2s",
      ...style
    }}
    onFocus={e => e.target.style.borderColor = "#00e5b4"}
    onBlur={e => e.target.style.borderColor = "#2a2a3a"}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select {...props} style={{
      width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", color: "#f0f0f5",
      fontSize: 14, fontWeight: 600, padding: "10px 12px", borderRadius: 8, outline: "none",
      marginBottom: 14, cursor: "pointer", appearance: "none"
    }}>
      {children}
    </select>
  );
}
