import PocketBase from "pocketbase";
import { env } from "$env/dynamic/private";
import { isServicesAdmin } from "$lib/roles";

export function createPocketBase() {
  return new PocketBase(env.POCKETBASE_URL || "http://127.0.0.1:8090");
}

export function extractTokenFromCookie(cookieHeader: string | null): string {
  const raw = cookieHeader?.match(/pb_auth=([^;]+)/)?.[1];
  if (!raw) return "";
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("{")) {
      const parsed = JSON.parse(decoded);
      if (typeof parsed?.token === "string") return parsed.token;
    }
    return decoded;
  } catch {
    return raw;
  }
}

export function pbFromRequest(request: Request) {
  const pb = createPocketBase();
  const token = extractTokenFromCookie(request.headers.get("cookie"));
  if (token) pb.authStore.save(token, null);
  return pb;
}

export function isAdmin(record: any) {
  return isServicesAdmin(record);
}

export async function adminActorId(pb: PocketBase): Promise<string | null> {
  if (!pb.authStore.isValid) return null;
  try {
    const auth = await pb
      .collection("users")
      .authRefresh({ expand: "user_type" });
    return isAdmin(auth.record) ? auth.record.id : null;
  } catch {
    return null;
  }
}
