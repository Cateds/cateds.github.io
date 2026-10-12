/** Rough reading time: CJK characters at ~400/min, other words at ~200/min. */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const cjk = body.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = body
    .replace(/[\u3400-\u9fff]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(cjk / 400 + words / 200));
}
