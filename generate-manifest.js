#!/usr/bin/env node
/* ═══════════════════════════════════════════════════
   NEURAL OVERFLOW DIGEST — Auto Manifest Generator
   Scans issues/ folder and generates index.json
   ═══════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ISSUES_DIR = path.join(__dirname, 'issues');
const OUTPUT = path.join(ISSUES_DIR, 'index.json');

// Get all files in issues/
const files = fs.readdirSync(ISSUES_DIR);

// Find unique issue numbers from EN text files
// Patterns: issue-NNN-slug_EN.txt  OR  issue-NNN_EN.txt
const issueFiles = files.filter(function (f) {
  return /^issue-\d{3}.*_EN\.txt$/.test(f) && !f.includes('podcast');
});

// Sort by issue number
issueFiles.sort();

var issues = [];

issueFiles.forEach(function (enFile) {
  // Extract issue number
  var numMatch = enFile.match(/^issue-(\d{3})/);
  if (!numMatch) return;
  var number = numMatch[1];

  // Read the EN file to parse header
  var content = fs.readFileSync(path.join(ISSUES_DIR, enFile), 'utf8');
  var lines = content.split('\n');

  // Find the "Issue #NNN · TITLE · DATE" line
  var title = '';
  var date = '';
  var description = '';

  for (var i = 0; i < Math.min(lines.length, 20); i++) {
    var line = lines[i];

    // Parse issue header line: "Issue #001 · THE WEIGHT OF ENTER · Fri, Mar 20, 2026"
    var headerMatch = line.match(/Issue\s*#\d+\s*·\s*(.+?)\s*·\s*(.+?)[\s║]*$/);
    if (headerMatch) {
      title = headerMatch[1].trim();
      date = parseDate(headerMatch[2].trim());
    }
  }

  // Find first quoted line as description (after the header box)
  for (var j = 15; j < Math.min(lines.length, 30); j++) {
    var qline = lines[j].trim();
    var quoteMatch = qline.match(/^"(.+)/);
    if (quoteMatch) {
      // Grab the full quote (may span multiple lines)
      var quote = qline;
      // Check if quote closes on same line
      if (!qline.match(/"[^"]*"$/)) {
        // Multi-line quote — grab next lines until closing "
        for (var k = j + 1; k < Math.min(lines.length, j + 5); k++) {
          var nextLine = lines[k].trim();
          quote += ' ' + nextLine;
          if (nextLine.indexOf('"') !== -1) break;
        }
      }
      // Clean up: remove leading/trailing quotes and whitespace
      description = quote.replace(/^["'\s]+/, '').replace(/["'\s]+$/, '');
      break;
    }
  }

  // Detect available languages
  var langs = [];
  if (files.some(function (f) { return f.match(new RegExp('^issue-' + number + '.*_EN\\.txt$')) && !f.includes('podcast'); })) langs.push('EN');
  if (files.some(function (f) { return f.match(new RegExp('^issue-' + number + '.*_ES\\.txt$')) && !f.includes('podcast'); })) langs.push('ES');

  // Detect slug from filename
  // issue-000-pilot_EN.txt → slug = "pilot"
  // issue-001_EN.txt → slug = "" (no slug)
  var slugMatch = enFile.match(/^issue-\d{3}-([a-z0-9-]+)_EN\.txt$/);
  var slug = slugMatch ? slugMatch[1] : '';

  // Detect podcast files
  // Patterns: issue-NNN-podcast-slug_LANG.mp3 OR issue-NNN-podcast_LANG.mp3
  var podcast = null;
  var podcastEN = files.find(function (f) { return f.match(new RegExp('^issue-' + number + '.*podcast.*_EN\\.mp3$')); });
  var podcastES = files.find(function (f) { return f.match(new RegExp('^issue-' + number + '.*podcast.*_ES\\.mp3$')); });
  if (podcastEN || podcastES) {
    podcast = {};
    if (podcastEN) podcast.EN = podcastEN;
    if (podcastES) podcast.ES = podcastES;
  }

  // Build issue entry
  var entry = {
    number: number,
    slug: slug,
    title: titleCase(title),
    date: date,
    description: description,
    langs: langs
  };
  if (podcast) entry.podcast = podcast;

  // Detect text file pattern for this issue (needed by reader)
  // Store the actual file prefix so terminal.js knows how to load it
  // e.g., "issue-000-pilot" or "issue-001"
  var prefix = enFile.replace(/_EN\.txt$/, '');
  entry.filePrefix = prefix;

  issues.push(entry);
});

// Write manifest
var manifest = { issues: issues };
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');

console.log('Generated manifest with ' + issues.length + ' issue(s):');
issues.forEach(function (iss) {
  console.log('  [' + iss.number + '] ' + iss.title + (iss.podcast ? ' (+ podcast)' : ''));
});

/* ── Helpers ─────────────────────────────────────── */

function titleCase(str) {
  // "THE WEIGHT OF ENTER" → "The Weight of Enter"
  var small = ['of', 'the', 'and', 'in', 'on', 'at', 'to', 'a', 'an', 'for', 'is'];
  return str.split(/\s+/).map(function (word, i) {
    var lower = word.toLowerCase();
    if (i > 0 && small.indexOf(lower) !== -1) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}

function parseDate(raw) {
  // Try to parse various date formats into YYYY-MM-DD
  // "Friday, March 20, 2026" or "Fri, Mar 20, 2026"
  var d = new Date(raw);
  if (!isNaN(d.getTime())) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }
  // Fallback: return as-is
  return raw;
}
