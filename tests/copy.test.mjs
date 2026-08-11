import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("uses the approved short introductory copy", () => {
  assert.match(
    pageSource,
    /Check that the test conclusively rules out sleep breathing disorders\./,
  );
  assert.doesNotMatch(pageSource, /5 or higher|Below 5|below 5/);
  assert.match(
    pageSource,
    /This is an educational tool based on American Academy of Sleep Medicine\s+sleep-testing guidelines\. It does not diagnose OSA or UARS\./,
  );
});

test("uses the current AHI or REI wording for the home-test pathway", () => {
  assert.match(pageSource, /What was the AHI or REI\?/);
  assert.doesNotMatch(pageSource, /What was the REI or AHI\?/);
});

test("standardizes AASM 1A wording and keeps next steps visible", () => {
  assert.match(pageSource, /AASM recommended 1A scoring criteria/);
  assert.doesNotMatch(pageSource, /AASM-recommended 3%-or-arousal rule/i);
  assert.match(pageSource, /<span>Next step<\/span>/);
  assert.match(pageSource, /<p>\{reply\}<\/p>/);
  assert.doesNotMatch(pageSource, /Copy next step|navigator\.clipboard/);
  assert.match(
    pageSource,
    /A next step would be to request an attended PSG scored using the AASM recommended 1A scoring criteria\./,
  );
});

test("shows category-specific sources with short supporting excerpts", () => {
  assert.match(pageSource, /AASM sources &amp; supporting studies/);
  assert.match(pageSource, /The Ethics of Hypopnea Scoring/);
  assert.match(pageSource, /Disparate hypopnea scoring undermines beneficent patient care/);
  assert.match(pageSource, /Respiratory Event Index Underestimates Sleep Apnea Severity/);
  assert.match(pageSource, /If a single home sleep apnea test is negative/);
  assert.match(pageSource, /Arousal-based scoring … includes respiratory effort-related arousals/);
  assert.match(pageSource, /sources=\{\["diagnosticNegative", "hsatUnderestimate", "aasm1a"\]\}/);
  assert.match(pageSource, /"aasm1a", "ethics", "scoringImpact"/);
});

test("uses concise positive next steps and the current PSG scoring labels", () => {
  assert.match(pageSource, /Review treatment options with your clinician\./);
  assert.match(pageSource, /Does your test state the scoring guidelines\?/);
  assert.match(pageSource, /I see AHI 3%, hypopnea or arousal criteria, or recommended AASM 1A\./);
  assert.match(pageSource, /I see AHI 4%, CMS, Medicare or optional AASM 1B\./);
  assert.match(pageSource, /The report lists both/);
  assert.match(pageSource, /Scan the report for 3% or 4% oxygen desaturation, AASM 1A or 1B, CMS, or Medicare\./);
  assert.match(pageSource, /What was the 3% AHI\?/);
});

test("keeps AASM 1A separate from optional RERA scoring", () => {
  assert.match(
    pageSource,
    /AASM 1A hypopnea scoring does not guarantee that RERAs were scored\./,
  );
  assert.match(pageSource, /Esophageal pressure monitoring is an/);
  assert.match(pageSource, /pattern historically called UARS/);
});

test("uses qualified guidance when only the 4% AHI is available", () => {
  assert.match(pageSource, /AASM 1A result not reported/);
  assert.match(
    pageSource,
    /ask whether an AHI using AASM recommended 1A scoring was also calculated or whether rescoring would be useful\./,
  );
  assert.doesNotMatch(pageSource, /Recommended scoring still missing/);
  assert.doesNotMatch(pageSource, /before ruling out OSA/);
});

test("asks for the scoring rule before asking about RERAs", () => {
  assert.match(pageSource, /Scoring rule needed/);
  assert.match(pageSource, /Find out whether the report used the 3% or 4% rule\./);
  assert.match(
    pageSource,
    /Ask the sleep lab or clinician whether the AHI was calculated using AASM recommended 1A \(3%\) or CMS\/Medicare \(4%\) scoring\./,
  );
  assert.match(
    pageSource,
    /scoringRule === "unknown" && psgResult === "below5"/,
  );
});
