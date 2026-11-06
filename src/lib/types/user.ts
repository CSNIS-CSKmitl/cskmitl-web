export interface PortalUser {
	id: string;
	email: string;
	name?: string;
	username?: string;
	role?: string;
	roles?: string[];
	isAdmin?: boolean;
}
