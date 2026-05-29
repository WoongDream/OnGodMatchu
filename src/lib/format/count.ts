/**
 * 단축 카운트 표기. 1000 미만은 그대로, 1000 이상은 `1.2k` / `12.8k` / `1.5m`.
 * 음수는 `0` 으로 클램프, 비정수는 floor.
 */
export const formatCount = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) {
    return '0';
  }
  const v = Math.floor(n);
  if (v < 1000) {
    return String(v);
  }
  if (v < 1_000_000) {
    const k = v / 1000;
    return k >= 100 ? `${Math.floor(k)}k` : `${trimZero(k.toFixed(1))}k`;
  }
  const m = v / 1_000_000;
  return m >= 100 ? `${Math.floor(m)}m` : `${trimZero(m.toFixed(1))}m`;
};

const trimZero = (s: string): string => (s.endsWith('.0') ? s.slice(0, -2) : s);
