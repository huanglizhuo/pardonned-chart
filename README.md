# US Presidential Pardons — Data Visualization

Interactive charts and tables exploring US presidential clemency grants (pardons and commutations) from Clinton through Trump's second term.

**Live site:** https://pardonned.clothpath.com/

## Features

- **Grants by Year** — yearly clemency totals with per-administration color coding
- **Grants by State** — choropleth map based on federal district of offense; click any state to filter the table
- **End-of-Term Surge** — days-before-term-end distribution showing last-minute grant patterns
- **Category by Administration** — donut small multiples, one per president, showing offense category breakdown
- **Clemency Pipeline** — Sankey diagram: Administration → Offense Category → Clemency Type
- **Pardon vs Commutation** — stacked bar chart comparing clemency type mix across administrations
- **Financial Impact** — restitution and fine totals by category
- **Financial Bubbles** — individual grant scatter plot by financial magnitude
- **Top Districts** — federal districts with the most grants
- **All Grants Table** — searchable, filterable table with pagination; responds to map/chart clicks

## Data

Data sourced from [pardonned.com](https://pardonned.com) / US Department of Justice Office of the Pardon Attorney. Stored in Cloudflare KV and served from the edge.

## Tech Stack

- [Astro](https://astro.build) (static output + Cloudflare adapter)
- [React](https://react.dev) islands
- [Recharts](https://recharts.org) for charts
- [react-simple-maps](https://www.react-simple-maps.io) for the choropleth
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudflare Pages](https://pages.cloudflare.com) + [Cloudflare KV](https://developers.cloudflare.com/kv/)

## Development

```bash
nvm use stable
npm install
npm run dev          # Astro dev server
# or for Cloudflare Workers parity:
npx wrangler pages dev dist --kv PARDONS_KV
```

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=pardonned-chart
```
