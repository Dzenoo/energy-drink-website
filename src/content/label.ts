import { BRAND } from './brand';

// Text printed on the front of the can's label, as bare aluminium letters.
export const LABEL_TEXT = {
  title: BRAND.name,
  subtitle: `${BRAND.flavor} · ${BRAND.volume}`.toUpperCase(),
};
