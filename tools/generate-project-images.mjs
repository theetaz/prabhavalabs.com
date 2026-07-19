#!/usr/bin/env node
/**
 * Generates one themed card image per project via the Gemini image API.
 *
 * Usage: GEMINI_API_KEY=... node tools/generate-project-images.mjs [slug ...]
 * Output: public/images/projects/<slug>.png  (convert to .jpg with ffmpeg
 * afterwards; see .claude/skills/brand-images/SKILL.md for the full recipe)
 *
 * Existing files are skipped so a single regeneration never re-bills the set.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('GEMINI_API_KEY missing');
  process.exit(1);
}
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Shared style contract — keep in sync with the brand-images skill.
const STYLE =
  'Abstract minimal editorial illustration on a near-black background (#050508), ' +
  'soft glowing light in white and violet (#a78bfa) with one restrained warm amber accent allowed, ' +
  'subtle film grain, shallow depth of field, premium dark agency aesthetic, ' +
  'cinematic lighting, no text, no letters, no numbers, no logos, no people, no UI screenshots';

const PROJECTS = {
  vidura:
    'glowing horizontal subtitle bars of light floating beneath a large luminous screen shape, one bar highlighted in violet',
  opentreasury:
    'a chain of translucent glass ledger blocks receding into darkness, each block faintly lit from within, one block glowing brighter as if being verified',
  gridpulse:
    'a dark aerial city street grid drawn in faint lines, scattered glowing points where the grid has gone dark, one neighbourhood pulsing violet',
  geopop:
    'a terrain of tiny dots forming population density peaks and valleys, tallest cluster glowing white hot, fading to sparse violet points',
  goyama:
    'terraced rice paddy fields at night seen from above, water surfaces reflecting faint violet light, thin glowing contour lines',
  terrarun:
    'a glowing GPS running route closing into a loop over a dark map, the enclosed territory filling with faint violet hexagons',
  'speak-ai':
    'two voice waveforms facing each other in conversation, one white and one violet, their ripples meeting in the middle',
  'voice-mind':
    'a chaotic tangle of audio waveform threads on the left resolving into clean parallel glowing lines on the right',
  'open-pay':
    'streams of small glowing coins of light flowing through a forked glass channel, splitting into precise equal branches',
  mansariya:
    'ribbons of light tracing bus routes through a dark city, converging at a glowing terminus, one ribbon in warm amber',
  'ceylon-hub':
    'the island of Sri Lanka formed from thousands of tiny glowing dots on black, data contour rings radiating from it',
  'lang-stream-ai-agent':
    'a directed graph of glowing nodes with a stream of small light particles flowing along its edges toward a bright endpoint',
  mendlog:
    'a dark industrial machine silhouette with concentric voice ripples emanating from a single glowing point beside it',
};

async function generate(slug, subject) {
  const models = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
  for (const model of models) {
    const res = await fetch(`${BASE}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${subject}. ${STYLE}` }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
      }),
    });
    const json = await res.json();
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (part) {
      await writeFile(`public/images/projects/${slug}.png`, Buffer.from(part.inlineData.data, 'base64'));
      console.log(`✓ ${slug}.png (${model})`);
      return;
    }
    console.log(`! ${slug} via ${model}: ${JSON.stringify(json).slice(0, 200)}`);
  }
  throw new Error(`${slug}: all models failed`);
}

await mkdir('public/images/projects', { recursive: true });
const only = process.argv.slice(2);
const entries = Object.entries(PROJECTS).filter(
  ([slug]) => (only.length === 0 || only.includes(slug)) && !existsSync(`public/images/projects/${slug}.png`) && !existsSync(`public/images/projects/${slug}.jpg`)
);
const results = await Promise.allSettled(entries.map(([s, p]) => generate(s, p)));
const failed = results.filter((r) => r.status === 'rejected');
failed.forEach((r) => console.error('FAILED:', r.reason.message));
console.log(failed.length ? `DONE WITH ${failed.length} FAILURES` : 'ALL DONE');
process.exit(failed.length ? 1 : 0);
