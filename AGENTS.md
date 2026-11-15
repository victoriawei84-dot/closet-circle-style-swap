<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- App state (favorites, soulmates, rentals, points, listings) lives in src/lib/store.tsx with localStorage and seed data in src/lib/data.ts — prototype without backend; migrate to Lovable Cloud tables when persistence/auth is added.

<!-- AGENT-MEMORY:BEGIN -->
- Real listings, photos and rental requests use Cloud records with database-enforced ownership, price snapshots and serialized booking validation; local storage remains demo/social state only.
- Keep stylist drafts, including uploaded File objects, in account-scoped session memory so detail-page round trips preserve work without persisting private photos.
- Render brand lettering through the shared BrandLogo so header and footer typography stay identical.
- Keep the shared page shell stable without route-keyed opacity animations; preload main sections after hydration to avoid adding a visual delay to every navigation.
- Homepage destination tiles use per-tile scene metadata and portrait aspect ratios for full-outfit imagery, so people and landmarks remain visible across screen sizes without changing preserved tiles.
<!-- AGENT-MEMORY:END -->
