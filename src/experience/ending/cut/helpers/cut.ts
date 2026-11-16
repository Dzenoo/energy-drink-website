import { MathUtils } from 'three';

import { STATIONS } from '@/content/stations';

// The cut to the end: on the way from the strawberry station to the end, the
// picture fades to black, the scene is swapped while nothing shows, and the end
// comes up out of the dark. All values are shares of the way between the two
// stations (0 at the strawberry station, 1 at the end).
const ENDING = {
  /** Where the picture starts to darken, while the camera still sinks through the drink. */
  fadeStart: 0.1,
  /** From here the picture is black: the camera leaves the can through its wall after this (camera/helpers/curve.ts). */
  blackFrom: 0.3,
  /** Up to here the picture stays black. */
  blackTo: 0.7,
  /** Where the end has fully come up, just before the camera settles. */
  fadeEnd: 0.95,
  /** Where the scenes are swapped: in the middle of the black. */
  swapAt: 0.5,
};

const FROM = STATIONS.findIndex(({ id }) => id === 'strawberry');
const TO = STATIONS.findIndex(({ id }) => id === 'end');

/** Share of the way from the strawberry station to the end, at a scroll progress. */
const wayToEnd = (progress: number) => (progress - FROM) / (TO - FROM);

/**
 * How dark the picture is at a scroll progress: 0 not at all, 1 black. It follows
 * the same progress as the camera, so however fast the scroll, the camera is
 * never seen leaving the can.
 */
export const blackout = (progress: number) => {
  const way = wayToEnd(progress);
  return (
    MathUtils.smoothstep(way, ENDING.fadeStart, ENDING.blackFrom) *
    (1 - MathUtils.smoothstep(way, ENDING.blackTo, ENDING.fadeEnd))
  );
};

/** Whether the end scene shows instead of the can with the drink, at a scroll progress. */
export const showsEnding = (progress: number) =>
  wayToEnd(progress) >= ENDING.swapAt;
