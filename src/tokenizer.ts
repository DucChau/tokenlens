/**
 * tokenizer.ts — GPT-compatible BPE tokenizer approximation (cl100k_base-style)
 */

/**
 * Approximate cl100k_base token count for a given text.
 * Uses word splitting, punctuation handling, and known BPE heuristics.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // cl100k_base heuristics:
  // ~1 token per 4 characters for English text
  // Whitespace and punctuation are often their own tokens
  // Numbers are split per-digit or small groups

  let tokenCount = 0;

  // Split on whitespace first
  const chunks = text.split(/(\s+)/);

  for (const chunk of chunks) {
    if (!chunk) continue;

    // Pure whitespace: roughly 1 token per whitespace sequence
    if (/^\s+$/.test(chunk)) {
      // Newlines are individual tokens
      const newlines = (chunk.match(/\n/g) || []).length;
      tokenCount += newlines;
      // Remaining spaces: ~1 token per space sequence
      const remaining = chunk.replace(/\n/g, '');
      if (remaining.length > 0) tokenCount += 1;
      continue;
    }

    // Split on punctuation boundaries
    const parts = chunk.split(/([^\w])/);

    for (const part of parts) {
      if (!part) continue;

      // Single punctuation character = 1 token
      if (/^[^\w]$/.test(part)) {
        tokenCount += 1;
        continue;
      }

      // Pure digits: ~1 token per 1-3 digits
      if (/^\d+$/.test(part)) {
        tokenCount += Math.ceil(part.length / 3);
        continue;
      }

      // Words: approximate using ~4 chars per token (cl100k_base average)
      // Short words (<=4 chars) are usually 1 token
      // Longer words get split
      if (part.length <= 4) {
        tokenCount += 1;
      } else {
        tokenCount += Math.ceil(part.length / 4);
      }
    }
  }

  return Math.max(1, tokenCount);
}

export interface TextSegment {
  text: string;
  tokens: number;
}

/**
 * Split text by the given segmentation strategy and count tokens per segment.
 */
export function tokenizeSegments(
  text: string,
  segmentBy: 'line' | 'paragraph' | 'sentence'
): TextSegment[] {
  let rawSegments: string[];

  switch (segmentBy) {
    case 'line':
      rawSegments = text.split(/\n/);
      break;
    case 'paragraph':
      rawSegments = text.split(/\n\s*\n/);
      break;
    case 'sentence':
      rawSegments = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
      break;
    default:
      rawSegments = text.split(/\n/);
  }

  return rawSegments
    .filter((s) => s.trim().length > 0)
    .map((s) => ({
      text: s.trim(),
      tokens: estimateTokens(s),
    }));
}
