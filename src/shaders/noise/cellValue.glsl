// Offset that makes every cell coordinate positive: turning a negative int into
// a uint is not guaranteed to keep its bits in WebGL 2.
const int CELL_OFFSET = 65536;

// One stable random number in [0, 1] per cell of a grid. A light integer mix,
// for noise that reads several cells for every pixel.
float cellValue(ivec2 cell) {
  uvec2 key = uvec2(cell + CELL_OFFSET);
  uint h = key.x * 0x9e3779b1u ^ key.y * 0x85ebca77u;
  h ^= h >> 15u;
  h *= 0x2c1b3c6du;
  h ^= h >> 12u;
  return float(h) / 4294967295.0;
}
