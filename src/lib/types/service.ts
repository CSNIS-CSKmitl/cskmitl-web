export type ServiceType = 'Web app' | 'Backend' | 'Mobile' | 'Infrastructure';

export type ServiceStatus = 'พร้อมใช้งาน' | 'กำลังพัฒนา' | 'ปิดปรับปรุง';

export interface PortalService {
	id: string;
	name: string;
	description?: string;
	url?: string;
	icon?: string;
	type?: ServiceType;
	category?: string;
	status?: ServiceStatus;
	created_by?: string;
	updated_by?: string;
	created?: string;
	updated?: string;
}
