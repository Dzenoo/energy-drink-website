/**
 * Touch state shared by the can (3D) and the scroll input (HTML): a touch that
 * starts on the can wipes the mist instead of moving to another station. The can
 * sets it on touch down; the scroll input reads and clears it when the touch ends.
 */
export const WIPE_INPUT = { touchOnCan: false };
