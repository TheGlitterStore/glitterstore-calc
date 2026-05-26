import { useState } from "react";
import { DEFAULT_SETTINGS, saveSettings } from "../lib/calc";

export default function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    saveSettings(form);
    onSave(form);
    onClose();
  };

  const handleReset = () => setForm({ ...DEFAULT_SETTINGS });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 16,
        padding: 32, width: "100%", maxWidth: 440, fontFamily: "'Syne', sans-serif"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f5" }}>⚙️ Configuración</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b6b85", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {[
          { key: "shippingRate", label: "Tarifa de envío ($/lb)", step: 0.25, min: 1 },
          { key: "opCostPct",    label: "Costos operativos (%)", step: 1, min: 0, pct: true },
          { key: "errorMarginPct", label: "Margen de error (%)", step: 1, min: 0, pct: true },
          { key: "minProfitUSD", label: "Ganancia mínima alerta ($)", step: 0.5, min: 0 },
          { key: "defaultMarginPct", label: "Margen de ganancia default (%)", step: 5, min: 5, pct2: true },
        ].map(({ key, label, step, min, pct, pct2 }) => (
          <div key={key} style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: "#6b6b85", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              {label}
            </label>
            <input
              type="number"
              step={step}
              min={min}
              value={pct ? (form[key] * 100).toFixed(0) : pct2 ? form[key] : form[key]}
              onChange={e => {
                const v = parseFloat(e.target.value) || 0;
                set(key, pct ? v / 100 : v);
              }}
              style={{
                width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a",
                color: "#f0f0f5", fontFamily: "'DM Mono', monospace", fontSize: 16,
                padding: "10px 14px", borderRadius: 8, outline: "none"
              }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={handleReset} style={{
            flex: 1, padding: "12px", background: "transparent", border: "1px solid #2a2a3a",
            color: "#6b6b85", borderRadius: 8, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 13
          }}>Restaurar defaults</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "12px", background: "#00e5b4", border: "none",
            color: "#000", borderRadius: 8, cursor: "pointer", fontFamily: "'Syne', sans-serif",
            fontSize: 14, fontWeight: 800
          }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
