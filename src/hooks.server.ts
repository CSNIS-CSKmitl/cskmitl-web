import type { Handle } from '@sveltejs/kit';
import { createPb } from '$lib/pb/server';
import { getUserRoles, isServicesAdmin } from '$lib/roles';

function resolveEmail(record: any): string {
	if (record.email) return record.email;
	if (record.username) return `${record.username}@cskmitl.internal`;
	return 'unknown@cskmitl.internal';
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = createPb(event);

	const pb = event.locals.pb;
	if (pb.authStore.isValid) {
		try {
			await pb.collection('users').authRefresh();
			const userId = pb.authStore.record?.id;
			if (!userId) throw new Error('no user id in auth store');
			const full = (await pb.collection('users').getOne(userId, {
				expand: 'user_type'
			})) as unknown as any;
			const isAdm = isServicesAdmin(full);
			event.locals.user = {
				id: full.id,
				email: resolveEmail(full),
				name: full.name ?? full.username,
				username: full.username,
				role: isAdm ? 'admin' : 'user',
				roles: getUserRoles(full),
				isAdmin: isAdm
			};
		} catch {
			pb.authStore.clear();
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);
	return response;
};
