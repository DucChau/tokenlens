/**
 * analyzer.ts — Section splitter + token counter
 */

import * as fs from 'fs';
import { estimateTokens, tokenizeSegments, TextSegment } from './tokenizer';

export interface AnalysisResult {
  totalTokens: number;
  segments: TextSegment[];
  maxSegmentTokens: number;
  avgSegmentTokens: number;
  tokenDensityMap: number[];
}

/**
 * Read text from a file path or accept raw string input.
 * Returns an AnalysisResult with segment-level token statistics.
 */
export function analyzeText(
  input: string,
  segmentBy: 'line' | 'paragraph' | 'sentence' = 'paragraph'
): AnalysisResult {
  const segments = tokenizeSegments(input, segmentBy);
  const totalTokens = estimateTokens(input);
  const tokenCounts = segments.map((s) => s.tokens);
  const maxSegmentTokens = tokenCounts.length > 0 ? Math.max(...tokenCounts) : 0;
  const avgSegmentTokens =
    tokenCounts.length > 0
      ? Math.round(tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length)
      : 0;

  // Normalized density map (0-1) per segment
  const tokenDensityMap = tokenCounts.map((count) =>
    maxSegmentTokens > 0 ? count / maxSegmentTokens : 0
  );

  return {
    totalTokens,
    segments,
    maxSegmentTokens,
    avgSegmentTokens,
    tokenDensityMap,
  };
}

/**
 * Read text content from a file path.
 */
export function readInput(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Read from stdin (piped input).
 */
export async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk: string) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', (err: Error) => reject(err));
  });
}
