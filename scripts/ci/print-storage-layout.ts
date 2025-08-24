#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';

// This script prints storage layout extracted from Hardhat build info
// Requires hardhat compiler outputSelection to include storageLayout

interface StorageEntry {
  slot: string;
  offset: number;
  type: string;
  label: string;
}

interface StorageLayout {
  storage: StorageEntry[];
}

interface ContractOutput {
  storageLayout?: StorageLayout;
}

interface BuildInfo {
  output?: {
    contracts?: {
      [file: string]: {
        [contractName: string]: ContractOutput;
      };
    };
  };
}

function findBuildInfos(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    if (ent.isFile() && ent.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

function main(): void {
  const artifactsDir = path.join('artifacts', 'build-info');
  if (!fs.existsSync(artifactsDir)) {
    console.error('artifacts/build-info not found. Run `npm run compile` first.');
    process.exit(1);
  }
  const infos = findBuildInfos(artifactsDir);
  let printed = false;
  for (const infoPath of infos) {
    const info: BuildInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    const out = info.output?.contracts || {};
    for (const file of Object.keys(out)) {
      for (const name of Object.keys(out[file])) {
        const c = out[file][name];
        const isMexasFile = file.endsWith('/MEXAS.sol') || file === 'contracts/MEXAS.sol';
        if (name === 'MEXAS' && isMexasFile && c.storageLayout) {
          printed = true;
          console.log(`\n== Storage Layout: ${file}:${name} ==`);
          for (const e of c.storageLayout.storage) {
            console.log(`${e.slot}\t${e.offset}\t${e.type}\t${e.label}`);
          }
          // We only print MEXAS layout
          return;
        }
      }
    }
  }
  if (!printed) {
    console.warn('No storageLayout for contracts/MEXAS.sol:MEXAS found. Compile first or check outputSelection.');
  }
}

main();
