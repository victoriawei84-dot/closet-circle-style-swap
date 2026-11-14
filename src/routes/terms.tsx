import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Rental terms, Fit Guarantee & Damage Protection — SisUse" },
    { name: "description", content: "Eligibility and terms for the SisUse Fit Guarantee, deposits and Damage Protection." },
    { property: "og:title", content: "Rental terms — SisUse" },
    { property: "og:description", content: "Fit Guarantee, deposits, damage terms and condition photos." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Terms,
});

const H = ({ id, children }: { id: string; children: string }) => <h2 id={id} className="scroll-mt-24 pt-6 text-4xl">{children}</h2>;

function Terms() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 pb-16 text-[15px] leading-relaxed">
      <h1 className="text-6xl">Rental terms</h1>
      <p className="rounded-2xl bg-secondary/60 p-4 text-sm text-secondary-foreground">Draft for the prototype. Time windows marked “placeholder” still need to be confirmed by the SisUse team.</p>

      <H id="fit-guarantee">Fit Guarantee</H>
      <p>If a rented piece doesn't fit, you're covered — for any fit issue.</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>What's covered:</b> too small, too big, too tight in the bust, waist or hips, too loose, too long, too short, sleeves or straps that don't work, or a shape that simply doesn't sit right on you.</li>
        <li><b>What you get:</b> your choice of a full refund of the rental subtotal and cleaning fee, or a free exchange for another available piece.</li>
        <li><b>Your deposit</b> is always returned in full for fit claims.</li>
        <li><b>How to claim:</b> tell the owner in your rental chat at pickup or try-on, within 24 hours of pickup (placeholder), and return the piece unworn with its tags or pins as given.</li>
        <li><b>Not covered:</b> pieces that were worn out for the event before reporting, or damaged during try-on.</li>
        <li>Fit Check and AI styling previews help you decide, but the guarantee applies whether or not you used them.</li>
      </ul>
      <p className="text-sm text-muted-foreground">See <Link to="/fit-check" className="underline">how Fit Check works</Link>.</p>

      <H id="damage">Damage Protection & deposits</H>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Deposit:</b> each listing shows its refundable deposit before you request. It's held at confirmation and returned after the owner checks the piece at return.</li>
        <li><b>Condition photos:</b> both of you take photos at pickup and return in the rental page. These are the record if anything is disputed.</li>
        <li><b>Normal wear is never charged</b> — light creasing, minor sole wear, or anything already listed under “Flaws”.</li>
        <li><b>Damage:</b> repairable damage (stains needing specialist cleaning, broken straps, small tears) is charged at the actual repair cost, up to the deposit.</li>
        <li><b>Coverage limit:</b> the most you can be charged is the listing's deposit. Damage above that is not covered by the prototype.</li>
        <li><b>Exclusions:</b> loss, theft, or pieces not returned are charged up to the deposit and handled with the owner directly.</li>
        <li><b>Late returns:</b> charged at the daily rate per extra day.</li>
        <li>Free cancellation up to 48 hours before pickup.</li>
      </ul>
    </article>
  );
}
