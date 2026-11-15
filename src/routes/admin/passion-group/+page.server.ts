import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, "/admin");
  }
  if (!locals.user.isAdmin) {
    throw error(403, "บัญชีนี้ไม่มีสิทธิ์ admin");
  }
  return {};
};
