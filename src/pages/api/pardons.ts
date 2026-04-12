export const prerender = false;

import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const kv = context.locals.runtime?.env?.PARDONS_KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await kv.get('pardons');

  if (!data) {
    return new Response(JSON.stringify({ error: 'Data not seeded yet' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
