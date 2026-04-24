/**
 * costs.ts — Multi-model cost calculator
 */

export interface ModelPricing {
  name: string;
  inputCostPer1M: number;  // USD per 1M input tokens
  outputCostPer1M: number; // USD per 1M output tokens
}

export interface ModelCostResult {
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * Supported LLM model pricing (as of 2026).
 */
export const MODELS: ModelPricing[] = [
  { name: 'gpt-4o', inputCostPer1M: 5.0, outputCostPer1M: 15.0 },
  { name: 'claude-3-5-sonnet', inputCostPer1M: 3.0, outputCostPer1M: 15.0 },
  { name: 'gemini-1.5-pro', inputCostPer1M: 1.25, outputCostPer1M: 5.0 },
];

/**
 * Calculate costs for the given token count across all models.
 * Assumes the same token count is used for both input and output estimates.
 */
export function calculateCosts(tokens: number): ModelCostResult[] {
  return MODELS.map((model) => {
    const inputCost = (tokens / 1_000_000) * model.inputCostPer1M;
    const outputCost = (tokens / 1_000_000) * model.outputCostPer1M;
    return {
      model: model.name,
      inputTokens: tokens,
      outputTokens: tokens,
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat((inputCost + outputCost).toFixed(6)),
    };
  });
}
