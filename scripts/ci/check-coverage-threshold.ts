#!/usr/bin/env npx ts-node
import * as fs from 'fs';
import * as path from 'path';

interface CoverageSummary {
  total?: {
    lines?: { pct: number };
    branches?: { pct: number };
    functions?: { pct: number };
    statements?: { pct: number };
  };
  lines?: { pct: number };
  branches?: { pct: number };
  functions?: { pct: number };
  statements?: { pct: number };
}

interface SolidityCoverageData {
  s?: Record<string, number>; // statements
  b?: Record<string, number[]>; // branches
  f?: Record<string, number>; // functions
}

interface SolidityCoverage {
  [file: string]: SolidityCoverageData;
}

function main(): void {
  const threshold = Number(process.argv[2] || 90);

  // Prefer Istanbul-style summary if available
  const istanbulPath = path.join('coverage', 'coverage-summary.json');
  if (fs.existsSync(istanbulPath)) {
    const summary: CoverageSummary = JSON.parse(fs.readFileSync(istanbulPath, 'utf8'));
    const totals = summary.total || summary;
    const lines = totals.lines?.pct ?? 0;
    const branches = totals.branches?.pct ?? 0;
    const functions = totals.functions?.pct ?? 0;
    const statements = totals.statements?.pct ?? 0;
    console.log(`Coverage: lines=${lines}%, branches=${branches}%, funcs=${functions}%, stmts=${statements}%`);
    if (lines < threshold || branches < threshold) {
      console.error(`Coverage below threshold (${threshold}%).`);
      process.exit(2);
    }
    return;
  }

  // Fallback to solidity-coverage JSON (per-file maps under keys like 'contracts/...')
  const scPaths = [path.join('coverage', 'coverage.json'), 'coverage.json'];
  const scPath = scPaths.find((p) => fs.existsSync(p));
  if (!scPath) {
    console.error(`Coverage summary not found. Run: npm run coverage`);
    process.exit(1);
  }
  const sc: SolidityCoverage = JSON.parse(fs.readFileSync(scPath, 'utf8'));

  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (const [file, data] of Object.entries(sc)) {
    if (!data || typeof data !== 'object') continue;
    // statements: count keys in s; covered if value > 0
    if (data.s) {
      const sVals = Object.values(data.s);
      totalStatements += sVals.length;
      coveredStatements += sVals.filter((v) => Number(v) > 0).length;
    }
    // branches: entries are arrays of hit counts
    if (data.b) {
      for (const hits of Object.values(data.b)) {
        if (Array.isArray(hits)) {
          totalBranches += hits.length;
          coveredBranches += hits.filter((v) => Number(v) > 0).length;
        }
      }
    }
    // functions: count keys in f; covered if value > 0
    if (data.f) {
      const fVals = Object.values(data.f);
      totalFunctions += fVals.length;
      coveredFunctions += fVals.filter((v) => Number(v) > 0).length;
    }
  }

  const stmtPct = totalStatements ? (coveredStatements / totalStatements) * 100 : 0;
  const branchPct = totalBranches ? (coveredBranches / totalBranches) * 100 : 0;
  const funcPct = totalFunctions ? (coveredFunctions / totalFunctions) * 100 : 0;

  console.log(
    `Coverage (solidity-coverage): stmts=${stmtPct.toFixed(2)}%, branches=${branchPct.toFixed(2)}%, funcs=${funcPct.toFixed(2)}%`
  );
  if (stmtPct < threshold || branchPct < threshold) {
    console.error(`Coverage below threshold (${threshold}%).`);
    process.exit(2);
  }
}

main();
