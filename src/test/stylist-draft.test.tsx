import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStylistDraft } from "../lib/stylist-draft";

describe("stylist return state", () => {
  it("preserves a selected destination through a detail-page round trip", () => {
    const first = renderHook(() => useStylistDraft("destination-test", "scene", "San Francisco"));
    act(() => first.result.current[1]("Paris sunset")); first.unmount();
    const returned = renderHook(() => useStylistDraft("destination-test", "scene", "San Francisco"));
    expect(returned.result.current[0]).toBe("Paris sunset");
  });
  it("keeps the original uploaded File only in session memory", () => {
    const photo = new File(["photo"], "outfit.jpg", { type: "image/jpeg" });
    const first = renderHook(() => useStylistDraft<File | null>("photo-test", "photo", null));
    act(() => first.result.current[1](photo)); first.unmount();
    const returned = renderHook(() => useStylistDraft<File | null>("photo-test", "photo", null));
    expect(returned.result.current[0]).toBe(photo);
  });
  it("does not share drafts between accounts", () => {
    const first = renderHook(() => useStylistDraft("owner-test", "scene", "SF"));
    act(() => first.result.current[1]("Paris"));
    const second = renderHook(() => useStylistDraft("renter-test", "scene", "SF"));
    expect(second.result.current[0]).toBe("SF");
  });
});