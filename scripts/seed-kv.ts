/**
 * Seed Cloudflare KV with pardon data from the gist.
 * Run: npx tsx scripts/seed-kv.ts
 * Requires wrangler to be logged in: wrangler login
 */

const GIST_URL =
  'https://gist.githubusercontent.com/varenc/cb2e2dacf1c92d36bcee2fab04a44631/raw/de6ff6c33cc7dfdb8ad4bbfeedac60878c337c1d/pardonned.com_2026-04-11_paradons.json';

const KV_NAMESPACE_ID = process.env.KV_NAMESPACE_ID;

async function main() {
  console.log('Fetching pardon data from gist…');
  const res = await fetch(GIST_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const json = await res.text();
  const parsed = JSON.parse(json);
  console.log(`Fetched ${Array.isArray(parsed) ? parsed.length : '?'} records`);

  if (!KV_NAMESPACE_ID) {
    // Write to a local file for use with wrangler kv key put
    const { writeFileSync } = await import('fs');
    writeFileSync('./pardons-data.json', json, 'utf8');
    console.log('\nSaved to ./pardons-data.json');
    console.log('\nNow run:');
    console.log('  wrangler kv key put --namespace-id=<YOUR_NAMESPACE_ID> "pardons" --path=./pardons-data.json');
  } else {
    // Use wrangler CLI directly
    const { execSync } = await import('child_process');
    const { writeFileSync } = await import('fs');
    writeFileSync('./pardons-data.json', json, 'utf8');
    console.log(`Uploading to KV namespace ${KV_NAMESPACE_ID}…`);
    execSync(
      `wrangler kv key put --namespace-id=${KV_NAMESPACE_ID} "pardons" --path=./pardons-data.json`,
      { stdio: 'inherit' },
    );
    console.log('Done!');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
