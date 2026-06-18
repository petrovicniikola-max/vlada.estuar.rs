# Estuar — prodajni sajt

Prodajno orijentisan sajt za Estuar (fiskalizacija, hardver i samouslužna rešenja),
izrađen u **Astro 6** + **Tailwind 4**, sa dark/white temom i srpskim/engleskim jezikom.

## Pokretanje

```bash
npm install
npm run dev        # razvojni server na http://localhost:4321
npm run build      # statički build u dist/
npm run preview    # lokalni pregled build-a
```

## Struktura

- `src/data/` — sav sadržaj (lako se menja, bilingvalno `{ sr, en }`)
  - `services.ts` — usluge/proizvodi + hardver po kategoriji
  - `promo.ts` — akcija „fiskalizacija 1200 din" (tekst je **placeholder**, doteraj pre objave)
  - `site.ts` — kontakt, klijenti, distributeri, ISO, projekti, „o nama" tekst
- `src/i18n/ui.ts` — UI prevodi i mapa ruta (sr na rootu, en pod `/en`)
- `src/components/` — komponente; `pages/` su deljena tela strana (sr i en dele isti kod)
- `src/pages/` — tanke rute koje samo prosleđuju `lang`
- `public/assets/` — slike/fontovi/PDF preuzeti sa starog sajta

## Teme i jezik

- Tema se čuva u `localStorage` (`?theme=dark` / `?theme=light` za test), prati i sistemsku.
- Brend boje i semantički tokeni su u `src/styles/global.css` (`--color-coral`, `--bg`, `--fg`…).
- Jezici: **srpski (root), engleski (`/en`), ruski (`/ru`)**. Svaki string je `{ sr, en, ru }`.

## Kontakt forma (PHP / SMTP — bez treće strane)

Forma (`src/components/ContactForm.astro`) šalje POST na **`/contact.php`** (isti origin).
`public/contact.php` je samostalni PHP mailer (bez biblioteka) koji šalje upit preko
**SMTP-a naloga `estuar@estuar.rs`**. Radi na standardnom hostingu sa PHP-om (cPanel).

**Podešavanje na serveru (jednokratno):**

1. Deploy sajta u `public_html` (build → upload sadržaja `dist/`); `contact.php`
   i `contact.config.sample.php` idu zajedno sa sajtom.
2. Na serveru kopiraj uzorak u pravi config (pored `contact.php`):
   ```bash
   cp contact.config.sample.php contact.config.php
   ```
3. Otvori `contact.config.php` i popuni SMTP podatke (iz cPanel → **Email Accounts →
   Connect Devices** vidiš tačan host/port/security):
   ```php
   return [
     'SMTP_HOST'   => 'mail.estuar.rs',
     'SMTP_PORT'   => 465,            // 465 = SSL, 587 = STARTTLS
     'SMTP_SECURE' => 'ssl',          // 'ssl' (465) ili 'tls' (587)
     'SMTP_USER'   => 'estuar@estuar.rs',
     'SMTP_PASS'   => 'lozinka-naloga',
     'MAIL_FROM'   => 'estuar@estuar.rs',  // isti domen → prolazi SPF/DMARC
     'MAIL_TO'     => 'estuar@estuar.rs',  // gde stižu upiti
   ];
   ```
4. Test: pošalji upit sa sajta → mejl stiže na `MAIL_TO`, sa **Reply-To** na
   posetioca (klikneš „Reply" i odgovaraš direktno).

**Napomene:**
- `contact.config.php` (sa lozinkom) je u `.gitignore` — **ne ide u repo**; pravi se
  samo na serveru.
- Honeypot polje (`botcheck`) + server-side validacija mejla blokiraju botove.
- **Na nginx hostu (npr. homelab preview) PHP se ne izvršava** — forma radi samo na
  pravom PHP hostingu (estuar.rs). Telefon/email linkovi rade svuda.
- Ako vraća grešku, `contact.php` u JSON-u vraća `detail` (npr. `auth-pass`,
  `connect…`) — korisno za dijagnostiku SMTP podešavanja.

## Deploy na cPanel (produkcija — estuar.rs)

Sajt je statički (Astro build) — na cPanel ide **sadržaj foldera `dist/`** u `public_html`.

1. **Build lokalno:**
   ```bash
   npm run build         # pravi dist/ (canonical/sitemap već pokazuju na https://estuar.rs)
   ```
2. **Upload sadržaja `dist/`** u `public_html` (ne sam folder `dist`, nego ono **unutar** njega
   — `index.html`, `assets/`, `contact.php`, `_astro/`, …). Tri načina:
   - **File Manager:** spakuj `dist` u `.zip`, upload u `public_html`, pa „Extract"; ako se raspakuje
     u podfolder, premesti sadržaj u koren `public_html`.
   - **SFTP/FTP** (FileZilla): prevuci sve iz `dist/` u `public_html/`.
   - **rsync preko SSH** (ako hosting ima SSH):
     ```bash
     rsync -az --delete dist/ KORISNIK@estuar.rs:public_html/
     ```
     ⚠️ `--delete` briše sa servera sve što nije u `dist/` — ako u `public_html` imaš i druge
     fajlove (npr. `contact.config.php`), izostavi `--delete` ili dodaj `--exclude=contact.config.php`.
3. **Forma (jednokratno):** na serveru napravi `public_html/contact.config.php` sa SMTP podacima
   (vidi „Kontakt forma"). Taj fajl **ostaje na serveru** i ne briše se pri sledećim deploy-ima
   (zato `--exclude` gore).
4. **HTTPS:** u cPanel uključi SSL (AutoSSL/Let's Encrypt) i „Force HTTPS Redirect" za domen.

**Ponovni deploy** = ponovi korake 1–2 (build + upload). Korak 3 se radi samo prvi put.

Čiste URL-ove (`/usluge/fiskalizacija`) Apache servira automatski (svaka strana je `.../index.html`);
nije potreban poseban `.htaccess`.

## Telpo uređaji

- `src/data/telpo.ts` — 5 modela (C9, C11, TPS900, P9, K20) sa specifikacijama; prikazuju se na
  strani eFiskalizacija (`showTelpo: true` u `services.ts`).

## Stranice

- `/` i `/en/` — početna (dugačak scroll: hero sa particle animacijom, slider akcija/usluga,
  klijenti, usluge, o nama, projekti, ISO, kontakt)
- `/resenja` (+ `/en/solutions`, `/ru/solutions`) — **Rešenja po nameni** (use-case strane za pronalaznost): `/resenja/<slug>` za ugostiteljstvo, skijalista, parking, bazeni (`src/data/solutions.ts`)
- `/usluge/<slug>` (+ `/en`, `/ru`) — posebna strana po usluzi/proizvodu; `fiskalizacija` je „Fiskalizacija" hub i ističe **Telpo P9** kao glavni uređaj
- `/hardver` (+ `/en/hardware`, `/ru/hardware`) — zaseban katalog hardvera (POS, fiskalni, kontrola pristupa, štampači, kiosk štampači, money akceptori, brojačice novca, all-in-one) + Telpo uređaji
- `/projekti` (+ `/en/projects`, `/ru/projects`) — svi projekti bez zasebne strane (početna prikazuje 6 + dugme „Svi projekti")
- `/akcija-fiskalizacija` (+ `/en`, `/ru`) — landing za akciju 1200 din
- `/o-nama` (+ `/en/about`, `/ru/about`)

## TODO pre objave

- Potvrditi tačan tekst i uslove akcije 1200 din (`src/data/promo.ts`).
- Na produkciji napraviti `public/contact.config.php` sa SMTP podacima (vidi „Kontakt forma").
- Proveriti logoe distributera/klijenata i linkove.

## Dev na mreži

`npm run dev` i `npm run preview` slušaju na `0.0.0.0` — sajt je dostupan i sa drugih
uređaja u mreži (Astro ispisuje Network URL pri pokretanju).
