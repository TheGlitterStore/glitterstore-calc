export const DEFAULT_SETTINGS = {
  shippingRate: 4.5,       // USD per lb
  opCostPct: 0.10,         // 10% operational costs
  errorMarginPct: 0.05,    // 5% error buffer
  minProfitUSD: 3.0,       // minimum $3 profit alert
  defaultMarginPct: 40,    // default margin %
  currency: "USD",
};

export const CATEGORIES = {
  ropa_ligera:  { label: "Ropa ligera",        weightMin: 0.3, weightMax: 0.6,  weightAvg: 0.45 },
  ropa_pesada:  { label: "Jeans / Hoodies",    weightMin: 0.8, weightMax: 1.5,  weightAvg: 1.1  },
  accesorios:   { label: "Accesorios",          weightMin: 0.1, weightMax: 0.3,  weightAvg: 0.2  },
  maquillaje:   { label: "Maquillaje / Skincare",weightMin: 0.2, weightMax: 0.6, weightAvg: 0.35 },
  hogar:        { label: "Hogar / Decoración",  weightMin: 0.5, weightMax: 3.0,  weightAvg: 1.5  },
  juguetes:     { label: "Juguetes",            weightMin: 0.5, weightMax: 2.0,  weightAvg: 1.1  },
  zapatos:      { label: "Zapatos",             weightMin: 1.2, weightMax: 2.5,  weightAvg: 1.8  },
  tecnologia:   { label: "Tecnología / Gadgets",weightMin: 0.3, weightMax: 1.2,  weightAvg: 0.7  },
  otro:         { label: "General",             weightMin: 0.3, weightMax: 1.0,  weightAvg: 0.6  },
};

export function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem("glitterstore_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings) {
  if (typeof window === "undefined") return;
  localStorage.setItem("glitterstore_settings", JSON.stringify(settings));
}

export function calculate({ productPrice, weight, quantity, marginPct, settings }) {
  const qty = Math.max(1, quantity || 1);
  const totalWeight = weight * qty;
  const productTotal = productPrice * qty;
  const shipping = totalWeight * settings.shippingRate;
  const opCost = (productTotal + shipping) * settings.opCostPct;
  const errorCost = (productTotal + shipping) * settings.errorMarginPct;
  const totalCost = productTotal + shipping + opCost + errorCost;
  const unitCost = totalCost / qty;

  const marginDecimal = marginPct / 100;
  const salePrice = unitCost * (1 + marginDecimal);
  const grossProfit = salePrice - unitCost;
  // Net = gross minus shipping/lb cost already included, so net is same as gross here
  // We show breakdown: gross profit = sale - unitCost, net = gross - opCost/qty
  const netProfit = grossProfit - (opCost + errorCost) / qty;

  const isAtRisk = grossProfit < settings.minProfitUSD;

  return {
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
    qty,
  };
}
