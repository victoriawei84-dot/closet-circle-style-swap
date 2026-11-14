import { createFileRoute } from "@tanstack/react-router";
import { editImage, imageSettings } from "@/lib/image-gateway.server";

const MAX = 8 * 1024 * 1024;
const PROMPT = (title: string) =>
  `Create an illustrative styling preview. Image 1 is the renter (keep their body shape, pose, skin tone, hair and background; if the face is hidden or cropped, keep it that way — never invent a face). Image 2 is the garment: "${title}". Dress the person in image 2's garment, matching its color, fabric texture, neckline, length and hardware. Keep proportions realistic; do not slim or reshape the body. Natural light, photo-realistic.`;

export const Route = createFileRoute("/api/preview-on-me")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response(JSON.stringify({ error: { message: "AI preview is not configured." } }), { status: 500 });
        const inForm = await request.formData();
        const person = inForm.get("person"), garment = inForm.get("garment");
        const title = String(inForm.get("title") ?? "the garment").slice(0, 120);
        if (!(person instanceof File) || !(garment instanceof File)) return new Response(JSON.stringify({ error: { message: "Two photos are required." } }), { status: 400 });
        if (person.size > MAX || garment.size > MAX || !person.type.startsWith("image/") || !garment.type.startsWith("image/"))
          return new Response(JSON.stringify({ error: { message: "Photos must be images under 8 MB." } }), { status: 400 });
        const form = new FormData();
        form.append("image[]", person, "person");
        form.append("image[]", garment, "garment");
        form.set("prompt", PROMPT(title));
        form.set("size", "1024x1536");
        form.set("stream", String(inForm.get("stream") ?? "true"));
        const upstream = await editImage({ ...imageSettings, apiKey }, form);
        return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-cache" } });
      },
    },
  },
});
