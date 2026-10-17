<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Truck inventory lives in the `trucks` table; pages read it via `trucksQuery` (public server fn with publishable key) so SSR works without a session. Why: admins edit inventory without code changes.
- Admin access is checked with `has_role(uid,'admin')` in RLS; the first account created gets admin via an auth trigger. Why: no hardcoded credentials, roles kept out of user-editable data.
- AI calls (chat route `/api/chat`, truck advisor server fn) run server-side through the Lovable AI Gateway Responses API. Why: keeps the key off the browser.
- Chat history is one conversation stored in the visitor's localStorage. Why: owner's choice, no visitor accounts.
