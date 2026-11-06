import PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { env } from "$env/dynamic/private";
import type { RequestEvent } from "@sveltejs/kit";
import { AUTH_COOKIE } from "../constants";

interface StoredAuth {
  token: string;
  record: RecordModel;
}

export function createPb(event: RequestEvent): PocketBase {
  const PB_URL = env.POCKETBASE_URL || "http://127.0.0.1:8090";
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  const raw = event.cookies.get(AUTH_COOKIE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredAuth;
      if (parsed?.token) {
        pb.authStore.save(parsed.token, parsed.record);
      }
    } catch {
      // Fallback: check if raw token string
      pb.authStore.save(raw, null);
    }
  }

  pb.authStore.onChange((token, record) => {
    if (!token) {
      event.cookies.delete(AUTH_COOKIE, { path: "/" });
      return;
    }
    event.cookies.set(AUTH_COOKIE, JSON.stringify({ token, record }), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: !import.meta.env.DEV,
      maxAge: 60 * 60 * 24 * 7,
    });
  }, true);

  return pb;
}
