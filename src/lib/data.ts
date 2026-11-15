import sage from "@/assets/item-sage-dress.jpg";
import blush from "@/assets/item-blush-dress.jpg";
import bag from "@/assets/item-handbag.jpg";
import blazer from "@/assets/item-blazer.jpg";
import heels from "@/assets/item-heels.jpg";
import floral from "@/assets/item-floral.jpg";
import maya from "@/assets/avatar-maya.jpg";
import lena from "@/assets/avatar-lena.jpg";
import burgundy from "@/assets/item-burgundy-zip.jpg";
import crescent from "@/assets/item-crescent-bag.jpg";
import satin from "@/assets/item-champagne-satin.jpg";
import blackBag from "@/assets/item-black-shoulder-bag.jpg";
import ava from "@/assets/look-ava-satin.jpg";
import type { GarmentFit } from "./fit";
import type { Block } from "./availability";
import roseSatin from "@/assets/item-my-rose-satin.jpg";
import sageBag from "@/assets/item-my-sage-bag.jpg";
import burgundyJacket from "@/assets/item-burgundy-jacket.jpg";
import oliveWrap from "@/assets/item-olive-wrap.jpg";
import goldHoops from "@/assets/item-gold-hoops.jpg";
import cardigan from "@/assets/item-cream-cardigan.jpg";
import camelBlazer from "@/assets/item-camel-blazer.jpg";
import poplin from "@/assets/item-poplin-shirt.jpg";
import trousers from "@/assets/item-wide-trousers.jpg";
import jeans from "@/assets/item-straight-jeans.jpg";
import satinSkirt from "@/assets/item-satin-skirt.jpg";
import loafers from "@/assets/item-loafers.jpg";
import flats from "@/assets/item-ballet-flats.jpg";
import blockHeels from "@/assets/item-block-heels.jpg";
import clutch from "@/assets/item-satin-clutch.jpg";
import scarf from "@/assets/item-silk-scarf.jpg";
import belt from "@/assets/item-leather-belt.jpg";
import hobo from "@/assets/item-suede-hobo.jpg";
import pearlDrops from "@/assets/item-pearl-drops.jpg";
import suedeBoots from "@/assets/item-suede-boots.jpg";

export type User = {
  id: string; name: string; avatar: string; bio: string; zip: string; neighborhood: string;
  styleTags: string[]; size: string; rating: number; reviews: number; responseRate: number; responseTime: string; points: number;
};
export type Item = {
  real?: boolean; published?: boolean; photoPath?: string;
  id: string; ownerId: string; title: string; brand: string; category: "Dress" | "Top" | "Bottom" | "Bag" | "Shoes" | "Suit" | "Jewelry" | "Accessory";
  size: string; image: string; dailyRate: number; deposit: number; /** Owner-provided purchase price; 0 = not provided. */ retail: number; cleaningFee: number;
  occasions: string[]; styleTags: string[]; condition: string; flaws: string; distance: number;
  measurements: Record<string, string>; garment?: GarmentFit; gallery?: string[]; blockedDates: string[]; minNotice: string; description: string;
  /** Owner personal-use blocks (private label; public sees only "unavailable"). */ blocks?: Block[]; care?: string;
  /** ISO date the lender last confirmed sanitizing (body-contact items only); cleared on return. */ sanitizedAt?: string;
};
export type RentalStatus = "Requested" | "Confirmed" | "Picked Up" | "Returned" | "Completed" | "Declined";
export type Rental = {
  real?: boolean; agreedPrice?: { dailyRate: number; cleaning: number; deposit: number; total: number }; createdAt?: string; updatedAt?: string;
  id: string; itemId: string; renterId: string; ownerId: string; start: string; end: string; status: RentalStatus;
  pickup: string; messages: { from: string; text: string; at: string }[]; reviewed?: boolean; pointsUsed?: number;
};

export const ME = "me";

export const users: User[] = [
  { id: ME, name: "Fangchi", avatar: "", bio: "Weekend brunches, gallery openings, and a soft spot for silk.", zip: "94110", neighborhood: "Mission", styleTags: ["Minimal", "Romantic", "Silk"], size: "S", rating: 4.9, reviews: 6, responseRate: 98, responseTime: "within 1 hr", points: 120 },
  { id: "maya", name: "Maya R.", avatar: maya, bio: "Stylist by day. My closet is your closet — especially for weddings.", zip: "94110", neighborhood: "Bernal Heights", styleTags: ["Romantic", "Silk", "Minimal", "Evening"], size: "S", rating: 4.95, reviews: 42, responseRate: 100, responseTime: "within 30 min", points: 860 },
  { id: "lena", name: "Lena K.", avatar: lena, bio: "Tailoring obsessive. Power suits & quiet luxury accessories.", zip: "94103", neighborhood: "SoMa", styleTags: ["Tailored", "Minimal", "Quiet luxury"], size: "S", rating: 4.88, reviews: 27, responseRate: 96, responseTime: "within 2 hrs", points: 540 },
  { id: "ines", name: "Inès D.", avatar: floral, bio: "Vintage florals and garden parties forever.", zip: "94114", neighborhood: "Noe Valley", styleTags: ["Vintage", "Romantic", "Boho"], size: "M", rating: 4.8, reviews: 15, responseRate: 91, responseTime: "within 3 hrs", points: 310 },
  { id: "ava", name: "Ava T.", avatar: ava, bio: "Satin, loafers and a good shoulder bag. Hayes Valley.", zip: "94102", neighborhood: "Hayes Valley", styleTags: ["Minimal", "Silk", "Quiet luxury", "Vintage"], size: "S", rating: 4.9, reviews: 11, responseRate: 97, responseTime: "within 1 hr", points: 280 },
];

export const items: Item[] = [
  { id: "sage-slip", ownerId: "maya", title: "Sage Silk Slip Midi", brand: "Reformation", category: "Dress", size: "S", image: sage, dailyRate: 28, deposit: 80, retail: 248, cleaningFee: 12, occasions: ["Wedding", "Cocktail", "Date night"], styleTags: ["Silk", "Minimal", "Romantic"], condition: "Excellent", flaws: "None noted", distance: 0.8, measurements: { Bust: "33 in", Waist: "26 in", Hips: "36 in", Length: "47 in" }, garment: { unit: "in", bust: 34, waist: 27.5, hips: 37, length: 47, stretch: "none", fit: "regular", confirmed: true }, blockedDates: ["2026-11-27", "2026-11-28"], minNotice: "1 day", care: "Dry clean only.", description: "Bias-cut silk that skims beautifully. A dream for garden and evening weddings." },
  { id: "blush-pleat", ownerId: "maya", title: "Blush Pleated Chiffon Gown", brand: "Self-Portrait", category: "Dress", size: "S", image: blush, dailyRate: 45, deposit: 120, retail: 495, cleaningFee: 15, occasions: ["Wedding", "Gala"], styleTags: ["Romantic", "Evening"], condition: "Like new", flaws: "Tiny pull at hem, inside", distance: 0.8, measurements: { Bust: "33 in", Waist: "25.5 in", Length: "58 in" }, garment: { unit: "in", bust: 33, waist: 25.5, length: 58, stretch: "none", fit: "fitted", confirmed: true }, blockedDates: [], minNotice: "2 days", description: "Floor-length pleated chiffon with a soft V. Photographs like a dream." },
  { id: "cream-bag", ownerId: "lena", title: "Cream Top-Handle Bag", brand: "Mulberry", category: "Bag", size: "One size", image: bag, dailyRate: 22, deposit: 150, retail: 890, cleaningFee: 0, occasions: ["Wedding", "Work", "Cocktail"], styleTags: ["Quiet luxury", "Minimal"], condition: "Excellent", flaws: "Light wear on base corners", distance: 1.9, measurements: { Width: "9 in", Height: "6.5 in" }, blockedDates: [], minNotice: "1 day", description: "Structured calf leather with gold hardware. Pearl studs included on request." },
  { id: "black-suit", ownerId: "lena", title: "Black Tailored Suit Set", brand: "The Frankie Shop", category: "Suit", size: "S", image: blazer, dailyRate: 32, deposit: 100, retail: 420, cleaningFee: 14, occasions: ["Work", "Gala", "Interview"], styleTags: ["Tailored", "Minimal"], condition: "Excellent", flaws: "None noted", distance: 1.9, measurements: { Shoulder: "15.5 in", Waist: "27 in", Inseam: "31 in" }, garment: { unit: "in", bust: 38, waist: 30, hips: 41, stretch: "some", fit: "relaxed", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Dry clean only.", description: "Relaxed single-breasted blazer with matching wide-leg trousers." },
  { id: "nude-heels", ownerId: "maya", title: "Nude Strappy Sandals", brand: "Stuart Weitzman", category: "Shoes", size: "7", image: heels, dailyRate: 15, deposit: 60, retail: 425, cleaningFee: 0, occasions: ["Wedding", "Cocktail", "Date night"], styleTags: ["Minimal", "Evening"], condition: "Good", flaws: "Light sole wear", distance: 0.8, measurements: { Heel: "3.5 in", Fit: "True to size" }, blockedDates: [], minNotice: "1 day", description: "Pairs with everything. Walkable for a full reception." },
  { id: "floral-sun", ownerId: "ines", title: "Ditsy Floral Linen Sundress", brand: "Doen", category: "Dress", size: "M", image: floral, dailyRate: 20, deposit: 60, retail: 298, cleaningFee: 10, occasions: ["Brunch", "Garden party", "Wedding"], styleTags: ["Vintage", "Romantic", "Boho"], condition: "Excellent", flaws: "None noted", distance: 2.6, measurements: { Bust: "35 in", Waist: "28 in", Length: "48 in" }, garment: { unit: "in", bust: 35, waist: 28, hips: 42, length: 48, stretch: "none", fit: "regular", confirmed: false }, blockedDates: [], minNotice: "1 day", care: "Machine wash cold, gentle cycle. Line dry.", description: "Sweetheart neckline, swishy skirt, actual pockets." },
  { id: "burgundy-zip", ownerId: "lena", title: "Burgundy Half-Zip Knit Pullover", brand: "Sézane", category: "Top", size: "M", image: burgundy, gallery: [burgundy], dailyRate: 14, deposit: 40, retail: 165, cleaningFee: 6, occasions: ["Brunch", "Work", "Weekend"], styleTags: ["Minimal", "Quiet luxury"], condition: "Excellent", flaws: "Light pilling under one arm", distance: 1.9, measurements: { Bust: "42 in", Length: "25 in", Sleeve: "31 in" }, garment: { unit: "in", bust: 42, length: 25, stretch: "some", fit: "relaxed", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Hand wash cold or wool cycle. Dry flat.", description: "Soft merino-blend half-zip with ribbed cuffs. Relaxed through the body — layer a knit over the shoulders." },
  { id: "crescent-bag", ownerId: "lena", title: "Tan Leather Crescent Shoulder Bag", brand: "Polène", category: "Bag", size: "One size", image: crescent, gallery: [crescent], dailyRate: 16, deposit: 120, retail: 0, cleaningFee: 0, occasions: ["Brunch", "Work", "Date night"], styleTags: ["Quiet luxury", "Minimal"], condition: "Like new", flaws: "None noted", distance: 1.9, measurements: { Width: "11 in", Height: "6 in", Strap: "Adjustable" }, blockedDates: [], minNotice: "1 day", description: "Smooth caramel leather half-moon with a gold clasp. Sits right under the arm." },
  { id: "champagne-satin", ownerId: "maya", title: "Champagne Satin Slip Dress", brand: "Vince", category: "Dress", size: "S", image: satin, dailyRate: 26, deposit: 80, retail: 320, cleaningFee: 12, occasions: ["Date night", "Cocktail", "Wedding"], styleTags: ["Silk", "Minimal", "Quiet luxury"], condition: "Excellent", flaws: "None noted", distance: 0.8, measurements: { Bust: "34 in", Waist: "28 in", Hips: "37 in", Length: "46 in" }, garment: { unit: "in", bust: 34, waist: 28, hips: 37, length: 46, stretch: "none", fit: "regular", confirmed: true }, blockedDates: [], minNotice: "1 day", description: "Liquid satin cut on the bias. Dress it down with a cardigan and loafers." },
  { id: "black-shoulder-bag", ownerId: "ava", title: "Black Leather Shoulder Bag", brand: "The Row", category: "Bag", size: "One size", image: blackBag, dailyRate: 24, deposit: 200, retail: 0, cleaningFee: 0, occasions: ["Work", "Date night", "Brunch"], styleTags: ["Minimal", "Quiet luxury"], condition: "Excellent", flaws: "Faint scuff on base", distance: 1.4, measurements: { Width: "13 in", Height: "10 in", Drop: "9 in" }, blockedDates: [], minNotice: "1 day", description: "Slouchy calf leather with gold links. Fits a laptop sleeve." },
  { id: "burgundy-jacket", ownerId: "maya", title: "Burgundy Wool Jacket", brand: "Totême", category: "Suit", size: "S", image: burgundyJacket, gallery: [burgundyJacket], dailyRate: 22, deposit: 90, retail: 460, cleaningFee: 10, occasions: ["Brunch", "Weekend", "Date night"], styleTags: ["Vintage", "Minimal", "Quiet luxury"], condition: "Excellent", flaws: "None noted", distance: 0.8, measurements: { Shoulder: "15 in", Bust: "36 in", Length: "27 in" }, garment: { unit: "in", bust: 36, length: 27, stretch: "none", fit: "regular", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Dry clean only.", description: "Structured burgundy wool jacket with soft shoulders. Wears like a second blazer." },
  { id: "olive-wrap", ownerId: "maya", title: "Olive Silk Wrap Dress", brand: "Ganni", category: "Dress", size: "S", image: oliveWrap, gallery: [oliveWrap], dailyRate: 26, deposit: 80, retail: 310, cleaningFee: 12, occasions: ["Wedding", "Cocktail", "Date night"], styleTags: ["Romantic", "Minimal", "Silk"], condition: "Excellent", flaws: "None noted", distance: 0.9, measurements: { Bust: "34 in", Waist: "27 in", Hips: "37 in", Length: "45 in" }, garment: { unit: "in", bust: 34, waist: 27, hips: 37, length: 45, stretch: "some", fit: "regular", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Dry clean only.", description: "True wrap with a tie waist you can tighten through the day. Olive silk with a soft sheen." },
  { id: "gold-hoops", ownerId: "maya", title: "Gold Vermeil Hoop Earrings", brand: "Mejuri", category: "Jewelry", size: "One size", image: goldHoops, gallery: [goldHoops], dailyRate: 8, deposit: 40, retail: 120, cleaningFee: 0, occasions: ["Wedding", "Cocktail", "Date night", "Brunch", "Work"], styleTags: ["Quiet luxury", "Minimal"], condition: "Excellent", flaws: "None noted", distance: 0.9, measurements: { Diameter: "1.2 in" }, blockedDates: [], minNotice: "1 day", care: "Wipe with a soft cloth; keep away from perfume.", description: "Small gold vermeil hoops that warm up every neutral outfit." },
  // Separates, shoes and accessories (non-dress inventory).
  { id: "cream-cardigan", ownerId: "ines", title: "Cream Cable-Knit Cardigan", brand: "Sézane", category: "Top", size: "M", image: cardigan, gallery: [cardigan], dailyRate: 12, deposit: 40, retail: 175, cleaningFee: 6, occasions: ["Weekend", "Brunch", "Photo walk"], styleTags: ["Vintage", "Romantic", "Boho"], condition: "Excellent", flaws: "None noted", distance: 2.6, measurements: { Bust: "40 in", Length: "23 in", Sleeve: "30 in" }, garment: { unit: "in", bust: 40, length: 23, stretch: "some", fit: "relaxed", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Hand wash cold. Dry flat.", description: "Chunky cream cable knit with tortoiseshell buttons. Throw it over jeans or a slip." },
  { id: "camel-blazer", ownerId: "lena", title: "Camel Tailored Wool Blazer", brand: "Toteme", category: "Top", size: "S", image: camelBlazer, gallery: [camelBlazer], dailyRate: 20, deposit: 90, retail: 590, cleaningFee: 12, occasions: ["Work", "Interview", "Work event"], styleTags: ["Tailored", "Minimal", "Quiet luxury"], condition: "Excellent", flaws: "None noted", distance: 1.9, measurements: { Shoulder: "15 in", Bust: "36 in", Length: "28 in", Sleeve: "24 in" }, garment: { unit: "in", bust: 36, length: 28, stretch: "none", fit: "regular", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Dry clean only.", description: "Single-breasted camel wool with a soft shoulder. Sharp over a white shirt and trousers." },
  { id: "poplin-shirt", ownerId: "lena", title: "White Cotton Poplin Shirt", brand: "COS", category: "Top", size: "S", image: poplin, gallery: [poplin], dailyRate: 8, deposit: 25, retail: 89, cleaningFee: 5, occasions: ["Work", "Work event", "Brunch"], styleTags: ["Minimal", "Tailored"], condition: "Like new", flaws: "None noted", distance: 1.9, measurements: { Bust: "38 in", Length: "27 in" }, garment: { unit: "in", bust: 38, length: 27, stretch: "none", fit: "relaxed", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Machine wash cold. Iron warm.", description: "Crisp white poplin with a chest pocket. Tucks neatly into trousers." },
  { id: "wide-trousers", ownerId: "lena", title: "Charcoal Wide-Leg Wool Trousers", brand: "The Frankie Shop", category: "Bottom", size: "S", image: trousers, gallery: [trousers], dailyRate: 14, deposit: 50, retail: 260, cleaningFee: 8, occasions: ["Work", "Work event", "Interview"], styleTags: ["Tailored", "Minimal", "Quiet luxury"], condition: "Excellent", flaws: "None noted", distance: 1.9, measurements: { Waist: "27 in", Hips: "39 in", Rise: "12 in", Inseam: "31 in" }, garment: { unit: "in", waist: 27, hips: 39, length: 43, stretch: "none", fit: "relaxed", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Dry clean only.", description: "High-rise pleated trousers that pool just over a loafer." },
  { id: "straight-jeans", ownerId: "ines", title: "Relaxed Straight-Leg Jeans", brand: "Agolde", category: "Bottom", size: "M", image: jeans, gallery: [jeans], dailyRate: 10, deposit: 40, retail: 198, cleaningFee: 6, occasions: ["Weekend", "Brunch", "Photo walk"], styleTags: ["Vintage", "Minimal"], condition: "Good", flaws: "Natural fading at knees", distance: 2.6, measurements: { Waist: "29 in", Hips: "40 in", Rise: "11 in", Inseam: "29 in" }, garment: { unit: "in", waist: 29, hips: 40, length: 40, stretch: "none", fit: "relaxed", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Machine wash cold inside out. Line dry.", description: "Mid-wash rigid denim, relaxed through the hip, straight to the ankle." },
  { id: "satin-skirt", ownerId: "ava", title: "Champagne Satin Midi Skirt", brand: "Vince", category: "Bottom", size: "S", image: satinSkirt, gallery: [satinSkirt], dailyRate: 14, deposit: 50, retail: 245, cleaningFee: 8, occasions: ["Date night", "Cocktail", "Brunch"], styleTags: ["Silk", "Minimal", "Quiet luxury"], condition: "Excellent", flaws: "None noted", distance: 1.4, measurements: { Waist: "26 in", Hips: "37 in", Length: "33 in" }, garment: { unit: "in", waist: 26, hips: 37, length: 33, stretch: "none", fit: "regular", confirmed: true }, blockedDates: [], minNotice: "1 day", care: "Dry clean only.", description: "Bias-cut satin midi with a hidden side zip. Pair it with a knit for evenings out." },
  { id: "brown-loafers", ownerId: "lena", title: "Brown Leather Penny Loafers", brand: "G.H. Bass", category: "Shoes", size: "7.5", image: loafers, gallery: [loafers], dailyRate: 9, deposit: 40, retail: 170, cleaningFee: 0, occasions: ["Work", "Work event", "Weekend"], styleTags: ["Tailored", "Vintage", "Minimal"], condition: "Good", flaws: "Light creasing at the toe", distance: 1.9, measurements: { "US size": "7.5", Heel: "1 in", Fit: "True to size" }, blockedDates: [], minNotice: "1 day", description: "Polished chocolate leather loafers, already broken in." },
  { id: "ballet-flats", ownerId: "ava", title: "Black Leather Ballet Flats", brand: "Repetto", category: "Shoes", size: "7", image: flats, gallery: [flats], dailyRate: 8, deposit: 40, retail: 345, cleaningFee: 0, occasions: ["Weekend", "Brunch", "Photo walk", "Date night"], styleTags: ["Minimal", "Romantic"], condition: "Excellent", flaws: "None noted", distance: 1.4, measurements: { "US size": "7", Heel: "0.25 in", Fit: "Runs slightly small" }, blockedDates: [], minNotice: "1 day", description: "Soft lambskin flats with a tiny bow. Made for a long walk." },
  { id: "block-heels", ownerId: "maya", title: "Wine Suede Block-Heel Slingbacks", brand: "Sam Edelman", category: "Shoes", size: "7", image: blockHeels, gallery: [blockHeels], dailyRate: 10, deposit: 40, retail: 140, cleaningFee: 0, occasions: ["Date night", "Cocktail", "Work event", "Wedding"], styleTags: ["Vintage", "Minimal", "Evening"], condition: "Excellent", flaws: "None noted", distance: 0.8, measurements: { "US size": "7", Heel: "2 in block", Fit: "True to size" }, blockedDates: [], minNotice: "1 day", description: "Pointed wine suede on a low, steady block heel." },
  { id: "suede-hobo", ownerId: "ava", title: "Chocolate Suede Hobo Shoulder Bag", brand: "Khaite", category: "Bag", size: "One size", image: hobo, gallery: [hobo], dailyRate: 15, deposit: 120, retail: 0, cleaningFee: 0, occasions: ["Weekend", "Brunch", "Photo walk", "Work"], styleTags: ["Quiet luxury", "Vintage", "Boho"], condition: "Like new", flaws: "None noted", distance: 1.4, measurements: { Width: "14 in", Height: "11 in", Depth: "4 in", Strap: "10 in drop" }, blockedDates: [], minNotice: "1 day", description: "Slouchy brown suede that fits a camera, a book and a cardigan." },
  { id: "satin-clutch", ownerId: "maya", title: "Black Satin Evening Clutch", brand: "Mango", category: "Bag", size: "One size", image: clutch, gallery: [clutch], dailyRate: 7, deposit: 40, retail: 70, cleaningFee: 0, occasions: ["Date night", "Cocktail", "Work event", "Wedding"], styleTags: ["Minimal", "Evening"], condition: "Excellent", flaws: "None noted", distance: 0.8, measurements: { Width: "10 in", Height: "4 in", Depth: "2 in" }, blockedDates: [], minNotice: "1 day", description: "Slim black satin with a gold bar clasp. Fits a phone, card and lipstick." },
  { id: "silk-scarf", ownerId: "maya", title: "Navy Paisley Silk Scarf", brand: "Vintage", category: "Accessory", size: "One size", image: scarf, gallery: [scarf], dailyRate: 5, deposit: 25, retail: 0, cleaningFee: 0, occasions: ["Weekend", "Brunch", "Photo walk", "Work"], styleTags: ["Vintage", "Silk", "Romantic"], condition: "Good", flaws: "Small pull near one corner", distance: 0.8, measurements: { Size: "27 × 27 in" }, blockedDates: [], minNotice: "1 day", care: "Hand wash cold or dry clean.", description: "Navy, cream and rust paisley. Tie it at the neck or on a bag strap." },
  { id: "leather-belt", ownerId: "lena", title: "Black Leather Belt, Gold Buckle", brand: "A.P.C.", category: "Accessory", size: "S", image: belt, gallery: [belt], dailyRate: 4, deposit: 20, retail: 150, cleaningFee: 0, occasions: ["Work", "Work event", "Weekend"], styleTags: ["Tailored", "Minimal"], condition: "Excellent", flaws: "None noted", distance: 1.9, measurements: { Length: "34 in", Width: "1 in", Fits: "26–30 in waist" }, blockedDates: [], minNotice: "1 day", description: "Smooth black calf with a brushed gold buckle." },
];

const iso = (n: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
/** Demo listings owned by the guest demo user (not given to signed-in accounts). */
export const demoMyItems: Item[] = [
  { id: "my-rose-satin", ownerId: ME, title: "Rose Satin Slip Dress", brand: "Réalisation Par", category: "Dress", size: "S", image: roseSatin, dailyRate: 24, deposit: 70, retail: 280, cleaningFee: 12, occasions: ["Date night", "Wedding", "Cocktail"], styleTags: ["Silk", "Romantic", "Minimal"], condition: "Excellent", flaws: "None noted", distance: 0, measurements: { Bust: "33 in", Waist: "27 in", Hips: "36 in", Length: "48 in" }, garment: { unit: "in", bust: 33, waist: 27, hips: 36, length: 48, stretch: "none", fit: "regular", confirmed: true }, blockedDates: [], blocks: [], minNotice: "1 day", care: "Dry clean only. Steam on low; do not wring.", description: "Bias-cut satin in dusty rose. Available — upcoming dates open." },
  { id: "my-sage-bag", ownerId: ME, title: "Sage Leather Shoulder Bag", brand: "Polène", category: "Bag", size: "One size", image: sageBag, dailyRate: 18, deposit: 120, retail: 0, cleaningFee: 0, occasions: ["Brunch", "Work", "Date night"], styleTags: ["Minimal", "Quiet luxury"], condition: "Like new", flaws: "None noted", distance: 0, measurements: { Width: "10 in", Height: "6 in" }, blockedDates: [], blocks: [{ id: "seed-block", start: iso(0), end: iso(6) }], minNotice: "1 day", care: "Wipe with a damp cloth; leather conditioner monthly. Leather specialist for stains.", description: "Smooth sage calf leather with a gold buckle." },
  { id: "my-pearl-drops", ownerId: ME, title: "Freshwater Pearl Drop Earrings", brand: "Mejuri", category: "Jewelry", size: "One size", image: pearlDrops, dailyRate: 7, deposit: 40, retail: 0, cleaningFee: 0, occasions: ["Wedding", "Cocktail", "Date night", "Work"], styleTags: ["Romantic", "Minimal"], condition: "Excellent", flaws: "None noted", distance: 0, measurements: { Drop: "1 in", Closure: "Gold-plated hook" }, blockedDates: [], blocks: [], minNotice: "1 day", care: "Wiped with alcohol pads between rentals; store in pouch.", description: "Oval freshwater pearls on slim gold hooks.", sanitizedAt: "2026-11-14" },
  { id: "my-suede-boots", ownerId: ME, title: "Tan Suede Block-Heel Ankle Boots", brand: "Everlane", category: "Shoes", size: "US 7.5", image: suedeBoots, dailyRate: 12, deposit: 60, retail: 0, cleaningFee: 0, occasions: ["Weekend", "Work", "Brunch"], styleTags: ["Minimal", "Vintage"], condition: "Very good", flaws: "Light creasing at toe", distance: 0, measurements: { Heel: "2 in", Fit: "True to size" }, blockedDates: [], blocks: [], minNotice: "1 day", care: "Insoles disinfected between rentals; suede brush only.", description: "Soft tan suede with a walkable stacked heel and side zip.", sanitizedAt: "2026-11-12" },
];

export const seedRentals: Rental[] = [
  { id: "r1", itemId: "black-suit", renterId: ME, ownerId: "lena", start: "2026-10-20", end: "2026-10-22", status: "Completed", pickup: "Blue Bottle, Mint Plaza", messages: [{ from: "lena", text: "Hope the interview went well!", at: "Oct 22" }], reviewed: true },
  { id: "r3", itemId: "my-rose-satin", renterId: "maya", ownerId: ME, start: "2026-11-28", end: "2026-11-29", status: "Requested", pickup: "Ritual Coffee, Valencia St", messages: [{ from: "maya", text: "Hi! Could I borrow this for a friend's engagement dinner?", at: "Nov 14" }] },
  { id: "r4", itemId: "my-rose-satin", renterId: "ava", ownerId: ME, start: "2026-12-05", end: "2026-12-06", status: "Confirmed", pickup: "Dolores Park, 18th St entrance", messages: [{ from: "ava", text: "See you at Dolores on the 5th!", at: "Nov 10" }] },
  { id: "r2", itemId: "floral-sun", renterId: ME, ownerId: "ines", start: "2026-11-21", end: "2026-11-22", status: "Confirmed", pickup: "Noe Valley Library steps", messages: [{ from: "ines", text: "Confirmed! It's freshly pressed.", at: "Nov 12" }] },
];


const members = new Map<string, User>();
export function registerMember(id: string, name: string, neighborhood = "", zip = "") {
  const previous = members.get(id);
  members.set(id, { id, name, neighborhood: neighborhood || previous?.neighborhood || "", zip: zip || previous?.zip || "", avatar: "", bio: "", styleTags: [], size: "", rating: 0, reviews: 0, responseRate: 0, responseTime: "Not yet available", points: 0 });
}
export const getUser = (id: string): User => users.find((u) => u.id === id) ?? members.get(id) ?? { id, name: "Member", avatar: "", bio: "", zip: "", neighborhood: "", styleTags: [], size: "", rating: 0, reviews: 0, responseRate: 0, responseTime: "Not yet available", points: 0 };
export const getItem = (id: string) => items.find((i) => i.id === id) ?? demoMyItems.find((i) => i.id === id);

/** Style compatibility: % overlap of style tags (Jaccard), boosted by same size. */
export function compatibility(a: User, b: User) {
  const A = new Set(a.styleTags), B = new Set(b.styleTags);
  const inter = [...A].filter((t) => B.has(t)).length;
  const union = new Set([...A, ...B]).size || 1;
  return Math.min(99, Math.round((inter / union) * 85 + (a.size === b.size ? 15 : 0)));
}

export type Pricing = { days: number; rental: number; cleaning: number; deposit: number; discount: number; total: number };
/** Days are inclusive. 100 points = $10 discount, capped at the rental subtotal. */
export function priceRental(item: Item, start: string, end: string, points = 0): Pricing {
  const days = Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1);
  const rental = days * item.dailyRate;
  const discount = Math.min(rental, Math.floor(points / 100) * 10);
  return { days, rental, cleaning: item.cleaningFee, deposit: item.deposit, discount, total: rental + item.cleaningFee + item.deposit - discount };
}

export type RecCtx = { soulmates: string[]; favorites: string[]; savedPostItems: string[] };
export type Rec = { item: Item; score: number; reasons: string[] };
/** Two-step demo ranking: hard eligibility (size, budget for 2 days, ≤5 mi; date-blocked items stay visible), then score. Saves visibly boost rank. */
export function recommend(q: { occasion: string; size: string; budget: number; date?: string }, ctx: RecCtx, pool: Item[] = items): Rec[] {
  return pool
    .filter((i) => (!q.size || i.size === q.size || i.size === "One size" || i.category === "Shoes")
      && (!q.budget || i.dailyRate * 2 <= q.budget)
      && i.distance <= 5)
    .map((i) => {
      let s = 0; const reasons: string[] = [];
      if (q.occasion && i.occasions.some((o) => o.toLowerCase().includes(q.occasion.toLowerCase()))) s += 5;
      if (ctx.favorites.includes(i.id)) { s += 6; reasons.push("On your wishlist"); }
      if (ctx.savedPostItems.includes(i.id)) { s += 5; reasons.push("From a saved post"); }
      if (ctx.soulmates.includes(i.ownerId)) { s += 4; reasons.push("From your Closet Soulmate"); }
      s += Math.max(0, 3 - i.distance);
      return { item: i, score: s, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export const pickupSpots = ["Ritual Coffee, Valencia St", "Bernal Heights Library", "Mission Dry Cleaners (partner, demo)", "Dolores Park, 18th St entrance"];
