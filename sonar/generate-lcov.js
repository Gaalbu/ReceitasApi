const fs = require('fs');
const path = require('path');

const coverageFile = '/workspace/receitasapi-ui/coverage/receitasapi-frontend/coverage-final.json';
const coverageDir = '/workspace/receitasapi-ui/coverage';
const workspaceRoot = '/workspace';

function normalizePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.startsWith(`${workspaceRoot}/`)) {
    return normalized.slice(workspaceRoot.length + 1);
  }
  return normalized;
}

function uniqueSortedLines(statementMap, statementCounts) {
  const lineCounts = new Map();

  for (const [statementId, location] of Object.entries(statementMap || {})) {
    const count = Number(statementCounts?.[statementId] ?? 0);
    const lineNumber = location.start.line;
    lineCounts.set(lineNumber, Math.max(lineCounts.get(lineNumber) ?? 0, count));
  }

  return Array.from(lineCounts.entries()).sort((left, right) => left[0] - right[0]);
}

function buildFileReport(filePath, coverageEntry) {
  const lines = [];
  const normalizedPath = normalizePath(filePath);

  lines.push('TN:');
  lines.push(`SF:${normalizedPath}`);

  const functionNames = new Map();
  for (const [functionId, functionMeta] of Object.entries(coverageEntry.fnMap || {})) {
    const functionName = functionMeta.name || `fn_${functionId}`;
    const lineNumber = functionMeta.decl?.start?.line ?? functionMeta.loc?.start?.line ?? 1;
    const count = Number(coverageEntry.f?.[functionId] ?? 0);
    const sanitizedName = functionName.replace(/,/g, ' ');

    functionNames.set(sanitizedName, { lineNumber, count });
    lines.push(`FN:${lineNumber},${sanitizedName}`);
  }

  for (const [functionName, details] of functionNames.entries()) {
    lines.push(`FNDA:${details.count},${functionName}`);
  }

  const statementLines = uniqueSortedLines(coverageEntry.statementMap, coverageEntry.s);
  for (const [lineNumber, count] of statementLines) {
    lines.push(`DA:${lineNumber},${count}`);
  }

  const totalFunctions = Object.keys(coverageEntry.fnMap || {}).length;
  const hitFunctions = Object.values(coverageEntry.f || {}).filter((count) => Number(count) > 0).length;
  const totalLines = statementLines.length;
  const hitLines = statementLines.filter(([, count]) => Number(count) > 0).length;

  lines.push(`FNF:${totalFunctions}`);
  lines.push(`FNH:${hitFunctions}`);
  lines.push(`LF:${totalLines}`);
  lines.push(`LH:${hitLines}`);
  lines.push('end_of_record');

  return lines;
}

const rawCoverage = fs.readFileSync(coverageFile, 'utf8');
const coverageMap = JSON.parse(rawCoverage);
const lcovLines = [];

for (const [filePath, coverageEntry] of Object.entries(coverageMap)) {
  lcovLines.push(...buildFileReport(filePath, coverageEntry));
}

fs.writeFileSync(path.join(coverageDir, 'lcov.info'), `${lcovLines.join('\n')}\n`);
console.log(`LCOV written to ${path.join(coverageDir, 'lcov.info')}`);
