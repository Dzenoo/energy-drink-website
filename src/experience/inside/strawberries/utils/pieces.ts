/**
 * Piece types (node names in the model), how many of each drift in the drink
 * besides the ones placed by hand, and where the whole fruit's axis passes
 * through the piece (x, z in model units, measured on the model): the seeds and
 * the core are laid out around it.
 */
export const PIECES = [
  { node: 'StrawberryHalf', count: 3, axis: [-0.42, 0] },
  { node: 'StrawberryQuarter', count: 4, axis: [-0.42, 0.42] },
  { node: 'StrawberrySlice', count: 5, axis: [-0.5, 0] },
] as const;

export type PieceNode = (typeof PIECES)[number]['node'];
