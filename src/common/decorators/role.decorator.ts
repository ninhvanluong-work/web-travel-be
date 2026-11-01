import { SetMetadata } from '@nestjs/common';

export const PUBLIC = 'Public';
export const TOUR_GUIDE = 'TourGuide';
export const ADMIN = 'Admin';
export const SUPER_ADMIN = 'SuperAdmin';
export const OPTIONAL_AUTH = 'OptionalAuth';

export const Public = () => SetMetadata(PUBLIC, true);
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH, true);
export const TourGuide = () => SetMetadata(TOUR_GUIDE, true);
export const Admin = () => SetMetadata(ADMIN, true);
export const SuperAdmin = () => SetMetadata(SUPER_ADMIN, true);
