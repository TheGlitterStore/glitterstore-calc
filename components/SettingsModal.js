import { useState } from "react";
import { DEFAULT_SETTINGS, saveSettings } from "../lib/calc";

const S = {
  overlay: { position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 },
  box: { background:"#13131c",border:"1px solid #2a2a3a",borderRadius:16,padding:28,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",fontFamily:"'Syne',sans-serif" },
  title: { fontSize:18,fontWeight:800,color:"#f0f0f5",marginBottom:24 },
  section: { fontSize:10,letterSpacing:2,color:"#6b6b85",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:12,marginTop:20 },
  row: { marginBottom:14 },
  lbl: { display:"block",fontSize:11,color:"#6b6b85",marginBottom:5,fontFamily:"'DM Mono',monospace",letterSpacing:.5 },
  inp: { width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3a",color:"#f0f0f5",fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:600,padding:"9px 12px",borderRadius:8,outline:"none" },
  btnRow: { display:"flex",gap:10,marginTop:24 },
  btnSave: { flex:2,padding:"13px",background:"#00e5b4",border:"none",color:"#000",borderRadius:8,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800 },
  btnReset: { flex:1,padding:"13px",background:"transparent",border:"1px solid #2a2a3a",color:"#6b6b85",borderRadius:8,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:13 },
  note: { fontSize:11,color:"#6b6b85",fontFamily:"'DM Mono',monospace",marginTop:8,lineHeight:1.6 },
};

export default function SettingsModal({ settings, onSave, onClose }) {
  const [f, setF] = useState({ ...settings });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.box}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
          <h2 style={S.title}>⚙️ Configuración</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#6b6b85",fontSize:22,cursor:"pointer",lineHeight:1 }}>✕</button>
        </div>

        <p style={S.section}>💸 Tasas de cambio (Bs por $1 USD)</p>
        <p style={S.note}>Actualizá estas tasas manualmente cuando cambien.</p>

        {[
          { k:"tasaBCV",     label:"Tasa BCV (Bs/$)" },
          { k:"tasaBinance", label:"Tasa Binance (Bs/$)" },
          { k:"tasaEuro",    label:"Tasa Euro BCV (Bs/€)" },
        ].map(({ k, label }) => (
          <div key={k} style={S.row}>
            <label style={S.lbl}>{label}</label>
            <input type="number" step="0.01" value={f[k]} onChange={e => set(k, parseFloat(e.target.value)||0)} style={S.inp} />
          </div>
        ))}

        <p style={S.section}>📦 Costos de importación</p>
        {[
          { k:"shippingRate",   label:"Tarifa envío ($/lb)",          step:0.25, min:1 },
          { k:"opCostPct",      label:"Costos operativos (%)",         step:1,    min:0 },
          { k:"errorMarginPct", label:"Margen de error (%)",           step:1,    min:0 },
          { k:"minProfitUSD",   label:"Ganancia mínima alerta ($)",    step:0.5,  min:0 },
        ].map(({ k, label, step, min }) => (
          <div key={k} style={S.row}>
            <label style={S.lbl}>{label}</label>
            <input type="number" step={step} min={min} value={f[k]} onChange={e => set(k, parseFloat(e.target.value)||0)} style={S.inp} />
          </div>
        ))}

        <div style={S.btnRow}>
          <button onClick={() => setF({ ...DEFAULT_SETTINGS })} style={S.btnReset}>Restaurar</button>
          <button onClick={() => { saveSettings(f); onSave(f); onClose(); }} style={S.btnSave}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}
