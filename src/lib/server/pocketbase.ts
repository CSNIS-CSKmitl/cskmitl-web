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
  if (!record) return false;
  const typeName = record?.expand?.user_type?.type?.toLowerCase();
  const typeId = record?.user_type;
  const role = record?.role?.toLowerCase();

  return (
    typeName === 'admin' ||
    typeName === 'superadmin' ||
    typeId === '000000000000000' ||
    typeId === '000000000000009' ||
    role === 'admin' ||
    role === 'superadmin'
  );
}
