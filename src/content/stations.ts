import { BRAND } from './brand';

// The product's numbers, kept consistent across stations (and with BRAND.warning):
// 250 ml, 80 mg caffeine (32 mg/100 ml), 12 % strawberry juice, 45 kcal and 9 g sugar per can.

type StationId = 'cold-can' | 'opening' | 'bubbles' | 'strawberry' | 'end';

/** What the second column of a station shows. */
export type StationDetails =
  | {
      kind: 'stats';
      /** Big value, short label, and a note shown only where there is room. */
      items: readonly { value: string; label: string; note: string }[];
    }
  | { kind: 'steps'; items: readonly { title: string; text: string }[] }
  | {
      kind: 'flavour';
      notesTitle: string;
      notes: readonly string[];
      ingredientsTitle: string;
      ingredients: string;
    }
  | {
      kind: 'nutrition';
      caption: string;
      columns: readonly [string, string];
      rows: readonly { name: string; values: readonly [string, string] }[];
    };

type Station = {
  id: StationId;
  /** Short name in the header navigation. */
  label: string;
  /** Small line above the title: what the station is about. */
  eyebrow: string;
  title: string;
  /** Two or three sentences under the title. */
  lead: string;
  /**
   * How the two columns sit around the shot: `middle` both halfway up, beside
   * the subject; `split` text at the top, details at the bottom; `top` both at
   * the top, above the subject.
   */
  layout: 'middle' | 'split' | 'top';
  /** Text colors: cold outside the can, warm inside the drink. */
  mood: 'cold' | 'warm';
  details: StationDetails;
  /** A hint for what the visitor can do in this shot, worded per input. */
  hint?: { pointer: string; touch: string };
  /** Button that flies back to the first station. */
  restart?: string;
};

// The order is the order of the scroll, and the camera curve has one station pose per item.
export const STATIONS: readonly Station[] = [
  {
    id: 'cold-can',
    label: 'Can',
    eyebrow: `${BRAND.flavor} drink · ${BRAND.volume}`,
    title: BRAND.name,
    lead: 'Real strawberry, natural caffeine and a sharp, fine fizz. Kept cold until the moment you open it.',
    layout: 'middle',
    mood: 'cold',
    details: {
      kind: 'stats',
      items: [
        {
          value: '80 mg',
          label: 'Natural caffeine',
          note: 'From green coffee beans.',
        },
        {
          value: '12 %',
          label: 'Strawberry juice',
          note: 'Pressed fruit, not flavouring alone.',
        },
        {
          value: '45 kcal',
          label: 'Per can',
          note: 'Lightly sweetened with cane sugar.',
        },
      ],
    },
    hint: {
      pointer: 'Drag across the can to wipe off the frost',
      touch: 'Rub the can with a finger to wipe off the frost',
    },
  },
  {
    id: 'opening',
    label: 'Open',
    eyebrow: 'Serve',
    title: 'Best opened ice cold',
    lead: 'Cold liquid holds its fizz longer, so the first sip is the sharpest. Pull the tab and listen for the hiss.',
    layout: 'middle',
    mood: 'cold',
    details: {
      kind: 'steps',
      items: [
        {
          title: 'Chill to 2–4 °C',
          text: 'A few hours in the fridge, not the freezer.',
        },
        { title: 'Drink from the can', text: 'It keeps the bubbles in.' },
        {
          title: 'Finish within 15 minutes',
          text: 'After that the fizz starts to fade.',
        },
      ],
    },
  },
  {
    id: 'bubbles',
    label: 'Fizz',
    eyebrow: 'Energy',
    title: 'The lift, without the crash',
    lead: 'Caffeine from green coffee beans comes on gently and stays steady. Fine bubbles carry it, crisp from the first sip to the last.',
    layout: 'middle',
    mood: 'warm',
    details: {
      kind: 'stats',
      items: [
        {
          value: '80 mg',
          label: 'Caffeine',
          note: 'About as much as a cup of coffee.',
        },
        {
          value: 'B3 · B6 · B12',
          label: 'Vitamins',
          note: "Part of the body's own energy cycle.",
        },
        {
          value: 'Fine',
          label: 'Carbonation',
          note: 'Small bubbles for a clean, crisp bite.',
        },
      ],
    },
  },
  {
    id: 'strawberry',
    label: 'Taste',
    eyebrow: 'Flavour',
    title: 'Made from real strawberries',
    lead: 'Pressed strawberries and a squeeze of lime, nothing pretending to be fruit. The red comes from the fruit itself and black carrot.',
    layout: 'split',
    mood: 'warm',
    details: {
      kind: 'flavour',
      notesTitle: 'Tasting notes',
      notes: ['Ripe strawberry', 'Lime zest', 'Clean, dry finish'],
      ingredientsTitle: 'Ingredients',
      ingredients:
        'Carbonated water, strawberry juice from concentrate (12 %), cane sugar, citric acid, natural caffeine, lime juice, black carrot concentrate, natural flavouring, vitamins (B3, B6, B12).',
    },
  },
  {
    id: 'end',
    label: 'End',
    eyebrow: 'Ready when you are',
    title: 'Open another',
    lead: 'Every can starts cold. Go back to the top and dive in again.',
    layout: 'top',
    mood: 'warm',
    details: {
      kind: 'nutrition',
      caption: 'Nutrition',
      columns: ['Per 100 ml', `Per can (${BRAND.volume})`],
      rows: [
        { name: 'Energy', values: ['75 kJ / 18 kcal', '188 kJ / 45 kcal'] },
        { name: 'Carbohydrate', values: ['3.7 g', '9.3 g'] },
        { name: 'of which sugars', values: ['3.6 g', '9.0 g'] },
        { name: 'Caffeine', values: ['32 mg', '80 mg'] },
      ],
    },
    restart: 'Back to the top',
  },
];
