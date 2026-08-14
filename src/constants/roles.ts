import type { JobRole } from '../types';

/**
 * The staff roles, mirroring `utils/constants.js` on the backend.
 *
 * This list used to be copy-pasted into four screens and the icon map, which
 * is how it drifted - a rename had to be made in five places or the pickers
 * quietly disagreed with what the API would accept. Import from here instead.
 */

/**
 * Shown in the "Our Core Staff" grid, in the order the design lays them out.
 * These are the customer-facing categories.
 */
export const CATALOG_ROLES: JobRole[] = [
  'Event Helper',
  'Setup Crew',
  'Decoration',
  'Catering Staff',
  'Cleaning Staff',
  'Promoter',
  'Hostess',
  'Security',
];

/**
 * Still bookable, deliberately absent from the category grid. Existing jobs
 * and specialist hiring keep working; they simply aren't advertised.
 */
export const UNLISTED_ROLES: JobRole[] = [
  'Photographer',
  'Videographer',
  'Registration Staff',
  'Host / Anchor',
  'Crowd Management',
];

/** Every value a job's role may take - what the role pickers offer. */
export const JOB_ROLES: JobRole[] = [...CATALOG_ROLES, ...UNLISTED_ROLES];
