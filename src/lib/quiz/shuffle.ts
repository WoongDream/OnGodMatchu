/**
 * 결정성 있는 Fisher-Yates 셔플. seed 가 같으면 같은 순서.
 * seed 미지정 시 `Math.random()` 사용 — 비결정성.
 */
export const shuffle = <T>(arr: readonly T[], seed?: number): T[] => {
  const out = arr.slice();
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// 결정성 PRNG (재현 가능). https://en.wikipedia.org/wiki/Linear_congruential_generator 변형
const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
