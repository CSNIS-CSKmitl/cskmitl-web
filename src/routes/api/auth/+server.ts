import { json } from '@sveltejs/kit';
import { createPocketBase, isAdmin } from '$lib/server/pocketbase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  const pb = createPocketBase();
  try {
    const auth = await pb.collection('users').authWithPassword(email, password, { expand: 'user_type' });
    let userRecord = auth.record;
    try {
      userRecord = await pb.collection('users').getOne(auth.record.id, { expand: 'user_type' });
    } catch {
      // fallback
    }

    if (!isAdmin(userRecord)) {
      pb.authStore.clear();
      return json({ ok: false, error: 'บัญชีนี้ไม่มีสิทธิ์ admin' }, { status: 403 });
    }

    cookies.set('pb_auth', pb.authStore.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24
    });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }
};

export const GET: RequestHandler = async ({ request }) => {
  const pb = createPocketBase();
  const token = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  if (!token) return json({ authenticated: false }, { status: 401 });
  pb.authStore.save(token, null);
  try {
    const auth = await pb.collection('users').authRefresh({ expand: 'user_type' });
    let userRecord = auth.record;
    try {
      userRecord = await pb.collection('users').getOne(auth.record.id, { expand: 'user_type' });
    } catch {
      // fallback
    }

    if (!isAdmin(userRecord)) return json({ authenticated: false }, { status: 403 });
    return json({ authenticated: true });
  } catch {
    return json({ authenticated: false }, { status: 401 });
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete('pb_auth', { path: '/' });
  return json({ ok: true });
};
