# Estuar — vodič za AI / contributore

Prodajni sajt firme **Estuar** (fiskalizacija, hardver i samouslužna rešenja).
Statički sajt, **Astro 6 + Tailwind 4**, trojezičan **sr / en / ru**, dark+light.

## Komande
```bash
npm install
npm run dev      # dev server na 0.0.0.0:4321 (dostupan i sa mreže)
npm run build    # statički build u dist/
npm run preview  # lokalni pregled build-a (0.0.0.0)
npx astro check  # type-check (treba da bude 0 errors; 1 hint je poznat/benign)
```

## Mentalni model (PROČITAJ PRE IZMENA)
- **Sav sadržaj je data-driven** u `src/data/*`. Skoro svaki string je objekat
  `L = { sr, en, ru }` (tip iz `src/data/site.ts`). **Tekst se menja u `src/data`, ne u markup-u.**
- `src/components/pages/*` su **deljena tela strana** (Home, Service, Solution, Hardware,
  Projects, Promo, About). `src/pages/*` su **tanki wrapperi** koji samo prosleđuju `lang`:
  sr na rootu, en pod `/en`, ru pod `/ru`.
- `src/i18n/ui.ts` = UI prevodi (`ui`), mapa ruta (`routes`), helperi
  (`servicePath`, `solutionPath`, `localePaths`, `useTranslations`, `allLangs`).
- `src/layouts/Base.astro` = `<head>`, fontovi, tema-pre-paint skripta, canonical+hreflang, Header/Footer.

## Gde se šta menja (sadržaj)
| Šta | Fajl |
|---|---|
| Usluge/proizvodi (intro, tagline, features, hardver) | `src/data/services.ts` |
| Rešenja po nameni (problem/approach/points) | `src/data/solutions.ts` |
| Akcija 1200 (lead, includes, koraci, FAQ, audience, trust, cena) | `src/data/promo.ts` |
| Hardver kategorije | `src/data/hardware.ts` |
| Telpo uređaji (slike `images[]`, specs) | `src/data/telpo.ts` |
| Teron softver moduli | `src/data/teron.ts` |
| Kontakt, klijenti, distributeri, ISO, projekti, „O nama" tekst | `src/data/site.ts` |
| Hero naslov/podnaslov, stat blokovi | `src/components/Hero.astro` |
| UI labele, nav, rute, novi jezik | `src/i18n/ui.ts` |

Dodavanje jezika: dopuni `languages/allLangs/routes/ui` u `ui.ts`, dodaj `ru`-ekvivalent
u svaki `L` objekat, i napravi rute pod novim prefiksom u `src/pages/<lang>/`.

## Dizajn sistem (`src/styles/global.css`)
- Paleta: **plava `#2742a6` (primarna/akcija)** + **grafit `#14181f` (ink)** + **limeta `#b6f23a` (akcenat, štedljivo)** + azure `#3b5bb0` (sekundarna).
- ⚠️ **`coral` token = Estuar plava** (ime zadržano zbog kompatibilnosti sa postojećim klasama;
  `bg-coral`/`text-coral` → plava). `lime` koristiti retko (trakice, tačke, sitni akcenti).
- Naslovi: **Space Grotesk** (`--font-display`, primenjen na h1/h2/h3); telo: Outfit.
- Semantički tokeni: `bg/surface/surface-2/fg/muted/border` (runtime vars, menjaju se sa temom).
  Dark se pali preko `data-theme="dark"` na `<html>`.
- Tipografija skalira na velikim ekranima (root font-size media query u `global.css`).

## Konvencije / „gotchas"
- **Logo-čip pravilo:** eksterni brend-logoi (klijenti, distributeri, Telpo, AXESS) idu na
  **bele „čip" kartice** (`bg-white` + `border`), NIKAD `dark:brightness-0 dark:invert`
  (invert uništava boje). Jedino **Estuar sopstveni logo** (Header/Footer/Teron kartica) sme invert-u-belo.
- **Ikone:** koristi samo funkcionalne (`Icon.astro`: arrow, check, kontakt, social, theme, globe, spark).
  Ne vraćaj dekorativne „concept" ikonice (planina, kiosk…) — namerno uklonjene da ne deluje „template".
- **Tailwind 4 ide preko PostCSS** (`postcss.config.mjs`), NE preko `@tailwindcss/vite`
  (nekompatibilno sa Astro 6 rolldown-vite). Ne vraćaj vite plugin.
- **Nova Tailwind klasa** (npr. nov `bg-*`) ume da se ne pojavi u dev modu dok je JIT keš star →
  ako „ne hvata", restartuj dev (`rm -rf node_modules/.vite .astro`).
- **Curly navodnici u SR/string-ovima:** unutar `"..."` koristi `„…”` (curly). Pravi `"` prekida JS string.
- **SR ostaje latinica** — ne ubacuj ćirilicu u `sr` polja (ru je ćirilica).

## Potpisni elementi
- **Fiskalni račun** (`src/components/Receipt.astro`) = glavni vizual za akciju 1200
  (na promo strani i u „Akcija 1200" bloku na početnoj). Sadrži **pravi, skenirljiv QR**
  (lib `qrcode`, generiše se na build-u) koji vodi na `/usluge/fiskalizacija`.
- **Telpo kartice** (`TelpoCard.astro`) rotiraju kroz `images[]` (P9 ima 4 kose perspektive).

## Kontakt forma
`ContactForm.astro` šalje POST na **`/contact.php`** (`public/contact.php`, samostalni PHP/SMTP
mailer, bez treće strane). SMTP kredencijali idu u `public/contact.config.php` **na serveru**
(uzorak: `contact.config.sample.php`; pravi config je u `.gitignore`). Detalji u `README.md`.
PHP radi samo na pravom hostingu (estuar.rs / cPanel), ne na nginx preview-u.

## Build & deploy
- **Produkcija:** estuar.rs = standardni cPanel/PHP hosting; deploy = build pa upload sadržaja `dist/` u `public_html`.
- **Homelab preview:** `estuar.mcevich.in.rs` (Cloudflare tunel, basic auth). Redeploy:
  ```bash
  npm run build && rsync -az --delete dist/ home-gw:/var/www/estuar/ \
    && ssh home-gw 'sudo chown -R vmakevic:www-data /var/www/estuar'
  ```
- `astro.config.mjs` `site: 'https://estuar.rs'` → canonical/hreflang/sitemap pokazuju na produkciju (ok i za preview).

## Pravila
- **Ne commit-uj tajne** (`contact.config.php` je ignorisan; basic-auth/SMTP lozinke nikad u repo).
- **Commit/push samo kad korisnik traži.** Commit poruke završavaj sa
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Posle izmena: `npm run build` + `npx astro check` pre deploya.
