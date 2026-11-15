import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import hero from "@/assets/landing-hero-sky.jpg";
import bottom from "@/assets/landing-bottom-circle.jpg";
import stepBrowse from "@/assets/step-browse.jpg";
import stepMessage from "@/assets/step-message.jpg";
import stepWear from "@/assets/step-wear.jpg";
import stepFriends from "@/assets/step-friends.jpg";
import tileDiscover from "@/assets/tile-discover-pastel-outfits.jpg";
import tileCommunity from "@/assets/tile-community.jpg";
import tileCloset from "@/assets/tile-closet-pastel-outfits.jpg";
import coat from "@/assets/homepage-pink-coat.png.asset.json";
import gown from "@/assets/homepage-gold-gown.png.asset.json";
import knit from "@/assets/homepage-pink-knit.png.asset.json";
import furMini from "@/assets/homepage-fur-mini.png.asset.json";
import coatOptimized from "@/assets/homepage-pink-coat-backup.webp.asset.json";
import gownOptimized from "@/assets/homepage-gold-gown-backup.webp.asset.json";
import knitOptimized from "@/assets/homepage-pink-knit-backup.webp.asset.json";
import furOptimized from "@/assets/homepage-fur-mini-backup.webp.asset.json";
import tryOn from "@/assets/tile-tryon-pastel-outfit.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "SisUse — Your sisterhood’s shared wardrobe" },
    { name: "description", content: "Rent dresses, shoes and bags from stylish neighbors, get AI outfit picks for any occasion, and meet your Closet Soulmates." },
    { property: "og:title", content: "SisUse — Your sisterhood’s shared wardrobe" },
    { property: "og:description", content: "Local fashion rental, AI styling and a style-first community in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Landing,
});

const collections = [
  { t: "Discover", d: "Browse neighbors' closets or let AI style a full look for your plans — then preview it on you.", img: tileDiscover, fit: "object-center", scenic: true, alt: "Two women in coordinated full outfits walking across a Paris crosswalk", to: "/discover" },
  { t: "AI Try-On", d: "Upload a photo—or go face-free. Choose a scene you love and preview your next look before you borrow.", img: tryOn, fit: "object-center", scenic: true, alt: "A woman in a powder-blue blazer, butter-yellow knit and jeans on a Paris street", to: "/item/burgundy-zip" },
  { t: "Meet your community", d: "Real outfits from real neighbors. Save looks and follow women who share your taste.", img: tileCommunity, fit: "object-center", to: "/community" },
  { t: "Manage your closet", d: "List what you rarely wear, set your price and dates, and earn from every rental.", img: tileCloset, fit: "object-center", scenic: true, to: "/closet" },
];
/** Popular-this-week collage: real outfit photos with mood tags (positions are % of the stage). */
const popular = [
  { img: coatOptimized.url, fallback: coat.url, tag: "Soft satin, worn with denim", tone: "bg-blush", pos: "md:left-[4%] md:top-[4%]", to: "/discover", fit: "object-top" },
  { img: gownOptimized.url, fallback: gown.url, tag: "Gallery-opening glamour", tone: "bg-butter", pos: "md:right-[3%] md:top-[0%]", to: "/discover", fit: "object-top" },
  { img: knitOptimized.url, fallback: knit.url, tag: "Cozy oversized knits", tone: "bg-denim", pos: "md:left-[10%] md:bottom-[2%]", to: "/discover", fit: "object-top" },
  { img: furOptimized.url, fallback: furMini.url, tag: "Fur-trim holiday mini", tone: "bg-clay", pos: "md:right-[6%] md:bottom-[6%]", to: "/discover", fit: "object-[50%_62%]" },
];
const steps = [
  { t: "Browse, AI Discover & AI Try-On", d: "Search by occasion, size and budget, get an AI-styled look, and preview pieces on yourself.", img: stepBrowse },
  { t: "Message the owner", d: "Ask about fit, agree on dates, and pick a public spot to meet nearby.", img: stepMessage },
  { t: "Get the clothes & put them on", d: "Pick up, snap condition photos together, and wear it out — return it the same way.", img: stepWear },
  { t: "Talk with people who share your taste", d: "Post your look, save others', and find your Closet Soulmates.", img: stepFriends },
];

function Steps() {
  const [on, setOn] = useState(0);
  useEffect(() => { const t = setInterval(() => setOn((v) => (v + 1) % steps.length), 4500); return () => clearInterval(t); }, []);
  const n = steps.length;
  return (
    <section className="px-6 pb-16 pt-24 md:pt-32">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:gap-16">
        <div>
          <p className="text-[13px] tracking-[-0.01em] text-accent-foreground">How it works</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">A closet built for women, <em>by women</em></h2>
        </div>
        <p className="self-end text-lg leading-relaxed text-muted-foreground md:text-xl">SisUse connects women in the same neighborhood to borrow, lend and style each other's pieces. Find a look, meet the woman who owns it, wear it out, and keep the conversation going with people who share your taste.</p>
      </div>
      <div className="relative mx-auto mt-20 h-[300px] max-w-5xl md:h-[360px]">
        {steps.map((st, i) => {
          let d = i - on; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
          const abs = Math.abs(d);
          return (
            <button key={st.t} onClick={() => setOn(i)} aria-label={st.t}
              style={{ transform: `translateX(calc(-50% + ${d * 72}%)) rotate(${d * 9}deg) translateY(${abs * 28}px) scale(${1 - abs * 0.12})`, zIndex: 10 - abs, opacity: abs > 1 ? 0.35 : 1, filter: abs > 1 ? "blur(3px)" : "none" }}
              className="absolute left-1/2 top-0 aspect-square w-[210px] overflow-hidden rounded-[1.75rem] border-4 border-background shadow-soft transition-all duration-700 md:w-[290px]">
              <img src={st.img} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
      <div className="mx-auto mt-10 max-w-xl text-center">
        <p className="text-sm font-medium tracking-[-0.01em]">0.0{on + 1}</p>
        <h3 key={on} className="mt-2 animate-fade-up font-display text-3xl leading-tight md:text-4xl">{steps[on]!.t}</h3>
        <p className="mt-3 text-muted-foreground">{steps[on]!.d}</p>
        <div className="mt-6 flex justify-center gap-2">{steps.map((st, i) => (
          <button key={st.t} onClick={() => setOn(i)} aria-label={`Step ${i + 1}`} className={`h-2 rounded-full transition-all ${on === i ? "w-6 bg-primary" : "w-2 bg-border"}`} />
        ))}</div>
      </div>
    </section>
  );
}

function Bridge({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center pb-14 text-center">
      <span className="h-14 w-px bg-border" />
      <p className="mt-5 max-w-md font-display text-2xl italic text-muted-foreground">{text}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* HERO — full-bleed photo, floating nav, value prop */}
      <section className="relative">
        <img src={hero} alt="Two friends laughing in blush and sage silk" className="h-[92vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-ink/20" />
        <nav className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full bg-background/90 px-6 py-3 backdrop-blur md:inset-x-8 md:px-8">
          <div className="hidden items-center gap-7 md:flex">
            {[["Discover", "/discover"], ["AI Stylist", "/stylist"], ["Community", "/community"]].map(([l, to]) => (
              <Link key={l} to={to as "/discover"} className="text-[13px] tracking-[-0.01em] text-foreground/70 transition hover:text-foreground">{l}</Link>
            ))}
          </div>
          <Link to="/" aria-label="SisUse home" className="md:absolute md:left-1/2 md:-translate-x-1/2"><BrandLogo /></Link>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="hidden text-[13px] tracking-[-0.01em] text-foreground/70 transition hover:text-foreground md:block">Sign in</Link>
            <Link to="/discover" className="rounded-full bg-primary px-5 py-2 text-[13px] tracking-[-0.01em] text-primary-foreground transition hover:opacity-90">Open app</Link>
          </div>
        </nav>
        <div className="absolute inset-x-6 bottom-10 md:inset-x-12 md:bottom-14">
          <h1 className="max-w-5xl font-display text-[40px] leading-[1.06] text-ink-foreground md:text-[68px]">Your sisterhood’s <em>shared wardrobe</em>.</h1>
          <p className="mt-5 max-w-xl text-base text-ink-foreground/90 md:text-lg">Rent and lend clothing, bags, jewelry, and accessories. Discover new looks and connect with women who share your style.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/discover" className="inline-flex items-center gap-3 rounded-full border border-ink-foreground/60 bg-ink/25 px-7 py-3 text-[13px] tracking-[-0.01em] text-ink-foreground backdrop-blur-sm transition hover:bg-ink-foreground/10">Explore the Wardrobe <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/closet" className="inline-flex items-center gap-3 rounded-full border border-ink-foreground/60 bg-ink/25 px-7 py-3 text-[13px] tracking-[-0.01em] text-ink-foreground backdrop-blur-sm transition hover:bg-ink-foreground/10">Share Your Pieces <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/stylist" className="inline-flex items-center gap-3 rounded-full border border-ink-foreground/60 bg-ink/25 px-7 py-3 text-[13px] tracking-[-0.01em] text-ink-foreground backdrop-blur-sm transition hover:bg-ink-foreground/10">Find Your Next Look <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <Steps />
      <Bridge text="Four ways to be part of it." />

      {/* FOUR SUB-SECTIONS — connected photo mosaic */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between pb-8">
            <h2 className="font-display text-4xl md:text-5xl">Inside <em>SisUse</em></h2>
            <Link to="/discover" className="flex items-center gap-1 text-[13px] tracking-[-0.01em] underline-offset-4 hover:underline">Browse all <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((c) => (
              <Link key={c.t} to={c.to as "/discover"} className="group block min-w-0">
                <div className="relative aspect-[896/1600] overflow-hidden">
                  <img src={c.img} alt={c.alt ?? c.t} loading="eager" width={896} height={1600} className={`h-full w-full object-cover ${c.fit} transition duration-700 group-hover:scale-105`} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/75 to-transparent px-5 pb-5 pt-14 text-ink-foreground">
                    <h3 className="font-display text-3xl leading-tight">{c.t}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-foreground/95">{c.d}</p>
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink-foreground/70 px-5 py-2 text-xs transition group-hover:bg-ink-foreground group-hover:text-ink">Explore <ArrowUpRight className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Bridge text="Here’s what everyone is borrowing." />

      {/* POPULAR — scattered photo collage around a centered headline */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 pb-14 md:block md:h-[1160px]">
        {popular.map((p) => (
          <Link key={p.tag} to={p.to as "/discover"} className={`group relative block w-52 md:absolute md:w-64 lg:w-80 ${p.pos}`}>
            <img src={p.img} alt={p.tag} loading="eager" width={640} height={800} onError={(event) => {
              const image = event.currentTarget;
              if (image.dataset["fallbackUsed"]) return;
              image.dataset["fallbackUsed"] = "true";
              image.src = p.fallback;
            }} className={`aspect-[4/5] w-full rounded-[1.75rem] object-cover ${p.fit} shadow-soft transition duration-500 group-hover:-translate-y-1`} />
            <span className={`mt-3 block rounded-full px-4 py-2 text-center text-xs leading-snug text-foreground shadow-soft md:text-sm ${p.tone}`}>{p.tag}</span>
          </Link>
        ))}
        <div className="order-first mx-auto max-w-md px-2 text-center md:absolute md:inset-x-0 md:top-1/2 md:-translate-y-1/2 md:px-6">
          <p className="text-sm tracking-[-0.015em] text-foreground/70">This week on SisUse</p>
          <h2 className="mt-3 font-display text-5xl leading-[1.02] md:text-6xl lg:text-7xl">Most-loved <em className="text-olive">looks</em> nearby</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/80 lg:text-lg">Romantic, relaxed, polished or bold — borrowed from women a few blocks away.</p>
          <Link to="/discover" className="mt-6 inline-block border-b border-foreground pb-0.5 text-sm tracking-[-0.015em]">Explore the Wardrobe</Link>
        </div>
      </section>

      <Bridge text="Your wardrobe is waiting for its sisters." />

      {/* JOIN — full-bleed photo with centered call to action */}
      <section className="relative">
        <img src={bottom} alt="Three friends in a circle laughing under a blue sky" loading="lazy" className="h-[90vh] w-full object-cover" />
        <div className="absolute inset-0 bg-ink/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ink-foreground">
          <p className="text-[13px] tracking-[-0.01em]">Join SisUse</p>
          <h2 className="mt-4 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">Be part of a wardrobe where <em>women share with women</em></h2>
          <Link to="/signup" className="mt-10 inline-flex items-center gap-3 rounded-full bg-background px-8 py-3.5 text-[13px] tracking-[-0.01em] text-foreground transition hover:opacity-90">Create your free account <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
      <footer className="space-y-3 py-10 text-center"><Link to="/" aria-label="SisUse home"><BrandLogo /></Link><p className="text-[11px] text-muted-foreground">© 2026 SisUse · Your sisterhood’s shared wardrobe</p></footer>
    </div>
  );
}
