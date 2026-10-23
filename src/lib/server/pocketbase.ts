import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

export function createPocketBase() {
  return new PocketBase(env.POCKETBASE_URL || 'http://127.0.0.1:8090');
}

export function pbFromRequest(request: Request) {
  const pb = createPocketBase();
  const token = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  if (token) pb.authStore.save(token, null);
  return pb;
}

export function isAdmin(record: any) {
  return ['admin', 'superadmin'].includes(record?.expand?.user_type?.type);
}
