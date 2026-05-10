"use client";

import { useState } from "react";
import { DM_Sans, Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"] });
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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

const analysisCards = [
  {
    key: "saturacion",
    title: "Saturación del mercado",
    icon: "🌊",
    color: "from-blue-500/20 to-cyan-500/10 border-cyan-300/30",
  },
  {
    key: "competencia",
    title: "Competencia",
    icon: "⚔️",
    color: "from-violet-500/20 to-fuchsia-500/10 border-violet-300/30",
  },
  {
    key: "oportunidades",
    title: "Oportunidades",
    icon: "🚀",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-300/30",
  },
  {
    key: "diferenciacion",
    title: "Diferenciación",
    icon: "✨",
    color: "from-amber-500/20 to-orange-500/10 border-amber-300/30",
  },
  {
    key: "veredicto",
    title: "Veredicto",
    icon: "✅",
    color: "from-rose-500/20 to-pink-500/10 border-rose-300/30",
  },
];

function shorten(text, max = 120) {
  if (!text) return "";
  const clean = String(text).replace(/[#*_`]/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function cleanText(text) {
  return String(text || "")
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAnalysisPayload(payload) {
  const fallback = {
    saturacion: "",
    competencia: [],
    oportunidades: "",
    diferenciacion: [],
    veredicto: "",
  };

  try {
    const rawText = typeof payload === "string" ? payload : JSON.stringify(payload || {});
    const first = rawText.indexOf("{");
    const last = rawText.lastIndexOf("}");
    const jsonText =
      first >= 0 && last > first ? rawText.slice(first, last + 1) : rawText;
    const parsed = JSON.parse(jsonText);

    return {
      saturacion: cleanText(parsed?.saturacion),
      competencia: Array.isArray(parsed?.competencia)
        ? parsed.competencia.slice(0, 3).map((item) => cleanText(item))
        : [],
      oportunidades: cleanText(parsed?.oportunidades),
      diferenciacion: Array.isArray(parsed?.diferenciacion)
        ? parsed.diferenciacion.slice(0, 3).map((item) => cleanText(item))
        : [],
      veredicto: cleanText(parsed?.veredicto),
    };
  } catch {
    return fallback;
  }
}

function buildMetrics(text, mode) {
  const source = (text || "") + mode;
  const base = source.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const a = 45 + (base % 50);
  const b = 40 + ((base * 3) % 55);
  const c = 35 + ((base * 7) % 60);
  const d = 30 + ((base * 11) % 65);

  return mode === "business"
    ? [
        { label: "Potencial de mercado", value: a },
        { label: "Nivel de competencia", value: b },
        { label: "Oportunidad de nicho", value: c },
        { label: "Diferenciación", value: d },
      ]
    : [
        { label: "Momentum sectorial", value: a },
        { label: "Riesgo agregado", value: b },
        { label: "Calidad de líderes", value: c },
        { label: "Perspectiva 6-12m", value: d },
      ];
}

export default function HomePage() {
  const [mode, setMode] = useState("business");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  async function handleAnalyze() {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setExpandedCard(null);

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

      const parsed = parseAnalysisPayload(data.analysis);
      const hasAnyContent =
        parsed.saturacion ||
        parsed.oportunidades ||
        parsed.veredicto ||
        parsed.competencia.length ||
        parsed.diferenciacion.length;

      if (!hasAnyContent) {
        throw new Error("La respuesta no vino en JSON válido. Intenta de nuevo.");
      }

      setResult(parsed);
    } catch (err) {
      setError(err.message || "Ha ocurrido un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const metrics = buildMetrics(result ? JSON.stringify(result) : "", mode);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080B14] px-4 py-8 md:px-8 md:py-12">
      <div className="aurora pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="aurora pointer-events-none absolute -right-24 top-28 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="aurora pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-6 text-center">
          <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 backdrop-blur">
            AI Market Intelligence
          </p>
          <h1
            className={`${syne.className} animate-gradient whitespace-nowrap bg-[linear-gradient(110deg,#ffffff,#c4b5fd,#67e8f9,#ffffff)] bg-[length:220%_220%] bg-clip-text text-[1.3rem] font-extrabold leading-[0.95] tracking-tight text-transparent min-[390px]:text-[1.45rem] sm:text-[2rem] md:text-[4.6rem] lg:text-[5.7rem]`}
          >
            MarketMind AI
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 md:text-xl">
            Analiza cualquier negocio o sector con IA con calidad visual tipo producto
            de startup.
          </p>
        </header>

        <section className="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl shadow-indigo-950/30 backdrop-blur-2xl md:p-7">
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("business")}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                mode === "business"
                  ? "border-indigo-300/40 bg-gradient-to-r from-indigo-500/80 to-cyan-500/70 text-white shadow-md shadow-indigo-500/25"
                  : "border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/30 hover:bg-slate-800/80"
              }`}
            >
              Idea de negocio
            </button>
            <button
              type="button"
              onClick={() => setMode("investment")}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                mode === "investment"
                  ? "border-indigo-300/40 bg-gradient-to-r from-indigo-500/80 to-cyan-500/70 text-white shadow-md shadow-indigo-500/25"
                  : "border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/30 hover:bg-slate-800/80"
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
            className="h-40 w-full resize-none rounded-2xl border border-white/15 bg-slate-950/70 p-4 text-base text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 focus:scale-[1.002] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
          />

          <div className="mt-5">
            <p className="mb-2 text-sm text-slate-400">Ejemplos rápidos:</p>
            <div className="flex flex-wrap gap-2">
              {examples[mode].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/10"
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
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-3 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-300"
          >
            {loading ? "Analizando..." : "Analizar"}
          </button>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
            <h2 className={`${syne.className} mb-3 text-3xl font-bold text-white`}>
              Resultado Inteligente
            </h2>

            {loading && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-cyan-300" />
                  Generando análisis con IA...
                </div>
                <div className="space-y-2">
                  <div className="h-3 animate-pulse rounded bg-slate-700/60" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-slate-700/60" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-slate-700/60" />
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-rose-200">
                {error}
              </div>
            )}

            {!loading && !error && result && (
              <div className={`${dmSans.className} grid grid-cols-1 gap-3 md:grid-cols-2`}>
                {analysisCards.map((card, index) => {
                  const fullValue =
                    Array.isArray(result[card.key]) && result[card.key].length
                      ? result[card.key].join(" • ")
                      : cleanText(result[card.key] || "Sin dato disponible.");
                  const summaryValue = shorten(fullValue, 120);
                  const isExpanded = expandedCard === card.key;

                  return (
                  <article
                    key={`${card.title}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpandedCard((prev) => (prev === card.key ? null : card.key))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedCard((prev) => (prev === card.key ? null : card.key));
                      }
                    }}
                    className={`group cursor-pointer rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/70 ${card.color}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-sm">
                        {card.icon}
                      </span>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                        {card.title}
                      </h3>
                      <span
                        className={`ml-auto text-xs text-slate-200 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                    <p
                      className="overflow-hidden text-sm leading-relaxed text-slate-200"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {summaryValue}
                    </p>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-slate-100">{fullValue}</p>
                    </div>
                  </article>
                  );
                })}
              </div>
            )}

            {!loading && !error && !result && (
              <p className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-400">
                Aquí aparecerá tu análisis cuando pulses en "Analizar".
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className={`${syne.className} mb-4 text-xl font-bold text-white`}>
              Visual Snapshot
            </h3>

            {!result || loading ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                La visualización se genera automáticamente cuando llegue el análisis.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div
                    className="relative grid h-36 w-36 place-items-center rounded-full transition-all duration-500 hover:scale-105"
                    style={{
                      background: `conic-gradient(#6366f1 ${metrics[0].value}%, #22d3ee ${metrics[1].value}% ${metrics[1].value + 15}%, #a855f7 ${metrics[2].value}% ${metrics[2].value + 25}%, #334155 0)`,
                    }}
                  >
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-center">
                      <span className="text-xs text-slate-400">score</span>
                      <strong className="text-2xl text-white">
                        {Math.round(
                          metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-1 flex justify-between text-xs text-slate-300">
                        <span>{metric.label}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-700"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
