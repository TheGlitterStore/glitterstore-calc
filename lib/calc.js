// ─── CATEGORÍAS CON PESOS EXACTOS ───────────────────────────────────────────
export const CATEGORIES = {
  // ROPA
  ropa_top:         { label: "👕 Tops / Blusas / Camisetas",    weightMin: 0.20, weightMax: 0.40, weightAvg: 0.30, marginMin: 60,  marginSug: 90,  marginMax: 130 },
  ropa_vestido:     { label: "👗 Vestidos",                     weightMin: 0.30, weightMax: 0.55, weightAvg: 0.42, marginMin: 55,  marginSug: 85,  marginMax: 120 },
  ropa_pantalon:    { label: "👖 Pantalones / Jeans",           weightMin: 0.70, weightMax: 1.20, weightAvg: 0.90, marginMin: 45,  marginSug: 70,  marginMax: 100 },
  ropa_hoodie:      { label: "🧥 Hoodies / Suéteres",           weightMin: 0.80, weightMax: 1.50, weightAvg: 1.10, marginMin: 45,  marginSug: 65,  marginMax: 95  },
  ropa_ropa_interior:{ label:"🩲 Ropa interior / Pijamas",      weightMin: 0.15, weightMax: 0.35, weightAvg: 0.22, marginMin: 65,  marginSug: 100, marginMax: 150 },
  ropa_traje_baño:  { label: "👙 Trajes de baño",               weightMin: 0.20, weightMax: 0.40, weightAvg: 0.28, marginMin: 60,  marginSug: 90,  marginMax: 130 },
  ropa_abrigo:      { label: "🧣 Abrigos / Chaquetas",          weightMin: 1.00, weightMax: 2.00, weightAvg: 1.40, marginMin: 35,  marginSug: 55,  marginMax: 80  },

  // CALZADO
  zapatos_mujer:    { label: "👠 Zapatos de mujer",             weightMin: 1.00, weightMax: 1.80, weightAvg: 1.30, marginMin: 40,  marginSug: 60,  marginMax: 90  },
  zapatos_tenis:    { label: "👟 Tenis / Sneakers",             weightMin: 1.20, weightMax: 2.20, weightAvg: 1.60, marginMin: 35,  marginSug: 55,  marginMax: 80  },
  zapatos_sandalias:{ label: "🩴 Sandalias / Chancletas",       weightMin: 0.40, weightMax: 0.90, weightAvg: 0.60, marginMin: 55,  marginSug: 80,  marginMax: 120 },

  // ACCESORIOS
  acc_cartera:      { label: "👜 Carteras / Bolsos",            weightMin: 0.30, weightMax: 0.90, weightAvg: 0.55, marginMin: 55,  marginSug: 85,  marginMax: 130 },
  acc_bisuteria:    { label: "💍 Bisutería / Aretes / Collares",weightMin: 0.05, weightMax: 0.20, weightAvg: 0.10, marginMin: 80,  marginSug: 130, marginMax: 200 },
  acc_gafas:        { label: "🕶️ Gafas de sol",                 weightMin: 0.10, weightMax: 0.25, weightAvg: 0.15, marginMin: 70,  marginSug: 110, marginMax: 160 },
  acc_cinturon:     { label: "🪢 Cinturones",                   weightMin: 0.15, weightMax: 0.35, weightAvg: 0.22, marginMin: 65,  marginSug: 100, marginMax: 150 },
  acc_gorra:        { label: "🧢 Gorras / Sombreros",           weightMin: 0.15, weightMax: 0.35, weightAvg: 0.22, marginMin: 65,  marginSug: 100, marginMax: 150 },
  acc_mochila:      { label: "🎒 Mochilas",                     weightMin: 0.50, weightMax: 1.20, weightAvg: 0.80, marginMin: 45,  marginSug: 70,  marginMax: 100 },

  // TECNOLOGÍA Y CELULARES
  tech_funda:       { label: "📱 Fundas de celular",            weightMin: 0.05, weightMax: 0.12, weightAvg: 0.08, marginMin: 100, marginSug: 160, marginMax: 250 },
  tech_accesorios:  { label: "🔌 Accesorios celular (cables, cargadores)", weightMin: 0.10, weightMax: 0.40, weightAvg: 0.22, marginMin: 70, marginSug: 110, marginMax: 160 },
  tech_audifonos:   { label: "🎧 Audífonos / Earbuds",         weightMin: 0.15, weightMax: 0.50, weightAvg: 0.28, marginMin: 55,  marginSug: 85,  marginMax: 130 },
  tech_smartwatch:  { label: "⌚ Smartwatch / Relojes",         weightMin: 0.20, weightMax: 0.50, weightAvg: 0.30, marginMin: 40,  marginSug: 65,  marginMax: 100 },
  tech_gadget:      { label: "💡 Gadgets / Electrónicos varios",weightMin: 0.30, weightMax: 1.50, weightAvg: 0.70, marginMin: 35,  marginSug: 55,  marginMax: 85  },

  // MAQUILLAJE Y CUIDADO
  beauty_labial:    { label: "💄 Labiales / Lip gloss",         weightMin: 0.05, weightMax: 0.15, weightAvg: 0.09, marginMin: 80,  marginSug: 130, marginMax: 200 },
  beauty_set:       { label: "🎨 Sets de maquillaje",           weightMin: 0.30, weightMax: 1.00, weightAvg: 0.55, marginMin: 50,  marginSug: 80,  marginMax: 120 },
  beauty_skincare:  { label: "🧴 Skincare / Cremas",            weightMin: 0.20, weightMax: 0.80, weightAvg: 0.40, marginMin: 50,  marginSug: 80,  marginMax: 120 },
  beauty_perfume:   { label: "🌸 Perfumes / Body splash",       weightMin: 0.20, weightMax: 0.60, weightAvg: 0.35, marginMin: 55,  marginSug: 85,  marginMax: 130 },
  beauty_cabello:   { label: "💇 Accesorios de cabello",        weightMin: 0.05, weightMax: 0.25, weightAvg: 0.12, marginMin: 80,  marginSug: 130, marginMax: 200 },
  beauty_unas:      { label: "💅 Uñas / Nail art",              weightMin: 0.05, weightMax: 0.20, weightAvg: 0.10, marginMin: 85,  marginSug: 140, marginMax: 210 },

  // HOGAR
  hogar_deco:       { label: "🏠 Decoración hogar pequeña",     weightMin: 0.30, weightMax: 1.50, weightAvg: 0.80, marginMin: 45,  marginSug: 70,  marginMax: 110 },
  hogar_lampara:    { label: "🪔 Lámparas / Luces LED",         weightMin: 0.50, weightMax: 2.00, weightAvg: 1.00, marginMin: 40,  marginSug: 65,  marginMax: 100 },
  hogar_cocina:     { label: "🍳 Utensilios de cocina",         weightMin: 0.40, weightMax: 2.50, weightAvg: 1.20, marginMin: 40,  marginSug: 60,  marginMax: 90  },
  hogar_textil:     { label: "🛏️ Textiles hogar (cojines, etc)",weightMin: 0.30, weightMax: 1.50, weightAvg: 0.70, marginMin: 45,  marginSug: 70,  marginMax: 105 },
  hogar_organizador:{ label: "🗂️ Organizadores / Cajas",        weightMin: 0.20, weightMax: 1.50, weightAvg: 0.70, marginMin: 45,  marginSug: 70,  marginMax: 110 },

  // JUGUETES Y NIÑOS
  juguetes_pequeno: { label: "🧸 Juguetes pequeños",            weightMin: 0.20, weightMax: 0.80, weightAvg: 0.45, marginMin: 55,  marginSug: 85,  marginMax: 130 },
  juguetes_mediano: { label: "🎮 Juguetes medianos",            weightMin: 0.80, weightMax: 2.00, weightAvg: 1.30, marginMin: 40,  marginSug: 65,  marginMax: 95  },
  juguetes_ropa_nino:{ label:"👶 Ropa de niños",                weightMin: 0.15, weightMax: 0.40, weightAvg: 0.25, marginMin: 60,  marginSug: 95,  marginMax: 140 },

  // MASCOTAS
  mascotas_ropa:    { label: "🐾 Ropa para mascotas",           weightMin: 0.10, weightMax: 0.35, weightAvg: 0.18, marginMin: 70,  marginSug: 110, marginMax: 170 },
  mascotas_acc:     { label: "🦮 Accesorios mascotas",          weightMin: 0.15, weightMax: 0.60, weightAvg: 0.30, marginMin: 60,  marginSug: 95,  marginMax: 145 },
};

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  shippingRate: 4.50,
  opCostPct: 10,
  errorMarginPct: 5,
  minProfitUSD: 3.00,
  tasaBCV: 46.50,
  tasaBinance: 48.20,
  tasaEuro: 51.00,
};

export function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const s = localStorage.getItem("gs_settings_v2");
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(s) {
  if (typeof window === "undefined") return;
  localStorage.setItem("gs_settings_v2", JSON.stringify(s));
}

// ─── CALCULATE ONE PRODUCT ───────────────────────────────────────────────────
export function calcProduct({ price, weight, qty, marginPct, settings }) {
  const q = Math.max(1, qty || 1);
  const w = weight || 0.5;
  const totalWeight = w * q;
  const productTotal = price * q;
  const shipping = totalWeight * settings.shippingRate;
  const subtotal = productTotal + shipping;
  const opCost = subtotal * (settings.opCostPct / 100);
  const errorCost = subtotal * (settings.errorMarginPct / 100);
  const totalCost = subtotal + opCost + errorCost;
  const unitCost = totalCost / q;

  const m = marginPct / 100;
  const salePrice = unitCost * (1 + m);
  const grossProfit = salePrice - unitCost;
  const netProfit = grossProfit - (opCost + errorCost) / q;
  const isAtRisk = grossProfit < settings.minProfitUSD;

  return {
    qty: q,
    totalWeight,
    productTotal,
    shipping,
    opCost,
    errorCost,
    totalCost,
    unitCost,
    salePrice,
    grossProfit,
    netProfit,
    isAtRisk,
    marginPct,
    // Currency
    salePriceBCV: salePrice * settings.tasaBCV,
    salePriceBinance: salePrice * settings.tasaBinance,
    salePriceEuro: salePrice * settings.tasaEuro,
    totalCostBCV: unitCost * settings.tasaBCV,
    totalCostBinance: unitCost * settings.tasaBinance,
  };
}
