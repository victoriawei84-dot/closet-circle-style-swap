import { createFileRoute } from "@tanstack/react-router";
import { editImage, imageSettings } from "@/lib/image-gateway.server";

const MAX = 8 * 1024 * 1024;
const clean = (v: FormDataEntryValue | null, n = 200) => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, n);
const err = (message: string, status = 400) => new Response(JSON.stringify({ error: { message } }), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/stylist-look")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return err("AI styling is not configured.", 500);
        const f = await request.formData();
        const items = f.getAll("item").filter((x): x is File => x instanceof File).slice(0, 4);
        const person = f.get("person"), poseRef = f.get("pose"), sceneImg = f.get("sceneImage");
        const files = [...items, ...(person instanceof File ? [person] : []), ...(poseRef instanceof File ? [poseRef] : []), ...(sceneImg instanceof File ? [sceneImg] : [])];
        if (!items.length) return err("Pick at least one piece.");
        if (files.some((x) => x.size > MAX || !x.type.startsWith("image/"))) return err("Photos must be images under 8 MB.");
        const titles = clean(f.get("titles"), 400), scene = clean(f.get("scene")), pose = clean(f.get("poseText"));
        let n = items.length;
        const personLine = person instanceof File
          ? `Image ${++n} is the user who uploaded their own photo with consent: keep their appearance, body shape and skin tone.`
          : `No-face mode: do NOT show a clear face. Use a natural faceless pose — back view, side profile with hair covering the face, phone covering the face, head down, or a neck-down crop. Never invent a recognizable stranger's face.`;
        const poseLine = poseRef instanceof File ? `Image ${++n} is a pose reference: copy its composition and pose, not its clothes or person.` : "";
        const sceneLine = sceneImg instanceof File ? `Image ${++n} is the background location — place the person there.` : "";
        const prompt = `Candid street-style fashion photo, natural light, shot on a phone. Images 1–${items.length} are rental pieces (${titles}) — dress the person in exactly these, preserving each piece's color, cut, pattern and hardware; add nothing else branded. ${personLine} ${poseLine} ${sceneLine} Setting: ${scene}. Pose: ${pose}. Realistic proportions, full outfit visible.`;
        const form = new FormData();
        files.forEach((x, i) => form.append("image[]", x, `img${i}`));
        form.set("prompt", prompt);
        form.set("size", "1024x1536");
        form.set("stream", clean(f.get("stream"), 5) || "true");
        const upstream = await editImage({ ...imageSettings, apiKey }, form);
        return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-cache" } });
      },
    },
  },
});
