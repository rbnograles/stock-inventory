/**
 * Normalizes emoji text entered through mobile keyboards, desktop emoji panels,
 * or paste. Emoji glyphs can span multiple code points, so this helper keeps
 * the first visible grapheme instead of slicing raw UTF-16 characters.
 */
interface SegmenterLike {
  segment: (input: string) => Iterable<{ segment: string }>;
}

interface SegmenterConstructorLike {
  new (locale?: string, options?: { granularity: "grapheme" }): SegmenterLike;
}

const getSegmenter = () =>
  (Intl as unknown as { Segmenter?: SegmenterConstructorLike }).Segmenter;

export const normalizeEmojiInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const Segmenter = getSegmenter();

  if (Segmenter) {
    const [first] = Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(trimmed));
    return first?.segment ?? "";
  }

  return Array.from(trimmed)[0] ?? "";
};
