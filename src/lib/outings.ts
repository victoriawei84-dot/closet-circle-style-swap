import { ME } from "./data";

export type OutingStatus = "pending" | "proposed" | "accepted" | "declined";

/** A casual plan between two neighbors — independent of any rental. */
export type Outing = {
  id: string; fromId: string; toId: string;
  activity: string; time: string; area: string; note?: string;
  status: OutingStatus; proposedTime?: string; meetup?: string;
  messages: { from: string; text: string; at: string }[];
};

export const ACTIVITIES = ["Outfit photo walk", "Coffee", "Vintage market", "Custom"];

/** Seeded demo plans: one finished Ava↔Maya outing, one invite waiting on the viewer. */
export const seedOutings: Outing[] = [
  {
    id: "o1", fromId: "ava", toId: "maya", activity: "Outfit photo walk",
    time: "Saturday, Nov 21 · 11:00", area: "Hayes Valley → Mission",
    note: "Bring the burgundy jacket — I'd love to borrow it for the walk.",
    status: "accepted", meetup: "Ritual Coffee, Valencia St",
    messages: [
      { from: "maya", text: "Yes! Let's meet at Ritual on Valencia — public, and the light is good there.", at: "Nov 19" },
      { from: "ava", text: "Perfect. I'll wear your jacket and bring my shoulder bag for you.", at: "Nov 19" },
    ],
  },
  {
    id: "o2", fromId: "maya", toId: ME, activity: "Outfit photo walk",
    time: "Saturday, Nov 21 · 14:00", area: "Bernal Heights",
    note: "We both save vintage looks — want to walk and shoot each other's outfits?",
    status: "pending", messages: [],
  },
];
