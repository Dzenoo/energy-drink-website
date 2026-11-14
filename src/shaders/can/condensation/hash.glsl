// Offset that makes every cell coordinate positive: turning a negative int into
// a uint is not guaranteed to keep its bits in WebGL 2.
const int HASH_CELL_OFFSET = 65536;

// MurmurHash3 finalizer by Austin Appleby, public domain (see
// public/licenses/THIRD_PARTY_NOTICES.txt): mixes the bits of one integer.
uint hashMix(uint h) {
  h ^= h >> 16u;
  h *= 0x85ebca6bu;
  h ^= h >> 13u;
  h *= 0xc2b2ae35u;
  h ^= h >> 16u;
  return h;
}

// Four stable random numbers in [0, 1] for a cell; the seed separates layers.
vec4 hashCell(ivec2 cell, uint seed) {
  uvec2 key = uvec2(cell + HASH_CELL_OFFSET);
  uint h = hashMix(key.x ^ hashMix(key.y ^ hashMix(seed)));
  uint h1 = hashMix(h + 0x9e3779b9u);
  uint h2 = hashMix(h1 + 0x9e3779b9u);
  uint h3 = hashMix(h2 + 0x9e3779b9u);
  return vec4(uvec4(h, h1, h2, h3)) / 4294967295.0;
}
