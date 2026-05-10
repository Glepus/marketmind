import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const businessPrompt =
  "Eres un analista experto en mercado y estrategia. Recibirás un bloque opcional 'Intel en tiempo real (Grok)' con tendencias y noticias recientes: úsalo solo si encaja con la consulta; si hay contradicciones, prioriza el razonamiento sólido y sé explícito cuando el contexto sea incierto. Devuelve EXCLUSIVAMENTE JSON válido (sin markdown, sin hashtags, sin texto adicional) con esta estructura exacta: {\"saturacion\":\"texto corto\",\"competencia\":[\"nombre1\",\"nombre2\",\"nombre3\"],\"oportunidades\":\"texto corto\",\"diferenciacion\":[\"punto1\",\"punto2\",\"punto3\"],\"veredicto\":\"una frase\"}. Reglas: respuesta en español, cada campo breve y directo, máximo ~20 palabras por string, competencia exactamente 3 nombres reales o plausibles, diferenciacion exactamente 3 puntos accionables.";

const investmentPrompt =
  "Eres un analista financiero y sectorial. Recibirás un bloque opcional 'Intel en tiempo real (Grok)' con tendencias y noticias recientes: intégralo con criterio; no es asesoramiento personalizado. Si el bloque es poco fiable o genérico, dilo de forma breve en el campo más adecuado. Devuelve EXCLUSIVAMENTE JSON válido (sin markdown, sin hashtags, sin texto adicional) con esta estructura exacta: {\"saturacion\":\"texto corto\",\"competencia\":[\"nombre1\",\"nombre2\",\"nombre3\"],\"oportunidades\":\"texto corto\",\"diferenciacion\":[\"punto1\",\"punto2\",\"punto3\"],\"veredicto\":\"una frase\"}. Interpreta 'saturacion' como madurez/competitividad del sector y 'diferenciacion' como 3 enfoques para posicionarse mejor. Reglas: español, concreto, breve, competencia exactamente 3 nombres, diferenciacion exactamente 3 puntos.";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchGrokIntel(query, mode) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar GROK_API_KEY en .env.local.");
  }

  const modeHint =
    mode === "investment"
      ? "Enfoque: mercados, sector, regulación y catalizadores recientes relevantes para inversores."
      : "Enfoque: demanda del consumidor, competencia, novedades de producto y señales de mercado para emprendedores.";

  const grokRes = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3",
      temperature: 0.4,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `Eres un investigador breve y preciso. ${modeHint} Responde SOLO en español. Entrega: (1) 4-6 viñetas de tendencias actuales, (2) 3-5 hechos o noticias recientes con fecha o ventana temporal cuando sea posible (ej. "Q1 2025", "últimas semanas"). Sin hashtags, sin markdown, sin introducción ni conclusiones largas. Si no hay datos fiables, dilo en una línea.`,
        },
        {
          role: "user",
          content: `Tema / consulta:\n${query}`,
        },
      ],
    }),
  });

  if (!grokRes.ok) {
    const errText = await grokRes.text();
    throw new Error(
      `Grok API (${grokRes.status}): ${errText.slice(0, 500) || grokRes.statusText}`
    );
  }

  const grokJson = await grokRes.json();
  const content = grokJson?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Respuesta de Grok sin contenido usable.");
  }
  return content.trim();
}

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Falta configurar ANTHROPIC_API_KEY en .env.local." },
        { status: 500 }
      );
    }

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json(
        { error: "Falta configurar GROK_API_KEY en .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const query = body?.query?.trim();
    const mode = body?.mode;

    if (!query) {
      return NextResponse.json(
        { error: "La consulta es obligatoria." },
        { status: 400 }
      );
    }

    let grokIntel;
    try {
      grokIntel = await fetchGrokIntel(query, mode);
    } catch (grokError) {
      return NextResponse.json(
        {
          error:
            grokError?.message ||
            "No se pudo obtener contexto desde Grok (xAI).",
        },
        { status: 502 }
      );
    }

    const userPayload = `Consulta del usuario:\n${query}\n\n---\nIntel en tiempo real (Grok — tendencias y noticias recientes; verifica coherencia antes de incorporar):\n${grokIntel}\n---\n\nGenera el JSON final según las instrucciones del sistema.`;

    const system = mode === "investment" ? investmentPrompt : businessPrompt;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      system,
      messages: [
        {
          role: "user",
          content: userPayload,
        },
      ],
    });

    const text = response.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n\n")
      .trim();

    return NextResponse.json({ analysis: text || "No se pudo generar texto." });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error?.message || "Error interno al procesar la solicitud con Anthropic.",
      },
      { status: 500 }
    );
  }
}
