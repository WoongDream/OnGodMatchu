/**
 * 값 배열을 SVG `<polyline points="x,y x,y ...">` 의 points 문자열로 변환.
 *
 * - 빈 배열 → 빈 문자열.
 * - 단일 값 → 한 점 (좌→우 가로 중앙).
 * - 평탄(min===max) → 모두 height 중앙선.
 * - 정상 분포 → x 는 인덱스 균등 분포, y 는 min/max 정규화 (큰 값이 위쪽 = 작은 y).
 *
 * polyline 의 좌표계는 SVG 기본 (좌상단 0,0). 사용처에서 같은 width/height 의
 * `<svg viewBox="0 0 width height">` 에 그대로 매핑.
 */
export const toPolylinePoints = (
  values: ReadonlyArray<number>,
  width: number,
  height: number,
): string => {
  if (!values.length || width <= 0 || height <= 0) {
    return '';
  }
  if (values.length === 1) {
    return `${(width / 2).toFixed(2)},${(height / 2).toFixed(2)}`;
  }

  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) {
      min = v;
    }
    if (v > max) {
      max = v;
    }
  }
  const range = max - min;

  const stepX = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = range === 0 ? height / 2 : height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
};
