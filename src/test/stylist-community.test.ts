import { describe, expect, it } from "vitest";
import { items } from "../lib/data";
import { seedPosts } from "../lib/community";
import { similarCommunityLooks } from "../lib/stylist-community";

describe("community look relevance", () => {
  it("links the work outfit to its actual tagged blazer", () => {
    const blazer = items.find((item) => item.id === "camel-blazer");
    expect(blazer).toBeDefined();
    expect(similarCommunityLooks(seedPosts, blazer ? [blazer] : [], "Tailored", "Salesforce Tower")[0]?.id).toBe("p14");
  });
  it("finds a relevant style without pretending the post was used", () => {
    expect(similarCommunityLooks(seedPosts, [], "Vintage", "").map((post) => post.id)).toContain("p15");
  });
  it("does not show unrelated posts as similar", () => {
    expect(similarCommunityLooks(seedPosts, [], "Sporty", "Tokyo")).toEqual([]);
  });
});