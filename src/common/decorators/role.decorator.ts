import { SetMetadata } from '@nestjs/common';

export const PUBLIC = 'Public';
export const TOUR_GUIDE = 'TourGuide';

export const Public = () => SetMetadata(PUBLIC, true);
export const TourGuide = () => SetMetadata(TOUR_GUIDE, true);
