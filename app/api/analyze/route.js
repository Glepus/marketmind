import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const businessPrompt =
  "Eres un consultor senior de estrategia y market intelligence (nivel firma top-tier). El usuario te describe una idea de negocio y debes entregar un diagnóstico profesional, profundo y accionable en español. Estructura SIEMPRE la respuesta con estos encabezados exactos: 'Saturación del mercado', 'Competencia', 'Oportunidades', 'Diferenciación' y 'Veredicto'. En cada sección incluye: a) contexto cuantitativo aproximado (TAM/SAM/SOM, crecimiento, rangos de precios, unit economics estimados cuando aplique), b) 2-4 ejemplos reales de empresas/modelos comparables, c) implicaciones estratégicas. En 'Diferenciación' propone al menos 3 estrategias concretas con canal, propuesta de valor y riesgo principal. En 'Veredicto' incluye recomendación clara (Go/No-Go/Go con condiciones), los supuestos clave, y un plan de 90 días con hitos. Evita frases genéricas, explica trade-offs y, si faltan datos, declara supuestos explícitos y cómo validarlos rápidamente.";

const investmentPrompt =
  "Eres un analista financiero y sectorial senior (buy-side + research). Responde en español con rigor profesional y enfoque práctico, sin dar asesoramiento de inversión personalizado. Estructura SIEMPRE la respuesta con estos encabezados exactos: 'Estado del sector', 'Tendencias', 'Empresas destacadas', 'Riesgos' y 'Perspectiva'. En cada sección aporta datos concretos (valoraciones relativas, crecimiento estimado, márgenes, múltiplos orientativos, drivers macro), ejemplos reales de compañías/ETFs representativos y lectura crítica de catalizadores. En 'Riesgos' separa riesgos cíclicos, estructurales y regulatorios. En 'Perspectiva' incluye escenarios base/alcista/bajista para 6-12 meses con probabilidades razonadas y señales a monitorizar. Evita texto genérico; si un dato exacto no está disponible, usa rangos plausibles y explícitalo como estimación.";

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
