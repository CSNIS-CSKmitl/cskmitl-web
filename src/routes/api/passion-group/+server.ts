import { json } from '@sveltejs/kit';
import { createPocketBase, isAdmin, pbFromRequest } from '$lib/server/pocketbase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    return json(await createPocketBase().collection('passion_group').getFullList({ sort: '-created' }));
  } catch {
    return json({ error: 'Passion Group unavailable' }, { status: 503 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request);
  if (!pb.authStore.isValid) return json({ error: 'Admin role required' }, { status: 403 });
  try {
    const auth = await pb.collection('users').authRefresh({ expand: 'user_type' });
    if (!isAdmin(auth.record)) return json({ error: 'Admin role required' }, { status: 403 });

    return json(await pb.collection('passion_group').create(await request.json()));
  } catch {
    return json({ error: 'Create failed' }, { status: 400 });
  }
};

export const PATCH: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request);
  if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const auth = await pb.collection('users').authRefresh({ expand: 'user_type' });
    if (!isAdmin(auth.record)) return json({ error: 'Admin role required' }, { status: 403 });

    const { id, ...data } = await request.json();
    return json(await pb.collection('passion_group').update(id, data));
  } catch {
    return json({ error: 'Update failed' }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request);
  if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const auth = await pb.collection('users').authRefresh({ expand: 'user_type' });
    if (!isAdmin(auth.record)) return json({ error: 'Admin role required' }, { status: 403 });

    const { id } = await request.json();
    await pb.collection('passion_group').delete(id);
    return json({ ok: true });
  } catch {
    return json({ error: 'Delete failed' }, { status: 400 });
  }
};
