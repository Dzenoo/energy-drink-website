/**
 * Piece types (node names in the model) and where the whole fruit's axis passes
 * through the piece (x, z in model units, measured on the model): the seeds and
 * the core are laid out around it.
 */
export const PIECES = [
  { node: 'StrawberryHalf', axis: [-0.42, 0] },
  { node: 'StrawberryQuarter', axis: [-0.42, 0.42] },
  { node: 'StrawberrySlice', axis: [-0.5, 0] },
] as const;

export type PieceNode = (typeof PIECES)[number]['node'];
