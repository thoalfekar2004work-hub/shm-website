# SHM — selling website

Bilingual (Arabic / English) catalog and order-capture site for SHM.
Static Astro site on Cloudflare Pages, with one Pages Function for checkout.

A website order is a **lead**, not a sale. There is no payment and no account:
the customer submits name / phone / governorate / address, you get a Telegram
message and a Notion row, and you confirm on WhatsApp before shipping.

---

## Table of contents

1. [Run it locally](#run-it-locally)
2. [Adding a product](#adding-a-product) ← the thing you will do most
3. [Best sellers and offers](#best-sellers-and-offers)
4. [Delivery charge](#delivery-charge)
5. [First-time setup (Telegram, Notion, Cloudflare)](#first-time-setup)
6. [Deploying](#deploying)
7. [Products waiting on photos](#products-waiting-on-photos)
8. [The scroll showcase and motion](#the-scroll-showcase-and-motion)
9. [Rules the site enforces](#rules-the-site-enforces)
10. [Project layout](#project-layout)

---

## Run it locally

```bash
npm install
npm run dev
```

Opens on <http://localhost:4321>. This is enough for anything visual.

To test the **checkout endpoint** as well, you need the Workers runtime:

```bash
npm run worker:dev
```

That builds the site and serves it on <http://127.0.0.1:8788> running
**`src/worker.ts`** — the exact same entry point Cloudflare runs in
production — reading secrets from `.dev.vars`. Use this one, not
`pages:dev` (kept only for the unlikely case this ever becomes a real
git-connected Pages project — see [Deploying](#deploying) for why that
distinction matters here).

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds social preview images, builds the site, runs the origin-claim sweep |
| `npm run worker:dev` | Builds and serves via `src/worker.ts` — mirrors production |
| `npm run og` | Rebuilds only the social preview images |
| `npm run check:banned` | Runs the origin-claim sweep on its own |
| `npm run check:types` | Type-checks both the Astro site and the two Workers-runtime files |
| `npm run ingest` | One-time re-import of the original photo folders (you will not normally need this) |

---

## Adding a product

Three steps. No code.

### 1. Make the photo folder

Create a folder under `src/assets/products/` named **exactly** the product's
slug — lowercase English, words joined by hyphens:

```
src/assets/products/mayo-scissors-curved/
    01-hero.jpg          ← the tile photo. Always the first one alphabetically.
    02-tip-macro.jpg
    03-lock.jpg
```

- The **first file alphabetically is the hero** — the photo used on the tile,
  at the top of the product page, and in the WhatsApp link preview. Numbering
  them `01-`, `02-`, `03-` keeps that predictable.
- Drop the photos in at full size. The build shrinks and converts them.
- Shoot the tips and the lock close up. Those macro shots are what convinces a
  surgeon, and the site lets them zoom full-screen.

### 2. Add the entry to `src/data/products.json`

Copy an existing entry and change the values:

```json
{
  "slug": "mayo-scissors-curved",
  "category": "scissors",
  "name_en": "Mayo Scissors — Curved",
  "name_ar": "مقص مايو منحني",
  "spec_line_en": "Mayo Scissors 12cm Curved — Natra",
  "price_iqd": 30000,
  "size": "12cm",
  "variant_en": "Curved",
  "variant_ar": "منحني",
  "specs_en": ["Size: 12cm", "German stainless steel (Rostfrei)", "CE marked", "QC-tested before shipping"],
  "specs_ar": ["القياس: 12 سم", "ستانلس ستيل ألماني (Rostfrei)", "علامة CE", "نفحصه قبل الشحن"],
  "benefit_en": "Heavier blade built for cutting tissue and sutures.",
  "benefit_ar": "شفرة أقوى مخصصة لقص الأنسجة والخيوط الجراحية.",
  "in_stock": true,
  "low_stock": false,
  "is_set": false,
  "sort": 60
}
```

| Field | Notes |
|---|---|
| `slug` | Must match the folder name exactly. Becomes the URL: `/product/mayo-scissors-curved` |
| `category` | One of `scissors`, `needle-holders`, `forceps`, `hemostats` — or `sets` if `is_set` is true |
| `spec_line_en` | Stays English in both languages. It is the authority signal — don't translate it |
| `price_iqd` | A plain number, no commas |
| `specs_en` / `specs_ar` | Same number of lines, same order. Leave a field out entirely rather than inventing one |
| `low_stock` | `true` shows a "كمية محدودة / Limited stock" badge. Only set it when it's actually true |
| `in_stock` | `false` keeps the price visible, disables Add to Cart, and keeps the WhatsApp button (a restock request is still a lead) |
| `sort` | Lower numbers come first. Leave gaps (10, 20, 30…) so you can slot things in |
| `contents_en` / `contents_ar` | Optional, for sets — the list of pieces included. Omit the field and no list is shown |
| `best_seller` | Optional. `true` adds the badge and puts it in the homepage best-sellers row — see [Best sellers and offers](#best-sellers-and-offers) |
| `promo` | Optional. A real time-limited offer — see [Best sellers and offers](#best-sellers-and-offers) |

### 3. Push

```bash
git add . && git commit -m "Add Mayo scissors" && git push
```

Cloudflare rebuilds automatically. The product appears on the category page,
in search, and gets its own shareable link with a preview image.

**If you forget the photos, the build stops and tells you which slug is
missing.** That is on purpose — a product page with no photo doesn't sell.

### Changing a price

Edit `price_iqd` in `src/data/products.json` and push. The price updates on the
tile, the product page, the cart, the link preview and the Telegram message at
the same time — those all read the same number.

---

## Best sellers and offers

### Best sellers

Add `"best_seller": true` to any product in `products.json`. That product gets
a badge and appears in the **الأكثر مبيعاً / Best sellers** section at the
bottom of the homepage. Remove the flag and it disappears. If nothing is
flagged, the whole section vanishes rather than showing an empty shelf.

Currently flagged: **Red Iris**, **Iris Straight**, **Iris Rainbow**.

> These three were picked from the stock and days-of-cover figures in the
> inventory screenshots you supplied — dividing stock by days of cover gives
> units sold per day, and those three came out fastest by a wide margin
> (Rainbow 0.77/day, Red Iris 0.30, Straight 0.20, next best 0.17). **That is
> an inference from a forecast, not your actual sales ledger.** You know what
> really sells — change the flags if this is wrong.

There is no automatic "best seller" detection, and there never should be: the
site has no access to your sales. A badge that claims something is a best
seller when it isn't is the kind of thing this buyer notices.

### Time-limited offers

Add a `promo` block to a product:

```json
"price_iqd": 100000,
"promo": {
  "was_iqd": 110000,
  "ends": "2026-08-03T21:00:00+03:00"
}
```

That gives you, on the tile and the product page: an **عرض / Offer** badge, the
old price struck through beside the current one, and a live countdown to the
end time.

**`price_iqd` is always the price actually charged.** The countdown never
changes what anyone pays. This is deliberate — a timer that swings the price
means a customer can be shown one number and billed another when the clock
turns over mid-checkout, or when their phone's clock is wrong.

When `ends` passes, the badge, the struck price and the clock all remove
themselves — on pages already open in someone's browser too, not just on the
next build. The price stays where it is. **If you want the price to go back up
when the offer ends, edit `price_iqd` yourself** — the site will not raise a
price behind your back.

The build refuses to ship dishonest offer data:

| Mistake | What happens |
|---|---|
| `was_iqd` not higher than `price_iqd` | Build **fails** — that would be a fake saving |
| `ends` not a real date | Build **fails** with the expected format |
| `ends` already passed | Build warns; the offer simply isn't shown |

> ⚠️ **There is an example offer live on the ENT set right now.** The 110,000
> figure comes from your own set graphic, but **the end date is a placeholder I
> made up**. Confirm both, or delete the `promo` block from `set-ent` in
> `products.json`, before you send the site to anyone.

### A word on this

Your build spec bans countdowns and urgency marketing outright (§0.2), and
describes the buyer as "proof-first, certainty-first, hates salesy fluff".
Specialist surgeons are a low-trust audience for this kind of thing, and a
countdown is the single easiest way to make a supplier look like a marketplace
reseller.

The machinery here is built so it can only ever tell the truth — real dates,
real previous prices, no silent resets. Used for an actual promotion it is
fine. Left running permanently on the same product, it will cost you more
credibility than it earns in orders.

---

## Delivery charge

A flat **5,000 IQD**, the same for every governorate, paid by the customer on
delivery along with the goods.

It is defined once, in `src/lib/order-shared.ts`:

```ts
export const DELIVERY_FEE_IQD = 5000;
```

Change that one number and it updates everywhere at once — the product page
note, the cart, the checkout summary, the WhatsApp fallback message, the
Telegram message, and the total written to Notion. The **server** is what
decides the amount actually charged, so the customer can never be shown one
figure and billed another.

The Telegram message breaks it out so the arithmetic is obvious:

```
🧾 مجموع المنتجات: 140,000 IQD
🚚 التوصيل: 5,000 IQD
💰 المجموع: 145,000 IQD
```

In Notion, **Total IQD** is the grand total including delivery, and the
`Items` field carries a `delivery = 5,000` line so the row reconciles.

---

## First-time setup

You only do this once. It takes about 20 minutes.

### A. Telegram bot (this is what actually notifies you)

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot`. Give it a name (e.g. `SHM Orders`) and a username ending in
   `bot` (e.g. `shm_orders_bot`).
3. BotFather replies with a **token** that looks like
   `8123456789:AAH1x2Y3z...`. That is your `TELEGRAM_BOT_TOKEN`. Keep it
   private — anyone with it can post as your bot.
4. Now find your chat id. Search for **@userinfobot** in Telegram, start it,
   and it replies with your numeric `Id`. That is your `TELEGRAM_CHAT_ID`.
5. **Send your new bot a message** (`hi` is fine). A bot cannot message you
   until you have messaged it first — skip this and orders will silently fail.

### B. Notion orders database

1. In Notion, create a new database (Table). Name it `SHM Orders`.
2. Create these properties, with **exactly** these names and types — a typo
   here means the row silently fails to save:

   | Property name | Type |
   |---|---|
   | `Customer` | Title (the default first column — rename it) |
   | `Phone` | Phone number |
   | `Governorate` | Select |
   | `Address` | Text |
   | `Items` | Text |
   | `Total IQD` | Number |
   | `Status` | Select, with options: `New lead`, `Confirmed`, `Shipped`, `Delivered`, `Canceled` |

   (The order's date comes free from Notion's built-in "Created time".)

3. Go to <https://www.notion.so/my-integrations> → **New integration**. Name it
   `SHM Website`, pick your workspace, submit. Copy the **Internal Integration
   Secret** — that is your `NOTION_TOKEN`.
4. Back on your database page: **⋯** menu → **Connections** → **Connect to** →
   pick `SHM Website`. Without this step Notion rejects everything.
5. Copy the database id from its URL. In
   `notion.so/myworkspace/8f2a1b3c4d5e6f708192a3b4c5d6e7f8?v=...`
   the id is `8f2a1b3c4d5e6f708192a3b4c5d6e7f8` — the part after the last `/`
   and before the `?`. That is your `NOTION_ORDERS_DB_ID`.

### C. Put the four values into Cloudflare

Cloudflare Pages → your project → **Settings** → **Environment variables** →
add all four, for **both** Production and Preview:

```
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
NOTION_TOKEN
NOTION_ORDERS_DB_ID
```

Then redeploy (Deployments → ⋯ → Retry deployment). Environment variables are
only picked up by a new build.

For local testing, put the same four in a file called `.dev.vars` in the
project root. It is gitignored — it must never be committed.

### If Telegram is not configured

The order endpoint returns an error and the checkout page shows the customer a
**"Send the order on WhatsApp"** button with their whole order already typed
out. You still get the lead. But fix the configuration — you don't want to rely
on that.

### If Notion fails but Telegram worked

The order still succeeds. You got the message, which is what matters. The
Notion error is written to the Cloudflare Pages logs
(Deployments → your deployment → Functions).

---

## Deploying

**This project is a Workers-with-static-assets project, not classic Pages —
even though it was created via Cloudflare's "Create → Pages → Connect to
Git" flow.** Its live URL is a `*.workers.dev` domain, not `*.pages.dev`.
Cloudflare has been merging the two platforms, and connecting a Git repo
through that flow can now provision either kind depending on account/region —
you get whichever one Cloudflare gives you, and the difference matters:

- **Classic Pages** auto-detects a `functions/` directory and turns each file
  into a route. No `wrangler.toml` needed for that.
- **Workers-with-assets** has no idea what a `functions/` directory is. It
  needs an explicit entry point.

That entry point is **`src/worker.ts`** — it handles `/api/order` itself and
hands every other request to the static-assets binding. `wrangler.toml`
wires that up (`main` = the entry point, `[assets]` = the built `dist/`
folder). Both files are already in the repo; you don't need to touch them
unless Cloudflare's build log ever again shows something like *"Missing
entry-point to Worker script"* — that error means this pairing broke.

First time:

1. Push this repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick the repo.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add the four environment variables from section C above — for **both**
   Production and Preview.
5. Deploy. You'll get either a `https://<project>.pages.dev` or a
   `https://<project>.<account>.workers.dev` address — check the deployment
   log to see which; either way `npm run build` + `wrangler.toml` handle it.

After that, every `git push` deploys automatically.

When you buy a domain: your project → **Custom domains** (same place for
either project type). Then update `SITE_URL` in `src/i18n/strings.ts` and
`site` in `astro.config.mjs` so link previews and the sitemap point at the
real domain.

### Before you tell anyone about the site

Do this on your actual phone, not a laptop:

1. Browse → open a product → add to cart → checkout with your own number.
2. Check the Telegram message arrives, with the right Arabic and the right total.
3. Check the Notion row appeared.
4. Paste a product link into a WhatsApp chat and confirm the preview shows the
   photo, the name and the price.

---

## Products waiting on photos

`src/data/products-pending-photos.json` holds products that are **in stock but
not on the site**, because no photos were supplied for them:

| Product | Why it's not live |
|---|---|
| Forceps — Straight | No photo that clearly shows the straight variant |
| Mosquito Hemostat — Straight | No photo supplied |
| Mosquito Hemostat — Curved | No photo supplied |
| Iris Scissors — Curved Micro Serrated | No photo, and no matching line in the stock list — confirm it exists |
| Needle Holder (plain) | Looks like a duplicate of the Halsey TC — same price, no separate photo |

To publish one: add its photo folder, then move its entry from
`products-pending-photos.json` into `products.json`. Nothing else to change.

---

## The scroll showcase and motion

### The showcase

Below the hero, the homepage pins a full-screen stage and steps through three
instruments as the customer scrolls — **red iris → rainbow iris → needle
holder**. The order is a plain list at the top of
[`src/components/Showcase.astro`](src/components/Showcase.astro):

```ts
const SEQUENCE = ['iris-scissors-red-curved', 'iris-scissors-rainbow', 'needle-holder-halsey-tc-12-5cm'];
```

Reorder that array, or swap in different slugs, and the sequence changes. Any
slug in `products.json` works. Adding a fourth just makes the pinned section
one screen longer — each panel gets an equal share of the scroll.

Each panel pulls its own photo, names, spec line, benefit and price from the
product data, so nothing has to be kept in sync by hand.

### Motion elsewhere

- Cards and section headers rise into view as you scroll, staggered across a row
- The hero lines enter in sequence on load
- The nav lifts onto a shadow once the page scrolls
- The cart badge ticks when the count changes
- Product photos ease in slightly on hover (desktop only)
- Add to Cart morphs into a − / quantity / + stepper once the item is in the cart

All of it is off for visitors who have "reduce motion" enabled in their phone
or system settings — content simply appears, already in place. Nothing bounces,
spins, or loops.

To add a reveal to something new, put `data-reveal` on it (and optionally
`data-reveal-delay="80"` in milliseconds to stagger it). The handling lives in
[`src/scripts/motion.ts`](src/scripts/motion.ts).

---

## Rules the site enforces

These are built in, not just conventions.

**Origin claims are an allow-list.** `npm run build` runs
`scripts/check-banned-words.mjs` over `src`, `functions`, `public` **and the
built output**, and fails the build on any origin claim that is not explicitly
approved.

**Allowed** (and currently used on every product):

> German stainless steel (Rostfrei) · ستانلس ستيل ألماني (Rostfrei)

**Still blocked, and the build will fail on them:** `Made in Germany`,
`صناعة ألمانية`, or any bare use of `German`/`Germany`/`ألماني` outside the
approved phrase. Those claim the *instruments* are German-made. They are not —
see [The steel line](#the-steel-line) below.

The approved trust language:

> Natra · CE marking · German stainless steel (Rostfrei) · QC before shipping · exchange guarantee

#### The steel line

Every product's steel spec reads **"German stainless steel (Rostfrei)"** /
**"ستانلس ستيل ألماني (Rostfrei)"** in `src/data/products.json`.

Two owner decisions, both deliberate exceptions to the original rule:

| | |
|---|---|
| **`Rostfrei`** (2026-07-27) | German for "stainless"/"rust-free", engraved on the instruments. Not a steel grade (like 420 or 440C) — it says nothing about hardness or composition. Kept because the owner wants the marking reflected in the copy. |
| **`German`** (2026-08-03) | The owner states the **steel is German-sourced** while the instruments are **manufactured elsewhere**. The wording says "German stainless steel", never "German instruments" or "Made in Germany". |

That distinction is the whole point of the wording, and the build enforces it:
"German stainless steel" passes, "Made in Germany" fails.

**If a customer or a regulator asks you to substantiate this, you need a
document from your supplier naming the steel source.** A country-of-origin
claim on a medical device is regulated — it is not the same kind of statement
as "CE marked" or "QC-tested". If you cannot evidence it, drop the word
`German` from the `specs_*` arrays and the site is fine again.

Better still, if your supplier gives you an actual grade (420, 440C,
DIN 1.4021…), put that in instead. It is stronger proof for a surgeon than any
country name, and nobody can dispute it.

**No discount or urgency marketing beyond the offers feature.** No sale
banners, no fake scarcity, no "لا يفوتك". The only stock signal outside of
[offers](#best-sellers-and-offers) is the `كمية محدودة / Limited stock` badge,
shown only when a product's data sets `low_stock: true`. Countdowns exist only
for real, dated `promo` entries — see below.

**Red is reserved.** `#E63946` is used for prices, primary buttons, and the
underline on the active nav item. Nowhere else — no red icons, dividers or
backgrounds.

**Truth only.** If a field is missing from a product's data, the site leaves
that line out. It never fills in a plausible-sounding spec. Sterilisation and
autoclave claims appear only if you write them into `specs_*` yourself.

**Arabic first.** Arabic is the default language and the page starts in RTL.
The AR/EN toggle is in the top bar and the choice is remembered.

---

## Project layout

```
shm-website/
├── functions/api/order.ts     the checkout endpoint (Telegram + Notion)
├── scripts/
│   ├── build-og.mjs           makes the WhatsApp/Instagram link previews
│   ├── check-banned-words.mjs the origin-claim sweep
│   └── ingest-images.mjs      one-time import of the original photo folders
├── src/
│   ├── assets/products/<slug>/   product photos — one folder per product
│   ├── data/
│   │   ├── products.json                 ← you edit this
│   │   ├── products-pending-photos.json  ← waiting on photos
│   │   └── categories.json
│   ├── i18n/strings.ts        every piece of UI text, in both languages
│   ├── lib/
│   │   ├── catalog.ts         loads and validates products + photos
│   │   └── order-shared.ts    validation + the delivery fee, shared with the server
│   ├── scripts/
│   │   ├── cart.ts            cart state in localStorage
│   │   ├── i18n.ts            AR/EN toggle
│   │   └── motion.ts          scroll reveals, nav elevation, cart badge tick
│   ├── pages/                 one file per page
│   ├── components/
│   │   └── Showcase.astro     the pinned scroll sequence on the homepage
│   └── styles/tokens.css      colours, spacing, fonts
├── public/                    logos, icons, fonts, link previews
├── .dev.vars                  local secrets — never committed
```

Two things worth knowing:

- **`src/i18n/strings.ts` holds all the text.** To reword something on the
  site, change it there and it updates everywhere in both languages.
- **`src/lib/order-shared.ts` is shared by the checkout form and the server.**
  Phone validation runs in both places from the same code, so they can't drift
  apart. The server also recomputes every total from `products.json` — prices
  are never taken from the browser.
