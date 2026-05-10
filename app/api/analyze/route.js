import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const businessPrompt =
  "Eres un analista experto en mercado y estrategia. Devuelve EXCLUSIVAMENTE JSON válido (sin markdown, sin hashtags, sin texto adicional) con esta estructura exacta: {\"saturacion\":\"texto corto\",\"competencia\":[\"nombre1\",\"nombre2\",\"nombre3\"],\"oportunidades\":\"texto corto\",\"diferenciacion\":[\"punto1\",\"punto2\",\"punto3\"],\"veredicto\":\"una frase\"}. Reglas: respuesta en español, cada campo breve y directo, máximo ~20 palabras por string, competencia exactamente 3 nombres reales o plausibles, diferenciacion exactamente 3 puntos accionables.";

const investmentPrompt =
  "Eres un analista financiero y sectorial. Devuelve EXCLUSIVAMENTE JSON válido (sin markdown, sin hashtags, sin texto adicional) con esta estructura exacta: {\"saturacion\":\"texto corto\",\"competencia\":[\"nombre1\",\"nombre2\",\"nombre3\"],\"oportunidades\":\"texto corto\",\"diferenciacion\":[\"punto1\",\"punto2\",\"punto3\"],\"veredicto\":\"una frase\"}. Interpreta 'saturacion' como madurez/competitividad del sector y 'diferenciacion' como 3 enfoques para posicionarse mejor. Reglas: español, concreto, breve, competencia exactamente 3 nombres, diferenciacion exactamente 3 puntos.";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Falta configurar ANTHROPIC_API_KEY en .env.local." },
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

    const system = mode === "investment" ? investmentPrompt : businessPrompt;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      system,
      messages: [
        {
          role: "user",
          content: query,
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
