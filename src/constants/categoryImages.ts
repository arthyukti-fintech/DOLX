import type { ImageSourcePropType } from 'react-native';
import type { JobRole } from '../types';

/**
 * Photography for the staff categories, taken from the design file itself so
 * the app shows the images the client already signed off on.
 *
 * These are bundled rather than fetched: the API has no image field yet, and a
 * demo that depends on the network to look finished is a demo that breaks on
 * bad wifi. When uploads land, this map becomes the fallback for anything the
 * API doesn't supply.
 *
 * Metro needs literal require() paths, so this cannot be built from a loop.
 *
 * Security has no entry on purpose - the only security photograph in the
 * design file is a watermarked stock comp, so it falls back to its icon until
 * a licensed image exists.
 */
const CATEGORY_IMAGES: Partial<Record<JobRole, ImageSourcePropType>> = {
  'Event Helper': require('../assets/images/categories/event-helper.jpg'),
  'Setup Crew': require('../assets/images/categories/setup-crew.jpg'),
  Decoration: require('../assets/images/categories/decoration.jpg'),
  'Catering Staff': require('../assets/images/categories/catering-staff.jpg'),
  'Cleaning Staff': require('../assets/images/categories/cleaning-staff.jpg'),
  Promoter: require('../assets/images/categories/promoter.jpg'),
  Hostess: require('../assets/images/categories/hostess.jpg'),
};

/**
 * The photo for a role, or undefined when there isn't one.
 *
 * Takes a plain string because callers pass values straight from the API,
 * which may be a role, an event category, or something not yet in the enum.
 */
export function categoryImage(role?: string): ImageSourcePropType | undefined {
  if (!role) return undefined;
  return CATEGORY_IMAGES[role as JobRole];
}

export default CATEGORY_IMAGES;
