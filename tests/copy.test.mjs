import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("uses the approved short introductory copy", () => {
  assert.match(pageSource, /Patient Advocacy Tool/);
  assert.doesNotMatch(pageSource, /Start with the report—not the summary/);
  assert.match(
    pageSource,
    /Check that the test conclusively rules out sleep breathing disorders\./,
  );
  assert.doesNotMatch(pageSource, /5 or higher/);
  assert.match(
    pageSource,
    /This is an educational tool based on American Academy of Sleep Medicine\s+sleep-testing guidelines\. It does not diagnose OSA or UARS\./,
  );
});

test("asks about residual symptoms before the report pathway", () => {
  assert.match(pageSource, /Are symptoms still affecting you despite the sleep test\?/);
  assert.match(pageSource, /Yes — symptoms are still present/);
  assert.match(pageSource, /label="No"/);
  assert.doesNotMatch(pageSource, /symptoms have resolved/);
  assert.doesNotMatch(pageSource, /I’m not sure/);
  assert.match(
    pageSource,
    /unrefreshing sleep, daytime sleepiness, fatigue, insomnia, waking with gasping or choking, loud snoring, or witnessed breathing pauses/,
  );
  assert.match(
    pageSource,
    /Persistent symptoms are important, but they do not identify the cause by themselves\./,
  );
  assert.match(pageSource, /<QuestionCard number=\{2\} title="Was it a home test or an in-lab sleep study\?">/);
});

test("uses the current AHI or REI wording for the home-test pathway", () => {
  assert.match(pageSource, /What was the AHI or REI\?/);
  assert.doesNotMatch(pageSource, /What was the REI or AHI\?/);
  assert.doesNotMatch(
    pageSource,
    /In an adult with relevant symptoms, a technically adequate HSAT/,
  );
  assert.match(
    pageSource,
    /A negative HSAT does not reliably rule out OSA\./,
  );
});

test("standardizes AASM 1A wording and keeps next steps visible", () => {
  assert.match(pageSource, /AASM recommended 1A scoring criteria/);
  assert.doesNotMatch(pageSource, /AASM-recommended 3%-or-arousal rule/i);
  assert.match(pageSource, /<span>Next step<\/span>/);
  assert.match(pageSource, /<p>\{reply\}<\/p>/);
  assert.doesNotMatch(pageSource, /Copy next step|navigator\.clipboard/);
  assert.match(
    pageSource,
    /Ask the ordering clinician for an attended PSG rather than another HSAT\./,
  );
  assert.match(pageSource, /Strong AASM recommendation/);
  assert.match(pageSource, /An attended PSG should be performed\./);
  assert.match(pageSource, /repeating the HSAT is\s+generally not recommended because PSG is more sensitive\./);
  assert.match(
    pageSource,
    /We recommend that if a single home sleep apnea test is negative,\s+inconclusive, or technically inadequate, polysomnography be performed\s+for the diagnosis of OSA\./,
  );
  assert.match(pageSource, /Recommendation 3 \(STRONG\)/);
});

test("shows category-specific sources with short supporting excerpts", () => {
  assert.match(pageSource, /AASM sources &amp; supporting studies/);
  assert.match(pageSource, /The Ethics of Hypopnea Scoring/);
  assert.match(pageSource, /Disparate hypopnea scoring undermines beneficent patient care/);
  assert.match(pageSource, /Respiratory Event Index Underestimates Sleep Apnea Severity/);
  assert.match(pageSource, /We recommend that if a single home sleep apnea test is negative/);
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
  assert.match(pageSource, /Esophageal pressure monitoring \(Pes\) is an/);
  assert.match(pageSource, /pattern historically called UARS/);
});

test("uses the revised RDI choices and concise negative-PSG next step", () => {
  assert.match(pageSource, /label="RDI <5 and RERAs were scored"/);
  assert.match(pageSource, /label="RDI <5 and RERAs are blank or 0"/);
  assert.doesNotMatch(
    pageSource,
    /Use the RDI only if the report defines it as apneas \+ hypopneas \+ RERAs per hour of sleep\./,
  );
  assert.doesNotMatch(pageSource, /Includes RDI equal to AHI/);
  assert.doesNotMatch(pageSource, /label="Not reported \/ I don’t know"/);
  assert.match(
    pageSource,
    /Review non-respiratory causes of poor sleep\. If suspicion of SBD remains, a repeat PSG or PSG with Esophageal pressure monitoring \(Pes\) may be appropriate\./,
  );
  assert.doesNotMatch(
    pageSource,
    /Review technical quality, total sleep time, REM and supine sleep, and\s+non-respiratory causes of poor sleep\./,
  );
});

test("uses qualified guidance when only the 4% AHI is available", () => {
  assert.match(pageSource, /4% AHI and RDI are below 5/);
  assert.match(
    pageSource,
    /This result does not rule out OSA using AASM 1A scoring\./,
  );
  assert.match(
    pageSource,
    /Ask whether the existing PSG can be rescored using the AASM recommended 1A scoring criteria, or whether a separately calculated 1A AHI is available\./,
  );
  assert.match(pageSource, /4%-based RDI is not the same as an AHI calculated using AASM recommended 1A/);
  assert.match(pageSource, /For more information, review &quot;The Ethics of\s+Hypopnea Scoring&quot;/);
  assert.doesNotMatch(pageSource, /AASM 1A result not reported/);
  assert.doesNotMatch(pageSource, /Recommended scoring still missing/);
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
