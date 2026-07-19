#!/usr/bin/env node
/**
 * Generates the site's video + image assets via the Gemini API.
 *
 * Usage: GEMINI_API_KEY=... node tools/generate-assets.mjs
 * Videos -> public/videos/*.mp4   Images -> public/images/*.png
 *
 * Cost (2026-07): veo-3.1 8s ≈ $3.20, veo-3.1-fast 8s ≈ $1.20,
 * gemini image ≈ $0.04-0.13 each. Keep the video list short.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('GEMINI_API_KEY missing');
  process.exit(1);
}
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const HEADERS = { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' };

const STYLE =
  'cinematic, ethereal, ultra slow motion, seamless ambient loop, dark moody minimal aesthetic, pure black background, no text, no words, no people, no logos';

const VIDEOS = [
  {
    name: 'hero',
    model: 'veo-3.1-generate-preview',
    resolution: '1080p',
    prompt: `Abstract visualization of origin: in pure black space, faint luminous ribbons of deep violet and cool blue light slowly unfurl and drift upward like silk ink dispersing in dark water, tiny particles of white light emerging from a soft glowing point at the bottom of frame, ${STYLE}`,
  },
  {
    name: 'showcase',
    model: 'veo-3.1-fast-generate-preview',
    resolution: '720p',
    prompt: `Extreme macro shot of dark iridescent liquid glass slowly morphing, soft white and warm amber light refracting across an obsidian-black rippling surface, elegant slow undulating waves, luxurious shallow depth of field, ${STYLE}`,
  },
  {
    name: 'philosophy',
    model: 'veo-3.1-fast-generate-preview',
    resolution: '720p',
    prompt: `Slow drift through a dark void where delicate constellations of tiny white points of light connect with thin glowing lines, geometric lattice structures forming and gently dissolving, deep indigo haze, contemplative mood, ${STYLE}`,
  },
];

const IMG_STYLE =
  'Abstract minimal dark background texture, near-black, subtle film grain, soft out-of-focus glass shapes, premium agency aesthetic, no text, no letters, no logos, no people';

const IMAGES = [
  { name: 'card-1', prompt: `${IMG_STYLE}, faint deep violet luminous gradient rising from the bottom left corner` },
  { name: 'card-2', prompt: `${IMG_STYLE}, faint cool blue luminous gradient sweeping from the top right corner` },
  { name: 'card-3', prompt: `${IMG_STYLE}, faint warm amber luminous gradient glowing from the bottom edge` },
  { name: 'og', prompt: `${IMG_STYLE}, a single soft point of white light originating at the center with thin violet and blue light ribbons radiating outward symmetrically` },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startVideo(v, resolution) {
  const res = await fetch(`${BASE}/models/${v.model}:predictLongRunning`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      instances: [{ prompt: v.prompt }],
      parameters: { aspectRatio: '16:9', resolution, durationSeconds: 8 },
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.name) {
    throw new Error(`start ${v.name}@${resolution}: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json.name;
}

async function generateVideo(v) {
  let op;
  try {
    op = await startVideo(v, v.resolution);
  } catch (e) {
    if (v.resolution !== '720p') {
      console.log(`! ${v.name}: ${e.message} — retrying at 720p`);
      op = await startVideo(v, '720p');
    } else throw e;
  }
  console.log(`> ${v.name}: operation ${op}`);

  const deadline = Date.now() + 12 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(12000);
    const res = await fetch(`${BASE}/${op}`, { headers: HEADERS });
    const json = await res.json();
    if (json.error) throw new Error(`${v.name} op error: ${JSON.stringify(json.error).slice(0, 400)}`);
    if (json.done) {
      const uri = json.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error(`${v.name} done but no uri: ${JSON.stringify(json.response).slice(0, 500)}`);
      const dl = await fetch(uri, { headers: { 'x-goog-api-key': KEY }, redirect: 'follow' });
      if (!dl.ok) throw new Error(`${v.name} download HTTP ${dl.status}`);
      const buf = Buffer.from(await dl.arrayBuffer());
      await writeFile(`public/videos/${v.name}.mp4`, buf);
      console.log(`✓ ${v.name}.mp4 (${(buf.length / 1e6).toFixed(1)} MB)`);
      return;
    }
    console.log(`  ${v.name}: pending...`);
  }
  throw new Error(`${v.name}: timed out`);
}

async function generateImage(img) {
  const models = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
  for (const model of models) {
    const res = await fetch(`${BASE}/models/${model}:generateContent`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        contents: [{ parts: [{ text: img.prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
      }),
    });
    const json = await res.json();
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (part) {
      await writeFile(`public/images/${img.name}.png`, Buffer.from(part.inlineData.data, 'base64'));
      console.log(`✓ ${img.name}.png (${model})`);
      return;
    }
    console.log(`! ${img.name} via ${model}: ${JSON.stringify(json).slice(0, 250)}`);
  }
  throw new Error(`${img.name}: all image models failed`);
}

await mkdir('public/videos', { recursive: true });
await mkdir('public/images', { recursive: true });

const results = await Promise.allSettled([
  ...VIDEOS.filter((v) => !existsSync(`public/videos/${v.name}.mp4`)).map(generateVideo),
  ...IMAGES.filter((i) => !existsSync(`public/images/${i.name}.png`)).map(generateImage),
]);

let failed = 0;
for (const r of results) {
  if (r.status === 'rejected') {
    failed++;
    console.error('FAILED:', r.reason.message);
  }
}
console.log(failed ? `DONE WITH ${failed} FAILURES` : 'ALL DONE');
process.exit(failed ? 1 : 0);
