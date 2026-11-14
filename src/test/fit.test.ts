import { describe, it, expect } from "vitest";
import { fitCheck, type GarmentFit } from "@/lib/fit";

const dress: GarmentFit = { unit: "in", bust: 34, waist: 27, hips: 36, stretch: "none", fit: "regular", confirmed: true };
describe("fit check", () => {
  it("normalizes cm body against inch garment", () => {
    // 80cm ≈ 31.5in bust, 64cm ≈ 25.2in waist, 84cm ≈ 33.1in hips → all roomy
    expect(fitCheck("Dress", { unit: "cm", bust: 80, waist: 64, hips: 84 }, dress).verdict).toBe("Likely to fit");
  });
  it("comfortable waist but snug hips", () => {
    const r = fitCheck("Dress", { unit: "in", bust: 32, waist: 25, hips: 35.5 }, dress);
    expect(r.verdict).toBe("May be snug");
    expect(r.explanation).toBe("The bust and waist look comfortable, but the hips may feel snug.");
  });
  it("too small garment is unlikely to fit", () => {
    expect(fitCheck("Dress", { unit: "in", bust: 37, waist: 30, hips: 40 }, dress).verdict).toBe("Unlikely to fit");
  });
  it("stretch gives extra room", () => {
    const r = fitCheck("Top", { unit: "in", bust: 35 }, { ...dress, bust: 34, stretch: "high", fit: "fitted" });
    expect(r.verdict).toBe("Likely to fit");
  });
  it("missing profile or garment data or unconfirmed → more measurements needed", () => {
    expect(fitCheck("Dress", { unit: "in", bust: 32 }, dress).missingProfile).toEqual(["waist", "hips"]);
    expect(fitCheck("Dress", { unit: "in", bust: 32, waist: 25, hips: 34 }, (({ hips: _h, ...rest }) => rest)(dress)).verdict).toBe("More measurements needed");
    expect(fitCheck("Dress", { unit: "in", bust: 32, waist: 25, hips: 34 }, { ...dress, confirmed: false }).verdict).toBe("More measurements needed");
  });
});
