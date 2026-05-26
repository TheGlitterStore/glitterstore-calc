export const runtime = "edge";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const { url } = await req.json();
  if (!url) return new Response(JSON.stringify({ error: "URL requerida" }), { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "API key no configurada" }), { status: 500 });

  const prompt = `Analiza este URL de producto de tienda online (Shein, Temu, Amazon, etc.): ${url}

Basándote SOLO en el URL (nombre del producto en la URL, palabras clave, tipo de producto que se infiere), devuelve un JSON con esta estructura exacta, sin texto adicional, sin markdown:

{
  "productName": "nombre del producto en español, claro y corto",
  "category": "una de estas: ropa_ligera | ropa_pesada | accesorios | maquillaje | hogar | juguetes | zapatos | tecnologia | otro",
  "weightMin": número en libras (mínimo realista),
  "weightMax": número en libras (máximo realista),
  "weightAvg": número en libras (estimado más probable),
  "weightReason": "explicación breve en español de por qué ese peso",
  "priceHint": número o null (si el precio aparece en la URL)
}

Rangos de referencia:
- Funda celular / accesorio pequeño: 0.1–0.3 lbs
- Ropa ligera (top, blusa, vestido): 0.3–0.6 lbs
- Jeans, pantalón: 0.8–1.2 lbs
- Hoodie, suéter: 0.9–1.5 lbs
- Zapatos: 1.2–2.5 lbs
- Maquillaje / skincare unidad: 0.2–0.5 lbs
- Set maquillaje: 0.5–1.2 lbs
- Decoración hogar pequeña: 0.5–1.5 lbs
- Juguete mediano: 0.8–2.0 lbs
- Gadget / tecnología: 0.3–1.2 lbs

Sé preciso. Devuelve SOLO el JSON.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "No se pudo analizar la URL" }), { status: 500 });
  }
}
