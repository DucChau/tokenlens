#!/usr/bin/env node
/**
 * index.ts — CLI entry point for tokenlens
 */

import { Command } from 'commander';
import { analyzeText, readInput, readStdin } from './analyzer';
import { calculateCosts } from './costs';
import { renderAnalysis } from './renderer';

const program = new Command();

program
  .name('tokenlens')
  .description(
    'A terminal token budget analyzer — tokenize any text, visualize density, and calculate multi-model LLM cost estimates.'
  )
  .version('1.0.0');

program
  .command('analyze <file>')
  .description(
    'Analyze a text file for token usage. Use "-" to read from stdin.'
  )
  .option(
    '-s, --segment <type>',
    'Segmentation strategy: line, paragraph, or sentence',
    'paragraph'
  )
  .option(
    '-o, --output <format>',
    'Output format: table or json',
    'table'
  )
  .action(async (file: string, options: { segment: string; output: string }) => {
    try {
      let text: string;

      if (file === '-') {
        // Read from stdin
        text = await readStdin();
      } else {
        text = readInput(file);
      }

      if (!text || text.trim().length === 0) {
        console.error('Error: Input is empty.');
        process.exit(1);
      }

      const segmentBy = options.segment as 'line' | 'paragraph' | 'sentence';
      const result = analyzeText(text, segmentBy);
      const costs = calculateCosts(result.totalTokens);

      if (options.output === 'json') {
        console.log(
          JSON.stringify(
            {
              analysis: result,
              costs,
            },
            null,
            2
          )
        );
      } else {
        renderAnalysis(result, costs);
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Show help if no arguments
if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
