import { error, redirect } from '@sveltejs/kit';
import { createPocketBase, isAdmin } from '$lib/server/pocketbase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const raw = cookies.get('oidc_flow');
  cookies.delete('oidc_flow', { path: '/auth' });

  let flow: { provider: string; state: string; verifier: string; redirectUrl: string };
  try {
    flow = JSON.parse(raw || '');
  } catch {
    error(400, 'กรุณาเริ่มเข้าสู่ระบบใหม่');
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state || state !== flow.state || flow.redirectUrl !== `${url.origin}/auth/callback`) {
    error(400, 'ข้อมูล OIDC ไม่ถูกต้อง');
  }

  const pb = createPocketBase();
  try {
    const auth = await pb.collection('users').authWithOAuth2Code(flow.provider, code, flow.verifier, flow.redirectUrl);
    const user = await pb.collection('users').getOne(auth.record.id, { expand: 'user_type' });

    if (!isAdmin(user)) {
      pb.authStore.clear();
      error(403, 'บัญชีนี้ไม่มีสิทธิ์ admin');
    }

    cookies.set('pb_auth', pb.authStore.token, {
      path: '/',
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });
  } catch (e) {
    if ((e as { status?: number }).status === 403) throw e;
    error(401, 'เข้าสู่ระบบผ่าน OIDC ไม่สำเร็จ');
  }

  redirect(303, '/admin');
};
