import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

let pbInstance: PocketBase | null = null;

export function getPb(): PocketBase {
	if (!pbInstance) {
		const url = env.PUBLIC_POCKETBASE_URL || window.location.origin;
		pbInstance = new PocketBase(url);
		pbInstance.autoCancellation(false);
	}
	return pbInstance;
}
