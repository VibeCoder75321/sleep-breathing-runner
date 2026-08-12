import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const layoutSource = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);

test("uses the Sleep Study Check GitHub Pages address", () => {
  assert.match(
    layoutSource,
    /https:\/\/vibecoder75321\.github\.io\/sleep-study-check/,
  );
  assert.doesNotMatch(layoutSource, /sleep-breathing-runner/);
  assert.doesNotMatch(layoutSource, /chatgpt\.site/);
});

test("uses the approved short introductory copy", () => {
  assert.match(pageSource, /Patient Advocacy Tool/);
  assert.match(pageSource, /My sleep study said/);
  assert.doesNotMatch(pageSource, /A sleep test said/);
  assert.doesNotMatch(pageSource, /Start with the report—not the summary/);
  assert.match(
    pageSource,
    /Check that the test conclusively rules out obstructive sleep breathing\s+disorders, based on current American Academy of Sleep Medicine clinical\s+guidelines\./,
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
  assert.doesNotMatch(
    pageSource,
    /Persistent symptoms are important, but they do not identify the cause by themselves\./,
  );
  assert.match(pageSource, /<QuestionCard number=\{2\} title="Was it a home test or an in-lab sleep study\?">/);
});

test("provides a pre-study path with an explicit AASM 1A order request", () => {
  assert.match(pageSource, /I haven’t done my sleep study yet/);
  assert.match(pageSource, /symptomStatus === "notTested"/);
  assert.match(pageSource, /Ask your doctor to explicitly order an in-lab sleep study\./);
  assert.match(
    pageSource,
    /Ask your doctor to explicitly order an in-lab PSG using AASM recommended 1A scoring \(3% oxygen drop OR arousal\), with RERAs and RDI scored and reported\./,
  );
  assert.match(pageSource, /sources=\{\["ethics"\]\}/);
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
  assert.match(pageSource, /I see AHI 3% or recommended AASM 1A\./);
  assert.doesNotMatch(pageSource, /I see AHI 3%, hypopnea or arousal criteria/);
  assert.match(pageSource, /I see AHI 4%, CMS, Medicare or optional AASM 1B\./);
  assert.match(pageSource, /The report lists both/);
  assert.match(pageSource, /Scan the report for 3% or 4% oxygen desaturation, AASM 1A or 1B, CMS, or Medicare\./);
  assert.match(pageSource, /What was the 3% AHI\?/);
});

test("keeps AASM 1A separate from optional RERA scoring", () => {
  assert.match(
    pageSource,
    /Electing to score respiratory effort-related arousals is still OPTIONAL\./,
  );
  assert.match(
    pageSource,
    /A RERA value of 0 or a blank field does not necessarily tell you whether/,
  );
  assert.doesNotMatch(pageSource, /Esophageal pressure/i);
  assert.doesNotMatch(pageSource, /\bPes\b/);
});

test("asks the user to copy the visible RERA result before asking for RDI", () => {
  assert.match(pageSource, /What do you see next to “RERA” on the report\?/);
  assert.match(
    pageSource,
    /Look in the respiratory-events table\. Do not use the RDI number for this question\./,
  );
  assert.match(pageSource, /label="A number greater than 0"/);
  assert.doesNotMatch(pageSource, /For example, RERA 6 or RERA index 1\.2\./);
  assert.match(pageSource, /label="0 or a blank space"/);
  assert.doesNotMatch(pageSource, /Choose this even if the RDI is the same as the AHI\./);
  assert.match(pageSource, /label="I can’t find “RERA”"/);
  assert.doesNotMatch(pageSource, /The report may not include a RERA line\./);
  assert.match(pageSource, /Now find the RDI\. What number is shown\?/);
  assert.match(pageSource, /label="Not listed \/ I can’t find it"/);
  assert.match(pageSource, /reraFinding === "positive" \? \(/);
  assert.doesNotMatch(pageSource, /label="RDI <5 and RERAs were scored"/);
  assert.doesNotMatch(pageSource, /label="RDI <5 and RERAs are 0, blank, or not reported"/);
  assert.doesNotMatch(
    pageSource,
    /Use the RDI only if the report defines it as apneas \+ hypopneas \+ RERAs per hour of sleep\./,
  );
  assert.doesNotMatch(pageSource, /Includes RDI equal to AHI/);
  assert.doesNotMatch(pageSource, /label="Not reported \/ I don’t know"/);
});

test("keeps distinct 3% and 4% results after the simplified RERA step", () => {
  assert.match(pageSource, /AASM 1A — AHI\/RDI <5 — RERAs were scored/);
  assert.match(pageSource, /AASM 1B \/ 4% — AHI\/RDI <5 — RERAs were scored/);
  assert.match(pageSource, /AASM 1A — AHI\/RDI <5 — RERAs are 0 or not reported/);
  assert.match(pageSource, /AASM 1B \/ 4% — AHI\/RDI <5 — RERAs are 0 or not reported/);
  assert.match(pageSource, /This sleep study did not meet the usual criteria for OSA/);
  assert.match(pageSource, /the report does not clearly show whether RERAs were actually evaluated/);
  assert.match(
    pageSource,
    /reraFinding === "positive" && rdiResult === "below5" && usesAasm1A/,
  );
  assert.match(
    pageSource,
    /reraFinding === "positive" && rdiResult === "below5" && scoringRule === "4"/,
  );
  assert.match(pageSource, /persistent restricted or flow-limited breathing/);
  assert.match(pageSource, /respiratoryLegMovements/);
  assert.match(pageSource, /reraScoring/);
  assert.doesNotMatch(pageSource, /A 4%-only AHI <5 does not rule out OSA/);
  assert.doesNotMatch(pageSource, /An AHI <5 using AASM recommended 1A scoring criteria did not establish OSA by AHI alone/);
});

test("uses qualified guidance when only the 4% AHI is available", () => {
  assert.match(pageSource, /AASM 1B \/ 4% — AHI\/RDI <5 — RERAs were scored/);
  assert.match(
    pageSource,
    /This result does not rule out OSA, based on the current AASM-recommended 1A hypopnea or arousal scoring rule\./,
  );
  assert.match(
    pageSource,
    /Ask whether your existing sleep study can be rescored using AASM 1A criteria and whether a separate 1A AHI can be reported\./,
  );
  assert.match(pageSource, /AASM currently\s+recommends the broader 1A rule: 3% oxygen drop OR arousal\./);
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
