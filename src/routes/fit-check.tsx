import { createFileRoute, Link } from "@tanstack/react-router";
import { btn } from "@/components/ui-kit";

export const Route = createFileRoute("/fit-check")({
  head: () => ({ meta: [
    { title: "How Fit Check works — SisUse" },
    { name: "description", content: "Compare your private measurements with an owner-confirmed garment before you rent, and preview the look on you." },
    { property: "og:title", content: "How Fit Check works — SisUse" },
    { property: "og:description", content: "Measurement-based fit results plus an AI styling preview." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FitCheckInfo,
});

const steps = [
  ["Add your Fit Profile", "Height, bust, waist and hips, in inches or centimeters. Private — never shown to lenders or on posts."],
  ["Owners confirm garment measurements", "Each clothing listing has measurements for its category, plus stretch and intended fit."],
  ["We compare, in the same units", "Your numbers are matched against the garment's, allowing for stretch and how loose it's meant to be."],
  ["You get a clear result", "Likely to fit, May be snug, Unlikely to fit, or More measurements needed — with a one-line reason."],
  ["Preview the look", "Optionally add a full-body photo (face-free is fine) for an AI styling preview. It's illustrative, not a fit promise."],
];

function FitCheckInfo() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <h1 className="text-6xl">How <em>Fit Check</em> works</h1>
      <ol className="divide-y divide-border border-y border-border">{steps.map(([t, d], i) => (
        <li key={t} className="flex gap-5 py-5"><span className="font-display text-3xl text-sage">{i + 1}</span><div><p className="font-display text-2xl">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></li>))}</ol>
      <div className="flex flex-wrap gap-3"><Link to="/profile" className={btn}>Set up my Fit Profile</Link><Link to="/terms" hash="fit-guarantee" className="self-center text-sm underline">Fit Guarantee terms</Link></div>
    </div>
  );
}
