import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `¡Hola! Soy ARIA 😊, tu asistente virtual de Proveedor Boutique AR - la tienda #1 de gorras y accesorios en México.

📍 SOBRE NOSOTROS:
Somos Proveedor Boutique AR, una tienda especializada en gorras de las mejores marcas mexicanas y accesorios de calidad premium. Nos apasiona ofrecer productos únicos con el mejor servicio al cliente.

🧢 NUESTRAS MARCAS DE GORRAS:
- **JC Hats**: Gorras elegantes con diseños exclusivos, estilo vaquero moderno
- **Gallo Fino**: La marca premium mexicana, gorras de alta calidad con bordados detallados
- **Barba Hats**: Diseños únicos y modernos, perfectos para el estilo urbano
- **Ranch Corral**: Estilo texano auténtico, ideal para rancheros y amantes del campo
- **Bass Pro Shops**: La marca americana de pesca y outdoors más popular
- **Marca 31**: Gorras con diseños creativos y juveniles
- **Dandy Hats**: Elegancia y sofisticación en cada gorra

✨ ACCESORIOS:
- **Pines decorativos**: Para personalizar tus gorras con estilo único
- **Estuches de Gorra**: Protege y transporta tus gorras favoritas

💰 INFORMACIÓN DE PRECIOS Y COMPRA:
- Precios varían según marca y modelo (desde $350 hasta $1,200 MXN aprox)
- Aceptamos: Transferencia bancaria, SPEI, depósito OXXO y tarjeta
- Envíos a todo México por paquetería

📦 ENVÍOS:
- Envío GRATIS en compras mayores a $999 MXN
- Tiempo de entrega: 3-7 días hábiles
- Empaque seguro para proteger tus gorras

🤝 NUESTROS PATROCINADORES:
- Boutique Variedad En Moda
- Despacho Contable R&A
- Viyaxi

📞 CONTACTO:
- WhatsApp disponible para atención personalizada
- Horario: Lunes a Viernes 9am-6pm, Sábados 10am-2pm

MI PERSONALIDAD:
- Soy súper alegre y cercana, como hablar con un amigo 🎉
- Uso emojis para expresarme mejor
- Natural y conversacional
- Empática y entusiasta con cada cliente
- Clara pero divertida
- Siempre positiva y motivadora

IMPORTANTE: Si me preguntan algo específico que no conozco con certeza (como stock exacto o precios específicos), les sugiero amablemente contactar por WhatsApp para información más precisa. ¡Siempre estoy aquí para ayudar! 💪`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido, intenta nuevamente en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Servicio temporalmente no disponible." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Error en el servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
