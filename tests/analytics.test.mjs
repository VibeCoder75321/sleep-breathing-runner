import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const analyticsSource = await readFile(
  new URL("../app/google-analytics.tsx", import.meta.url),
  "utf8",
);
const layoutSource = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
const workflowSource = await readFile(
  new URL("../.github/workflows/pages.yml", import.meta.url),
  "utf8",
);

test("loads GA4 only after explicit analytics consent", () => {
  assert.match(analyticsSource, /consent === "granted"/);
  assert.match(analyticsSource, /Allow analytics/);
  assert.match(analyticsSource, /No thanks/);
  assert.match(analyticsSource, /analytics_storage: choice/);
  assert.match(analyticsSource, /ad_storage: 'denied'/);
});

test("uses automatic measurement without sending health-answer events", () => {
  assert.match(analyticsSource, /gtag\('config'/);
  assert.doesNotMatch(analyticsSource, /gtag\(['"]event['"]/);
  assert.doesNotMatch(analyticsSource, /from ["']\.\/page["']/);
});

test("injects the repository-configured measurement ID at build time", () => {
  assert.match(layoutSource, /NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  assert.match(workflowSource, /vars\.GA_MEASUREMENT_ID/);
  assert.doesNotMatch(layoutSource, /G-[A-Z0-9]{6,}/);
  assert.doesNotMatch(analyticsSource, /G-[A-Z0-9]{6,}/);
});
