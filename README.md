# Pagini de istorie

Aplicație web pentru istoria clasei a X-a, profil umanist, specializarea științe sociale (programa OMEC 4598/2004).

- Lecții la nivel de manual, cu note marginale, surse istorice, hărți, scheme, cronologie și glosar
- Exerciții: alegere multiplă, ordonare cronologică, asociere, analiză de sursă tip bacalaureat, hartă mută
- Teste de recapitulare pe module, fișe de termeni, căutare în toată materia
- Mod elev și mod profesor (proiecție la clasă, navigare cu telecomanda, cronometru)
- Fără conturi: progresul se salvează în browser, cu export și import din fișier
- Funcționează offline (PWA)

## Rulare

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producție
```

Deploy: importă repo-ul în Vercel; nu sunt necesare variabile de mediu. Statisticile anonime folosesc Vercel Analytics (se activează din panoul proiectului).

## Structură

- `content/p2004/` — câte un fișier pentru fiecare unitate de învățare (text, surse, glosar, schemă, cronologie, exerciții)
- `content/maps/` — hărți pre-proiectate în SVG (generate de `scripts/build-maps.mjs`)
- `lib/` — tipuri, parserul textului, starea locală (progres, mod)
- `components/` — lecție, hărți, exerciții, proiecție, unelte

### Formatul textului unei lecții

```
## Titlul secțiunii
Paragraf. Se pot folosi *italice* și **aldine**.
> nota: notă marginală, atașată paragrafului de deasupra
> citat
```

### Regenerarea hărților

Hărțile provin din [historical-basemaps](https://github.com/aourednik/historical-basemaps) (A. Ourednik, GPL-3.0).
Descarcă fișierele `world_YYYY.geojson` într-un folder `../geodata`, apoi rulează `npm run maps`.

## Licență

GPL-3.0-or-later (compatibilă cu licența datelor cartografice).
