# ClassSpark — launch & growth guide

Your ad-monetized classroom tools hub. Six live tools already; every week we can bolt on more.
All tools run 100% in the visitor's browser (no server, no database = free hosting, zero maintenance).

## What you have

File | What it is
--- | ---
`index.html` | Hub homepage (links + SEO copy)
`wheel/index.html` | 🎡 Wheel Spinner / random name picker (flagship)
`timer/index.html` | ⏱️ Countdown timer + stopwatch (fullscreen mode)
`teams/index.html` | 🧩 Random team generator (print/copy)
`seating/index.html` | 🪑 Seating chart maker (drag & drop, print)
`dice/index.html` | 🎲 Dice roller (d6 pips + d4–d20)
`words/index.html` | 🔤 Word counter (reading/speaking time, top words)
`shared/` | style.css + one .js per tool
`robots.txt`, `sitemap.xml` | SEO plumbing

## ✅ Launched — live on GitHub Pages

**Live URL:** `https://ios-ug.github.io/classspark/` (all 7 pages verified HTTP 200)
**Repo:** `https://github.com/IOS-UG/classspark` (public — link this to clients/buyers; also serves as your backup)

Shipping updates is now fully automatic: edit files → `git add -A && git commit -m "…" && git push` → Pages rebuilds in ~1 minute.

**Optional upgrade (~$10/yr):** buy a short domain (e.g. `classspark.app`) → GitHub repo *Settings → Pages → Custom domain* → enter it, add the DNS records GitHub shows → then ask me to repoint every canonical/sitemap URL to it (one command). A custom domain lifts brand + long-term ad rates.

## First-week SEO (do once the site is live)

1. **Google Search Console** → add property `https://ios-ug.github.io/classspark/` (URL-prefix method) → verify.
2. Submit `https://ios-ug.github.io/classspark/sitemap.xml` under *Sitemaps*.
3. Request *manual indexing* of the homepage + wheel page (speeds up discovery).
4. Canonicals and sitemap already point at the live URL — nothing to replace. (Add a GA4 snippet later when tracking traffic matters.)

## AdSense (money) — when and how

- **Not yet.** Applying with 4 pages will get refused; applying after the site has ~10 quality pages & 3–4 weeks age has a decent chance.
- Meanwhile we add **2–3 more tools/week** (each is quickly built together): noise meter, seating chart, question picker, flashcards, dice roller, word counter for students, homework timer, etc. Every new tool = another door hands traffic in.
- Ad placement slots: each page has room for a top-of-content and above-footer ad. Once approved, put the code where I've marked `.ad-slot` placeholders (I'll wire it when you're approved).
- Feel helpdesk style: AdSense demands a **Privacy Policy + About** page — I'll generate those when we reach 10 pages.

## Honest income math (so you plan on facts)

- 1,000 visits ≈ $3–8 (general tools traffic, US-heavy).
- $/month ≈ visits / 1000 × $5. → 10k visits/mo ≈ **$50**; 50k ≈ **$250**.
- Most tool sites hit 10k/mo within **3–6 months** of steady publishing. That's why you keep the Stage-0 gigs/platforms running alongside.
- The wheel (`/wheel/`) is your best shot at shared traffic: ask 3 friends/teachers you know IRL to try it — organic shares follow genuinely useful tools.

## Weekly rhythm going forward (1–2 hrs with me)

1. Ask me: **"add tool: [idea]"** — I build the page + JS, you deploy.
2. Update `sitemap.xml` (I do it) → submit in Search Console.
3. At ~10 quality pages & 3–4 weeks of age → apply to AdSense; later upgrade to premium networks at ~50k visits/mo (they pay 4–10× more).

## Backup (already handled)

Code is committed and pushed to GitHub after every change — that *is* your backup.

## GitHub (done)

- Repo: **https://github.com/IOS-UG/classspark** (public)
- Pages hosting: on, auto-rebuilds from `main`
- Push credential saved in `~/.git-credentials` on this machine — pushes need nothing extra
- Revoke my access anytime: delete the `classspark` token at github.com/settings/tokens (paste a fresh one next session to restore)
- Want your real name on commits? `git config user.name "Your Name" && git config user.email "you@example.com"`, then ask me to rewrite history

## Renaming the brand

ClassSpark is a working default, not sacred. To rename: find-replace "ClassSpark" across files + swap the emoji/favicon if wanted.
