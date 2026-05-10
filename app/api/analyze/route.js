import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const businessPrompt =
  "Eres un agente experto en análisis de mercado y estrategia de negocio. Cuando el usuario te describe una idea de negocio, analiza: 1) Saturación del mercado, 2) Principales competidores, 3) Oportunidades de nicho, 4) 3 formas concretas de diferenciarse, 5) Veredicto final. Sé directo y termina con una recomendación clara. Responde en español.";

const investmentPrompt =
  "Eres un agente experto en análisis financiero y sectorial. Analiza: 1) Estado actual del sector, 2) Tendencias principales, 3) Empresas destacadas, 4) Riesgos, 5) Perspectiva a corto-medio plazo. Presenta esto como información, no como consejo de inversión directo. Responde en español.";

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
