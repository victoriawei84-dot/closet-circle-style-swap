import { describe, expect, it } from "vitest";
import { demoMyItems } from "@/lib/data";
import { clearOnReturn, markSanitized, needsSanitizing, sanitizedLabel } from "@/lib/sanitize";

describe("sanitized by lender", () => {
  const boots = demoMyItems.find((i) => i.id === "my-suede-boots")!;
  const pearls = demoMyItems.find((i) => i.id === "my-pearl-drops")!;
  it("seeds earrings and shoes with the label", () => {
    expect(sanitizedLabel(pearls)).toBe("Sanitized by lender · Nov 14");
    expect(sanitizedLabel(boots)).toBe("Sanitized by lender · Nov 12");
  });
  it("only applies to body-contact items", () => {
    expect(needsSanitizing({ category: "Dress" })).toBe(false);
    expect(sanitizedLabel({ category: "Dress", sanitizedAt: "2026-11-14" })).toBeNull();
  });
  it("clears on return and returns after confirming", () => {
    const cleared = clearOnReturn([boots], boots.id);
    expect(sanitizedLabel(cleared[0]!)).toBeNull();
    expect(sanitizedLabel(markSanitized(cleared, boots.id, "2026-11-20")[0]!)).toBe("Sanitized by lender · Nov 20");
  });
});
