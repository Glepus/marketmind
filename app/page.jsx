"use client";

import { useState } from "react";

const examples = {
  business: [
    "Quiero abrir una suscripción de comida saludable para oficinas en Madrid.",
    "Estoy pensando en una app de gestión para clínicas dentales pequeñas.",
    "Idea: marca D2C de accesorios para mascotas con enfoque sostenible.",
  ],
  investment: [
    "¿Cómo ves el sector de semiconductores para los próximos 12 meses?",
    "Analiza el panorama del sector de energías renovables en Europa.",
    "¿Qué riesgos y oportunidades hay en empresas de ciberseguridad?",
  ],
};

export default function HomePage() {
  const [mode, setMode] = useState("business");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo generar el análisis.");
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err.message || "Ha ocurrido un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            MarketMind
          </h1>
          <p className="text-lg text-slate-300 md:text-xl">
            Analiza cualquier negocio o sector con IA
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40 md:p-6">
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setMode("business")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "business"
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Idea de negocio
            </button>
            <button
              type="button"
              onClick={() => setMode("investment")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "investment"
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Inversión
            </button>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "business"
                ? "Describe tu idea de negocio y qué quieres analizar..."
                : "Escribe el sector o activo que quieres analizar..."
            }
            className="h-36 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-base text-slate-100 placeholder:text-slate-500 outline-none ring-indigo-500 transition focus:ring-2"
          />

          <div className="mt-4">
            <p className="mb-2 text-sm text-slate-400">Ejemplos:</p>
            <div className="flex flex-wrap gap-2">
              {examples[mode].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !query.trim()}
            className="mt-5 w-full rounded-xl bg-indigo-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {loading ? "Analizando..." : "Analizar"}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40 md:p-6">
          <h2 className="mb-3 text-xl font-semibold text-white">Resultado</h2>

          {loading && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-slate-300">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-indigo-400" />
              Generando análisis con IA...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-rose-700/60 bg-rose-950/40 p-4 text-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && result && (
            <article className="whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-950/70 p-4 leading-relaxed text-slate-200">
              {result}
            </article>
          )}

          {!loading && !error && !result && (
            <p className="rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-slate-400">
              Aquí aparecerá el análisis cuando pulses en "Analizar".
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
