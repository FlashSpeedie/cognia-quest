import type { DiagramId } from "@/content/academy/types";

/**
 * Static, accessible diagrams for Module 1 lessons - server-rendered
 * SVG/CSS, no client JavaScript. Each carries an aria-label; the content
 * supplies the visible caption text.
 */

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure
      role="img"
      aria-label={label}
      className="overflow-hidden rounded-xl border border-void-700/70 bg-void-900 p-5"
    >
      {children}
    </figure>
  );
}

const chip =
  "rounded-lg border border-void-700 bg-void-850 px-2.5 py-1.5 text-xs font-semibold text-ink-dim";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center text-ink-faint ${className}`}>
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true">
        <path d="M8 2v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 8 12)" />
      </svg>
    </div>
  );
}

function MlInProducts() {
  const items = [
    ["Healthcare", "scan & risk flags"],
    ["Finance", "fraud detection"],
    ["Retail", "demand forecasts"],
    ["Recommendations", "music, video, shopping"],
    ["Marketing", "response prediction"],
    ["Autonomous vehicles", "pedestrians, lanes"],
    ["Language (NLP)", "translate, transcribe, chat"],
    ["Agriculture", "crop health, yields"],
    ["Entertainment", "what to watch next"],
  ];
  return (
    <Frame label="Machine learning applications across industries, from healthcare to entertainment.">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map(([name, detail]) => (
          <div key={name} className="rounded-lg border border-void-700 bg-void-850 px-3 py-2.5">
            <p className="text-xs font-bold text-ink">{name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        One idea - learn from examples - powering very different products.
      </p>
    </Frame>
  );
}

function LearningStack() {
  const layers = [
    ["Data", "the raw material - examples to learn from"],
    ["Statistics & mathematics", "tools for reasoning about data and uncertainty"],
    ["Machine learning", "algorithms that find the patterns"],
    ["Evaluation", "is the model actually any good?"],
    ["Applications", "models meeting real people"],
  ];
  return (
    <Frame label="The machine learning stack: data supports statistics and mathematics, which supports machine learning, then evaluation, then applications.">
      <ol className="mx-auto max-w-md space-y-0">
        {layers.map(([name, detail], i) => (
          <li key={name}>
            {i > 0 && <Arrow />}
            <div className="flex items-center gap-3 rounded-lg border border-void-700 bg-void-850 px-3.5 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pulse-600 font-mono text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>
                <span className="block text-xs font-bold text-ink">{name}</span>
                <span className="block text-[11px] text-ink-faint">{detail}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function SupervisedVsUnsupervised() {
  return (
    <Frame label="Supervised learning maps features to a labeled target. Unsupervised learning reveals groups and outliers without labels.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-pulse-400/40 bg-pulse-400/5 p-3.5">
          <p className="text-xs font-bold text-pulse-700 dark:text-pulse-300">Supervised - with an answer key</p>
          <div className="mt-3 space-y-2 text-[11px] text-ink-dim">
            <p className="rounded-md bg-void-850 px-2.5 py-1.5 font-mono">features + <span className="font-bold">target labels</span> &rarr; train</p>
            <p className="rounded-md bg-void-850 px-2.5 py-1.5">learns the mapping from inputs to answers</p>
            <p className="rounded-md bg-void-850 px-2.5 py-1.5">predicts the target for new cases</p>
          </div>
        </div>
        <div className="rounded-lg border border-volt-400/40 bg-volt-400/5 p-3.5">
          <p className="text-xs font-bold text-volt-700 dark:text-volt-300">Unsupervised - without one</p>
          <div className="mt-3 space-y-2 text-[11px] text-ink-dim">
            <p className="rounded-md bg-void-850 px-2.5 py-1.5 font-mono">features, <span className="font-bold">no labels</span> &rarr; explore</p>
            <p className="rounded-md bg-void-850 px-2.5 py-1.5">finds groups (clustering)</p>
            <p className="rounded-md bg-void-850 px-2.5 py-1.5">flags the odd ones out (outliers)</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        Same data can serve either question - the difference is whether an answer key exists.
      </p>
    </Frame>
  );
}

function RegressionVsClassification() {
  return (
    <Frame label="Regression predicts a point on a continuous number line. Classification picks one bucket from a fixed set.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-pulse-400/40 bg-pulse-400/5 p-3.5">
          <p className="text-xs font-bold text-pulse-700 dark:text-pulse-300">Regression - a number</p>
          <div className="relative mt-4 h-12">
            <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-ink-faint/50" />
            {[12, 38, 62, 84].map((left, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-pulse-600"
                style={{ left: `${left}%` }}
              />
            ))}
            <span className="absolute bottom-0 left-[10%] text-[10px] font-mono text-ink-faint">$0</span>
            <span className="absolute bottom-0 right-[8%] text-[10px] font-mono text-ink-faint">$1M</span>
          </div>
          <p className="mt-3 text-[11px] text-ink-dim">The answer lands anywhere along the range: <span className="font-mono">$312,000</span></p>
        </div>
        <div className="rounded-lg border border-volt-400/40 bg-volt-400/5 p-3.5">
          <p className="text-xs font-bold text-volt-700 dark:text-volt-300">Classification - a category</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className={chip + " border-rose-400/50 text-rose-600 dark:text-rose-300"}>Spam</span>
            <span aria-hidden="true" className="text-ink-faint">or</span>
            <span className={chip + " border-mint-400/50 text-mint-700 dark:text-mint-300"}>Not spam</span>
          </div>
          <p className="mt-3 text-[11px] text-ink-dim">The answer is one label from the fixed set - nothing in between.</p>
        </div>
      </div>
    </Frame>
  );
}

function MetricDashboard() {
  const cells = [
    ["Real spam, flagged", "mint", "true positive - caught"],
    ["Real mail, flagged", "rose", "false alarm - hurts precision"],
    ["Real spam, missed", "amber", "miss - hurts recall"],
    ["Real mail, delivered", "mint", "true negative - fine"],
  ] as const;
  const tones: Record<string, string> = {
    mint: "border-mint-400/50 bg-mint-400/10 text-mint-700 dark:text-mint-300",
    rose: "border-rose-400/50 bg-rose-400/10 text-rose-700 dark:text-rose-300",
    amber: "border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300",
  };
  return (
    <Frame label="The spam filter's four outcomes: caught spam, real mail wrongly flagged, missed spam, and correctly delivered mail.">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cells.map(([name, tone, detail]) => (
          <div key={name} className={`rounded-lg border px-3 py-2.5 ${tones[tone]}`}>
            <p className="text-xs font-bold">{name}</p>
            <p className="mt-0.5 text-[11px] text-ink-dim">{detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        Precision reads the flagged column; recall reads the real-spam row; accuracy counts the good outcomes.
      </p>
    </Frame>
  );
}

function MlWorkflowPipeline() {
  const steps = [
    ["Prepare data", "clean, gather, format"],
    ["Split", "train / validation / test"],
    ["Train", "fit patterns on the training set"],
    ["Validate & tune", "compare options, adjust"],
    ["Test", "one honest final evaluation"],
    ["Evaluate", "is it good enough to ship?"],
  ];
  return (
    <Frame label="The machine learning workflow: prepare data, split, train, validate and tune, test, evaluate - all serving generalization to unseen data.">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {steps.map(([name, detail], i) => (
          <li key={name} className="rounded-lg border border-void-700 bg-void-850 px-3 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-pulse-600 font-mono text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <p className="mt-2 text-xs font-bold text-ink">{name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        The whole pipeline serves one goal: generalization to data the model has never seen.
      </p>
    </Frame>
  );
}

function BiasVarianceSpectrum() {
  // Three small SVG plots: under-fit line, balanced curve, over-fit squiggle.
  const points: [number, number][] = [
    [8, 74], [22, 60], [36, 42], [50, 34], [64, 40], [78, 58], [92, 76],
  ];
  const dot = (p: [number, number], i: number) => (
    <circle key={`d${i}`} cx={p[0]} cy={100 - p[1]} r="2.6" fill="currentColor" className="text-ink-faint" />
  );
  const panel = (
    label: string,
    sub: string,
    path: string,
    stroke: string,
  ) => (
    <div className="rounded-lg border border-void-700 bg-void-850 p-3">
      <svg viewBox="0 0 100 100" className="h-20 w-full text-ink-faint" aria-hidden="true" preserveAspectRatio="none">
        {points.map(dot)}
        <path d={path} fill="none" strokeWidth="2" stroke={stroke} strokeLinecap="round" />
      </svg>
      <p className="mt-2 text-xs font-bold text-ink">{label}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{sub}</p>
    </div>
  );
  return (
    <Frame label="Three models on the same curved data: a rigid straight line with high bias, a balanced curve near the sweet spot, and a wildly flexible squiggle with high variance.">
      <div className="grid gap-3 sm:grid-cols-3">
        {panel("Too simple", "High bias - misses the real pattern; steady across samples", "M6,86 C50,80 94,58 94,58", "#f59e0b")}
        {panel("Sweet spot", "Low bias, moderate variance - follows the true curve", "M6,86 C30,74 38,50 50,48 C62,46 74,52 94,76", "#10b981")}
        {panel("Too flexible", "High variance - chases the noise of this particular sample", "M6,86 C14,60 20,90 28,52 C36,30 44,72 52,50 C60,34 68,62 76,54 C84,48 88,72 94,74", "#f43f5e")}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        Flexibility lowers bias but raises variance - the trade-off every model has to balance.
      </p>
    </Frame>
  );
}

function OverfittingCurves() {
  return (
    <Frame label="As model complexity grows, training performance keeps climbing while test performance rises, peaks, and then falls as the model memorizes noise.">
      <svg viewBox="0 0 100 100" className="h-36 w-full" aria-hidden="true">
        {/* axes */}
        <line x1="10" y1="90" x2="96" y2="90" stroke="currentColor" className="text-void-700" strokeWidth="1.5" />
        <line x1="10" y1="90" x2="10" y2="8" stroke="currentColor" className="text-void-700" strokeWidth="1.5" />
        {/* training performance: climbs steadily */}
        <path d="M10,82 C35,60 65,34 94,20" fill="none" strokeWidth="2.4" className="text-pulse-600" stroke="currentColor" strokeLinecap="round" />
        {/* test performance: rises, peaks, falls */}
        <path d="M10,84 C30,60 48,40 58,36 C70,32 82,52 94,72" fill="none" strokeWidth="2.4" className="text-volt-600" stroke="currentColor" strokeLinecap="round" />
        {/* sweet spot marker */}
        <line x1="58" y1="36" x2="58" y2="90" stroke="currentColor" className="text-ink-faint" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="58" cy="36" r="3" className="text-ink" fill="currentColor" />
        <text x="60" y="30" className="fill-current text-ink-faint" fontSize="7">sweet spot</text>
        {/* gap annotation */}
        <text x="66" y="60" className="fill-current text-ink-faint" fontSize="7">widening gap =</text>
        <text x="66" y="67" className="fill-current text-ink-faint" fontSize="7">memorizing noise</text>
        {/* axis labels */}
        <text x="50" y="98" textAnchor="middle" className="fill-current text-ink-faint" fontSize="6.5">model complexity &rarr;</text>
        <text x="13" y="12" className="fill-current text-ink-faint" fontSize="6.5">performance</text>
      </svg>
      <div className="mt-2 flex items-center justify-center gap-5 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded bg-pulse-600" /> Training performance
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded bg-volt-600" /> New-data (test) performance
        </span>
      </div>
    </Frame>
  );
}

export function Diagram({ id, caption }: { id: DiagramId; caption?: string }) {
  const inner = (() => {
    switch (id) {
      case "ml-in-products":
        return <MlInProducts />;
      case "learning-stack":
        return <LearningStack />;
      case "supervised-vs-unsupervised":
        return <SupervisedVsUnsupervised />;
      case "regression-vs-classification":
        return <RegressionVsClassification />;
      case "metric-dashboard":
        return <MetricDashboard />;
      case "ml-workflow-pipeline":
        return <MlWorkflowPipeline />;
      case "bias-variance-spectrum":
        return <BiasVarianceSpectrum />;
      case "overfitting-curves":
        return <OverfittingCurves />;
    }
  })();
  return (
    <div>
      {inner}
      {caption && (
        <p className="mt-2 text-center text-xs leading-relaxed text-ink-faint">{caption}</p>
      )}
    </div>
  );
}
