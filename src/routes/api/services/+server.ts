import { json } from '@sveltejs/kit';
import { pbFromRequest, isAdmin } from '$lib/server/pocketbase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  try { const records = await pbFromRequest(request).collection('services').getFullList({ sort: '-created' }); return json(records); }
  catch { return json({ error: 'PocketBase unavailable' }, { status: 503 }); }
};

export const POST: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request); if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  const auth = await pb.collection('users').authRefresh({ expand: 'user_type' });
  if (!isAdmin(auth.record)) return json({ error: 'Admin role required' }, { status: 403 });
  try { return json(await pb.collection('services').create(await request.json())); }
  catch { return json({ error: 'Create failed' }, { status: 400 }); }
};

export const DELETE: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request); if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  const auth = await pb.collection('users').authRefresh({ expand: 'user_type' });
  if (!isAdmin(auth.record)) return json({ error: 'Admin role required' }, { status: 403 });
  const { id } = await request.json();
  try { await pb.collection('services').delete(id); return json({ ok: true }); }
  catch { return json({ error: 'Delete failed' }, { status: 400 }); }
};
