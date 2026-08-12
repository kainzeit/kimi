export function getFirstRichTextImageSrc(content: string): string | null {
  if (!content) return null;

  const quotedSource = content.match(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/i);
  if (quotedSource?.[2]) return quotedSource[2].trim() || null;

  const unquotedSource = content.match(/<img\b[^>]*\bsrc\s*=\s*([^\s>]+)[^>]*>/i);
  return unquotedSource?.[1]?.trim() || null;
}
