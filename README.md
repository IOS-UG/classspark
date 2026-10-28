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

## Launch today (~15 minutes, $0)

1. Go to **netlify.com** → sign up free.
2. After login, drag & drop the whole `class-spark` folder onto the deploy area → your site is live at `something.netlify.app`.
3. Site settings → *Change site name* → pick something free. Try `classsparktools.netlify.app` or `classspark-app.netlify.app`.
4. Test all 3 tools once (visit them on your phone too). That's your initial "MVP" proof.

**Optional custom domain (~$10/yr):** Namecheap → buy e.g. `classspark.app` or a name you like → Netlify → *Domain settings → Add domain* → enter the two Namecheap DNS records Netlify shows (A/CNAME). SSL is automatic + free.

## First-week SEO (do once the site is live)

1. **Google Search Console** (searchCentral → search.google.com/search-console) → add your property → verify.
2. Replace `classspark.pages.dev` in `sitemap.xml` with your real domain, then submit the sitemap in Search Console.
3. Request *manual indexing* of the homepage + wheel page from Search Console (speeds up discovery).
4. Confirm each page's `canonical` URL matches its final address (search-and-replace the same domain from step 2).

Then sign up for **Google Analytics 4** and paste its snippet into every page's `<head>` right before `</head>` so you can watch traffic arrive.

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
3. When you pass 5–10 funds → flip on AdSense; later upgrade to premium ad networks at ~50k visits/mo (they pay 4–10× more).

## Backup rule (do this after deploying)

Copy the whole `class-spark` folder somewhere safe weekly (or push it to a free **GitHub** repo). Hosting a free deploy means being able to re-drag the folder anytime — nothing can be "lost."

## Push to GitHub (~3 minutes, one-time)

1. Go to **github.com/new** → repository name: `classspark` → Public → Create (no checkboxes).
2. In your terminal on this machine, inside this folder run exactly two commands (replace `YOUR-USERNAME`):

```
git remote add origin https://github.com/YOUR-USERNAME/classspark.git
git push -u origin main
```

Done — your code is now backed up on GitHub. Bonus: GitHub + Cloudflare Pages/Starter connects automatically and lets you deploy by pushing.
**Change the commit author identity if you want your real name:** `git config user.name "Your Name"` and `git config user.email "you@example.com"` (ask your AI companion to amend the first commit afterwards).

## Renaming the brand

ClassSpark is a working default, not sacred. To rename: find-replace "ClassSpark" across files + swap the emoji/favicon if wanted.
