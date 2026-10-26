/**
 * Advent of Code Solutions Explorer - Data Builder
 * Scans day_* directories and compiles solutions metadata and content
 * into src/solutions.data.js and src/solutions.json for the Cloudflare Worker.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');

function countLines(content) {
  if (!content) return 0;
  let count = 0;
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) { // '\n'
      count++;
    }
  }
  if (content.length > 0 && content.charCodeAt(content.length - 1) !== 10) {
    count++;
  }
  return count;
}

export function buildData() {
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const dayDirs = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const match = entry.name.match(/^day_(\d+)$/i);
      if (match) {
        dayDirs.push({
          dayNum: parseInt(match[1], 10),
          dirName: entry.name,
          dirPath: path.join(ROOT_DIR, entry.name),
        });
      }
    }
  }

  // Sort numerically by day number
  dayDirs.sort((a, b) => a.dayNum - b.dayNum);

  const days = [];
  const filesLookup = {};

  for (const { dayNum, dirName, dirPath } of dayDirs) {
    const itemNames = fs.readdirSync(dirPath);
    // Sort case-insensitively
    itemNames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    const pyFiles = [];
    const otherFiles = [];

    for (const itemName of itemNames) {
      const filePath = path.join(dirPath, itemName);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      const ext = path.extname(itemName).toLowerCase();
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = countLines(content);
      const isPython = ext === '.py';

      const fileInfo = {
        name: itemName,
        extension: ext,
        size: stat.size,
        lines: lines,
        is_python: isPython,
      };

      if (isPython) {
        pyFiles.push(fileInfo);
      } else {
        otherFiles.push(fileInfo);
      }

      filesLookup[`${dirName}/${itemName}`] = {
        day: dirName,
        filename: itemName,
        content: content,
        line_count: lines,
        size_bytes: stat.size,
        extension: ext,
        is_python: isPython,
      };
    }

    days.push({
      id: dirName,
      day_number: dayNum,
      title: `Day ${dayNum}`,
      python_files: pyFiles,
      other_files: otherFiles,
      total_files: pyFiles.length + otherFiles.length,
    });
  }

  const output = {
    days,
    files: filesLookup,
    total_days: days.length,
    build_time: new Date().toISOString(),
  };

  if (!fs.existsSync(SRC_DIR)) {
    fs.mkdirSync(SRC_DIR, { recursive: true });
  }

  const jsonOutputPath = path.join(SRC_DIR, 'solutions.json');
  fs.writeFileSync(jsonOutputPath, JSON.stringify(output, null, 2), 'utf8');

  const jsOutputPath = path.join(SRC_DIR, 'solutions.data.js');
  fs.writeFileSync(
    jsOutputPath,
    `// Auto-generated solutions data bundle\nexport default ${JSON.stringify(output, null, 2)};\n`,
    'utf8'
  );

  console.log(`Generated solutions data: ${days.length} days, ${Object.keys(filesLookup).length} files`);
}

// Run if directly executed
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  buildData();
}
