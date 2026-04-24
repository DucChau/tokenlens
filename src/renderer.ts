/**
 * renderer.ts — Terminal bar chart + table renderer
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { AnalysisResult } from './analyzer';
import { ModelCostResult } from './costs';

const BAR_CHAR = '█';
const MAX_BAR_WIDTH = 40;

/**
 * Render a rich terminal analysis output.
 */
export function renderAnalysis(
  result: AnalysisResult,
  costs: ModelCostResult[]
): void {
  // ── Summary Header ──
  console.log('');
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('        🔍 TokenLens — Token Analysis        ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.bold('  Total Tokens:    ') + chalk.yellow.bold(result.totalTokens.toLocaleString()));
  console.log(chalk.bold('  Segments:        ') + chalk.white(result.segments.length.toString()));
  console.log(chalk.bold('  Max (segment):   ') + chalk.red(result.maxSegmentTokens.toLocaleString()));
  console.log(chalk.bold('  Avg (segment):   ') + chalk.green(result.avgSegmentTokens.toLocaleString()));
  console.log('');

  // ── Bar Chart ──
  console.log(chalk.bold.underline('  Token Distribution by Segment'));
  console.log('');

  result.segments.forEach((segment, i) => {
    const density = result.tokenDensityMap[i];
    const barWidth = Math.max(1, Math.round(density * MAX_BAR_WIDTH));
    const bar = BAR_CHAR.repeat(barWidth);

    // Color gradient: green → yellow → red based on density
    let coloredBar: string;
    if (density < 0.33) {
      coloredBar = chalk.green(bar);
    } else if (density < 0.66) {
      coloredBar = chalk.yellow(bar);
    } else {
      coloredBar = chalk.red(bar);
    }

    const label = `  Seg ${String(i + 1).padStart(3)}`;
    const tokenLabel = chalk.gray(` ${segment.tokens.toLocaleString()} tokens`);
    const preview = segment.text.substring(0, 30).replace(/\n/g, ' ');
    const previewLabel = chalk.dim(` "${preview}${segment.text.length > 30 ? '…' : ''}"`);

    console.log(`${label} ${coloredBar}${tokenLabel}${previewLabel}`);
  });

  console.log('');

  // ── Cost Table ──
  const costTable = new Table({
    head: [
      chalk.bold('Model'),
      chalk.bold('Input Cost'),
      chalk.bold('Output Cost'),
      chalk.bold('Total Cost'),
    ],
    colWidths: [22, 15, 15, 15],
    style: { head: [], border: [] },
  });

  costs.forEach((c) => {
    costTable.push([
      chalk.white(c.model),
      chalk.green(`$${c.inputCost.toFixed(4)}`),
      chalk.yellow(`$${c.outputCost.toFixed(4)}`),
      chalk.bold.cyan(`$${c.totalCost.toFixed(4)}`),
    ]);
  });

  console.log(chalk.bold.underline('  LLM Cost Estimates (input + output)'));
  console.log('');
  console.log(costTable.toString());
  console.log('');
  console.log(chalk.dim('  Prices based on published API rates as of 2026. Actual costs may vary.'));
  console.log('');
}
