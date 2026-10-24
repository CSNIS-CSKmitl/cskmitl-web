import { json } from '@sveltejs/kit';
import { pbFromRequest, adminActorId } from '$lib/server/pocketbase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const pb = pbFromRequest(request);
    const expand = await adminActorId(pb) ? 'created_by,updated_by' : undefined;
    const records = await pb.collection('services').getFullList({ sort: '-created', ...(expand ? { expand } : {}) });
    return json(records);
  } catch {
    return json({ error: 'PocketBase unavailable' }, { status: 503 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request);
  if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const actorId = await adminActorId(pb);
    if (!actorId) return json({ error: 'Admin role required' }, { status: 403 });
    const data = await request.json();
    return json(await pb.collection('services').create({ ...data, created_by: actorId, updated_by: actorId }));
  } catch {
    return json({ error: 'Create failed' }, { status: 400 });
  }
};

export const PATCH: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request);
  if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const actorId = await adminActorId(pb);
    if (!actorId) return json({ error: 'Admin role required' }, { status: 403 });

    const { id, ...data } = await request.json();
    return json(await pb.collection('services').update(id, { ...data, updated_by: actorId }));
  } catch {
    return json({ error: 'Update failed' }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  const pb = pbFromRequest(request);
  if (!pb.authStore.isValid) return json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const actorId = await adminActorId(pb);
    if (!actorId) return json({ error: 'Admin role required' }, { status: 403 });

    const { id } = await request.json();
    await pb.collection('services').delete(id);
    return json({ ok: true });
  } catch {
    return json({ error: 'Delete failed' }, { status: 400 });
  }
};
