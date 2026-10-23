import { error, redirect } from '@sveltejs/kit';
import { createPocketBase } from '$lib/server/pocketbase';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ cookies, url }) => {
  const pb = createPocketBase();
  let provider;
  try { provider = (await pb.collection('users').listAuthMethods()).oauth2?.providers.find((item) => item.name === 'oidc'); } catch { error(503, 'เชื่อมต่อระบบเข้าสู่ระบบไม่ได้'); }
  if (!provider) error(503, 'ยังไม่ได้ตั้งค่า OIDC ใน PocketBase');
  const redirectUrl = `${url.origin}/auth/callback`;
  cookies.set('oidc_flow', JSON.stringify({ provider: provider.name, state: provider.state, verifier: provider.codeVerifier, redirectUrl }), { path: '/auth', httpOnly: true, secure: url.protocol === 'https:', sameSite: 'lax', maxAge: 600 });
  redirect(303, provider.authURL + encodeURIComponent(redirectUrl));
};
