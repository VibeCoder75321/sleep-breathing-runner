"use client";

import { useState } from "react";

type TestType = "hsat" | "psg" | "unknown" | null;
type ScoringRule = "3a" | "4" | "both" | "unknown" | null;
type ResultBand = "atLeast5" | "below5" | "unknown" | null;
type RdiStatus = "atLeast5" | "below5Scored" | "blankZero" | "unknown" | null;
type SourceKey =
  | "diagnosticUse"
  | "diagnosticNegative"
  | "diagnosticRepeat"
  | "osaCriteria"
  | "arousalRdi"
  | "aasm1a"
  | "ethics"
  | "hsatUnderestimate"
  | "scoringImpact";

type Source = {
  href: string;
  title: string;
  publication: string;
  year: string;
  excerpt?: string;
  relevance: string;
};

const SOURCES: Record<SourceKey, Source> = {
  diagnosticUse: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5337595/",
    title: "Clinical Practice Guideline for Diagnostic Testing for Adult OSA",
    publication: "AASM clinical practice guideline",
    year: "2017",
    relevance:
      "Supports use of a technically adequate HSAT to diagnose OSA in appropriate, uncomplicated adults.",
  },
  diagnosticNegative: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5337595/",
    title: "Clinical Practice Guideline for Diagnostic Testing for Adult OSA",
    publication: "AASM clinical practice guideline",
    year: "2017",
    excerpt:
      "If a single home sleep apnea test is negative … polysomnography be performed.",
    relevance:
      "Directly supports moving to an attended PSG after a negative, inconclusive, or inadequate HSAT.",
  },
  diagnosticRepeat: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5337595/",
    title: "Clinical Practice Guideline for Diagnostic Testing for Adult OSA",
    publication: "AASM clinical practice guideline",
    year: "2017",
    excerpt:
      "When the initial polysomnogram is negative … a second polysomnogram be considered.",
    relevance:
      "Supports discussing repeat PSG when a good-quality first PSG is negative but clinical suspicion remains.",
  },
  osaCriteria: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2699173/",
    title: "Clinical Guideline for the Evaluation and Management of Adult OSA",
    publication: "AASM clinical guideline",
    year: "2009",
    excerpt:
      "OSA is defined by … at least 5 obstructive respiratory events … per hour of sleep.",
    relevance:
      "Supports the ≥5 threshold in symptomatic adults when the counted events are obstructive and the study is technically adequate.",
  },
  arousalRdi: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6040795/",
    title: "Polysomnography Should Include Arousal-Based Scoring",
    publication: "AASM position statement",
    year: "2018",
    excerpt:
      "Arousal-based scoring … includes respiratory effort-related arousals (RERAs) … when calculating a respiratory disturbance index (RDI).",
    relevance:
      "Supports checking whether RERAs were scored and whether the report’s RDI actually includes them.",
  },
  aasm1a: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9059596/",
    title: "Transition to the AASM-Recommended Hypopnea Definition",
    publication: "AASM Hypopnea Scoring Rule Task Force",
    year: "2022",
    excerpt:
      "AASM recommends that hypopneas be identified … with a ≥ 3% reduction in oxygen saturation or an arousal.",
    relevance:
      "Directly supports asking for AASM recommended 1A scoring when only a 4%-only result is reported.",
  },
  ethics: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10985313/",
    title: "The Ethics of Hypopnea Scoring",
    publication: "Journal of Clinical Sleep Medicine",
    year: "2024",
    excerpt:
      "Disparate hypopnea scoring undermines beneficent patient care and impairs providers’ duty to deliver just, equitable care.",
    relevance:
      "Explains the patient-care and equity problem created by different AASM and payer hypopnea rules.",
  },
  hsatUnderestimate: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10805527/",
    title: "Respiratory Event Index Underestimates Sleep Apnea Severity",
    publication: "Peer-reviewed methods study",
    year: "2024",
    excerpt:
      "[It] does not use electroencephalography, and therefore cannot estimate sleep time or score arousals and related hypopneas.",
    relevance:
      "Shows why an HSAT-derived REI can be lower than a PSG-derived AHI, especially around mild-disease thresholds.",
  },
  scoringImpact: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6374086/",
    title: "Effect of Three Hypopnea Scoring Criteria on OSA Prevalence",
    publication: "Peer-reviewed population study",
    year: "2019",
    excerpt:
      "The method used for scoring hypopneas significantly influences the prevalence of obstructive sleep apnea.",
    relevance:
      "Demonstrates that the same underlying recordings can cross diagnostic or severity thresholds under different scoring definitions.",
  },
};

function ChoiceButton({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={"choice " + (active ? "choice-active" : "")}
      onClick={onClick}
      type="button"
    >
      <span className="choice-dot" aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  );
}

function SourceLinks({ sources }: { sources: SourceKey[] }) {
  return (
    <details className="sources">
      <summary>AASM sources &amp; supporting studies</summary>
      <div className="source-list">
        {sources.map((key) => {
          const source = SOURCES[key];
          return (
            <article className="source-card" key={key}>
              <div className="source-meta">
                <span>{source.publication}</span>
                <span>{source.year}</span>
              </div>
              <h3>{source.title}</h3>
              {source.excerpt ? <blockquote>“{source.excerpt}”</blockquote> : null}
              <p>{source.relevance}</p>
              <a href={source.href} rel="noreferrer" target="_blank">
                Read the source <span aria-hidden="true">↗</span>
              </a>
            </article>
          );
        })}
      </div>
    </details>
  );
}

function QuestionCard({
  number,
  title,
  help,
  children,
}: {
  number: number;
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={"question-card " + (number > 1 ? "question-card-second" : "")}>
      <div className="question-head">
        <span>Question {number}</span>
        <h2>{title}</h2>
        {help ? <p>{help}</p> : null}
      </div>
      <div className="choices">{children}</div>
    </section>
  );
}

function AnswerCard({
  tone = "warning",
  eyebrow,
  title,
  children,
  reply,
  sources,
}: {
  tone?: "warning" | "good" | "neutral";
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  reply: string;
  sources: SourceKey[];
}) {
  return (
    <section className={"answer answer-" + tone} aria-live="polite">
      <div className="answer-mark" aria-hidden="true">
        {tone === "good" ? "✓" : tone === "neutral" ? "i" : "!"}
      </div>
      <div className="answer-body">
        <p className="answer-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {children}
        <div className="next-step-summary">
          <span>Next step</span>
          <p>{reply}</p>
        </div>
        <div className="answer-actions">
          <SourceLinks sources={sources} />
        </div>
      </div>
    </section>
  );
}

function RdiQuestion({
  value,
  onChange,
}: {
  value: RdiStatus;
  onChange: (value: RdiStatus) => void;
}) {
  return (
    <QuestionCard
      help="Use the RDI only if the report defines it as apneas + hypopneas + RERAs per hour of sleep."
      number={4}
      title="What does the report say about RDI and RERAs?"
    >
      <ChoiceButton
        active={value === "atLeast5"}
        label="RDI is ≥5"
        onClick={() => onChange("atLeast5")}
      />
      <ChoiceButton
        active={value === "below5Scored"}
        label="RDI is <5; RERAs were scored"
        onClick={() => onChange("below5Scored")}
      />
      <ChoiceButton
        active={value === "blankZero"}
        description="Includes RDI equal to AHI when the report does not confirm RERA scoring."
        label="RERAs are blank or 0, but scoring is unclear"
        onClick={() => onChange("blankZero")}
      />
      <ChoiceButton
        active={value === "unknown"}
        description="No RDI/RERA result, no definition, or I do not have the full report."
        label="Not reported / I don’t know"
        onClick={() => onChange("unknown")}
      />
    </QuestionCard>
  );
}

export default function Home() {
  const [testType, setTestType] = useState<TestType>(null);
  const [scoringRule, setScoringRule] = useState<ScoringRule>(null);
  const [hsatResult, setHsatResult] = useState<ResultBand>(null);
  const [psgResult, setPsgResult] = useState<ResultBand>(null);
  const [rdiStatus, setRdiStatus] = useState<RdiStatus>(null);

  function chooseTest(value: TestType) {
    setTestType(value);
    setScoringRule(null);
    setHsatResult(null);
    setPsgResult(null);
    setRdiStatus(null);
  }

  function chooseScoring(value: ScoringRule) {
    setScoringRule(value);
    setPsgResult(null);
    setRdiStatus(null);
  }

  function choosePsgResult(value: ResultBand) {
    setPsgResult(value);
    setRdiStatus(null);
  }

  function reset() {
    chooseTest(null);
  }

  const hasKnownScoring =
    scoringRule === "3a" || scoringRule === "4" || scoringRule === "both";
  const lowPsg = testType === "psg" && hasKnownScoring && psgResult === "below5";
  const usesAasm1A = scoringRule === "3a" || scoringRule === "both";

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={reset} type="button">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>Sleep Study Check</strong><small>A simple report guide</small></span>
        </button>
        {testType ? (
          <button className="start-over" onClick={reset} type="button">Start over</button>
        ) : null}
      </header>

      <div className="page-shell">
        <section className="intro">
          <p className="kicker">Start with the report—not the summary</p>
          <h1>A sleep test said<br /><em>“no apnea.”</em></h1>
          <p className="lede">
            Check that the test conclusively rules out sleep breathing disorders.
          </p>
        </section>

        <QuestionCard number={1} title="Was it a home test or an in-lab sleep study?">
          <ChoiceButton
            active={testType === "hsat"}
            label="Home sleep apnea test (HSAT)"
            onClick={() => chooseTest("hsat")}
          />
          <ChoiceButton
            active={testType === "psg"}
            label="In-lab polysomnogram (PSG)"
            onClick={() => chooseTest("psg")}
          />
        </QuestionCard>

        {testType === "hsat" ? (
          <QuestionCard
            number={2}
            title="What was the AHI or REI?"
          >
            <ChoiceButton
              active={hsatResult === "atLeast5"}
              label="≥5"
              onClick={() => setHsatResult("atLeast5")}
            />
            <ChoiceButton
              active={hsatResult === "below5"}
              label="<5"
              onClick={() => setHsatResult("below5")}
            />
            <ChoiceButton
              active={hsatResult === "unknown"}
              description="I do not have the complete report."
              label="Unknown / not reported"
              onClick={() => setHsatResult("unknown")}
            />
          </QuestionCard>
        ) : null}

        {testType === "hsat" && hsatResult === "atLeast5" ? (
          <AnswerCard
            eyebrow="OSA supported"
            reply="Review treatment options with your clinician."
            sources={["diagnosticUse", "hsatUnderestimate"]}
            title="This result supports obstructive sleep apnea."
            tone="good"
          >
            <p>
              In an adult with relevant symptoms, a technically adequate HSAT with
              predominantly obstructive events supports OSA. A home test can still
              underestimate severity because it usually does not measure EEG arousals or
              true sleep time.
            </p>
          </AnswerCard>
        ) : null}

        {testType === "hsat" && hsatResult === "below5" ? (
          <AnswerCard
            eyebrow="Negative HSAT"
            reply="The home test was <5, but a negative HSAT does not reliably rule out OSA when symptoms persist. AASM recommends an attended PSG after a single negative, inconclusive, or inadequate HSAT when OSA is still suspected. A next step would be to request an attended PSG scored using the AASM recommended 1A scoring criteria."
            sources={["diagnosticNegative", "hsatUnderestimate", "aasm1a"]}
            title="This does not reliably rule out OSA."
          >
            <p>
              HSAT is mainly used in selected adults at higher risk for
              moderate-to-severe OSA. It can underestimate milder or arousal-based
              disease.
            </p>
          </AnswerCard>
        ) : null}

        {testType === "hsat" && hsatResult === "unknown" ? (
          <AnswerCard
            eyebrow="Missing result"
            reply="A next step would be to ask for the complete home sleep apnea test report, including the REI or AHI, event type, oxygen data, recording time, and whether the study was technically adequate."
            sources={["diagnosticUse"]}
            title="Get the complete report before interpreting the test."
            tone="neutral"
          >
            <p>
              Ask for the REI or AHI, whether events were obstructive or central,
              oxygen data, recording time, and whether the study was technically
              adequate.
            </p>
          </AnswerCard>
        ) : null}

        {testType === "psg" ? (
          <QuestionCard
            help="Scan the report for 3% or 4% oxygen desaturation, AASM 1A or 1B, CMS, or Medicare."
            number={2}
            title="Does your test state the scoring guidelines?"
          >
            <ChoiceButton
              active={scoringRule === "3a"}

              label="I see AHI 3%, hypopnea or arousal criteria, or recommended AASM 1A. "
              onClick={() => chooseScoring("3a")}
            />
            <ChoiceButton
              active={scoringRule === "4"}

              label="I see AHI 4%, CMS, Medicare or optional AASM 1B."
              onClick={() => chooseScoring("4")}
            />
            <ChoiceButton
              active={scoringRule === "both"}
              label="The report lists both"
              onClick={() => chooseScoring("both")}
            />
            <ChoiceButton
              active={scoringRule === "unknown"}
              label="I can’t find this"
              onClick={() => chooseScoring("unknown")}
            />
          </QuestionCard>
        ) : null}

        {testType === "psg" && scoringRule ? (
          <QuestionCard
            help={
              scoringRule === "both"
                ? "Use the AHI next to 3%, arousal, AASM 1A, or recommended."
                : undefined
            }
            number={3}
            title={
              scoringRule === "4"
                ? "What was the 4% AHI?"
                : usesAasm1A
                  ? "What was the 3% AHI?"
                  : "What was the AHI?"
            }
          >
            <ChoiceButton
              active={psgResult === "atLeast5"}
              label="≥5"
              onClick={() => choosePsgResult("atLeast5")}
            />
            <ChoiceButton
              active={psgResult === "below5"}
              label="<5"
              onClick={() => choosePsgResult("below5")}
            />
            <ChoiceButton
              active={psgResult === "unknown"}
              description="I do not have the complete scored report."
              label="Unknown / not reported"
              onClick={() => choosePsgResult("unknown")}
            />
          </QuestionCard>
        ) : null}

        {testType === "psg" && scoringRule && psgResult === "atLeast5" ? (
          <AnswerCard
            eyebrow="OSA supported"
            reply="Review treatment options with your clinician."
            sources={
              scoringRule === "4"
                ? ["osaCriteria", "aasm1a", "ethics", "scoringImpact"]
                : ["osaCriteria", "aasm1a"]
            }
            title="This result supports obstructive sleep apnea."
            tone="good"
          >
            <p>
              {scoringRule === "4" ? (
                <>
                  The result supports OSA, but an AHI calculated with the
                  <strong> AASM recommended 1A scoring criteria</strong> may show a
                  higher event burden.
                </>
              ) : usesAasm1A ? (
                <>
                  This used the <strong>AASM recommended 1A scoring criteria</strong>.
                </>
              ) : (
                <>
                  Ask which hypopnea rule was used because the reported severity can
                  change.
                </>
              )}
            </p>
          </AnswerCard>
        ) : null}

        {testType === "psg" && scoringRule && psgResult === "unknown" ? (
          <AnswerCard
            eyebrow="Missing result"
            reply="A next step would be to ask for the complete PSG report, including AHI, the hypopnea scoring criteria, RERA count or index, and a definition of RDI."
            sources={["aasm1a", "arousalRdi"]}
            title="Get the complete scored report."
            tone="neutral"
          >
            <p>
              You need the AHI, hypopnea scoring criteria, RERA count or index, and a
              definition of RDI.
            </p>
          </AnswerCard>
        ) : null}

        {testType === "psg" && scoringRule === "unknown" && psgResult === "below5" ? (
          <AnswerCard
            eyebrow="Scoring rule needed"
            reply="Ask the sleep lab or clinician whether the AHI was calculated using AASM recommended 1A (3%) or CMS/Medicare (4%) scoring."
            sources={["aasm1a", "ethics", "scoringImpact"]}
            title="Find out whether the report used the 3% or 4% rule."
          >
            <p>
              An AHI &lt;5 can mean different things depending on which hypopnea
              scoring rule was used.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg ? (
          <>
            <section className="context-note" aria-live="polite">
              <strong>
                {scoringRule === "4"
                  ? "A 4%-only AHI <5 does not rule out OSA under the AASM recommended 1A scoring criteria."
                  : usesAasm1A
                    ? "An AHI <5 using AASM recommended 1A scoring criteria did not establish OSA by AHI alone."
                    : "An AHI <5 is not enough to interpret this PSG without the scoring rule."}
              </strong>
              <span>Next, check whether RERAs were actually scored and what the RDI includes.</span>
            </section>
            <RdiQuestion value={rdiStatus} onChange={setRdiStatus} />
          </>
        ) : null}

        {lowPsg && rdiStatus === "atLeast5" ? (
          <AnswerCard
            eyebrow="RERA-inclusive OSA"
            reply="Review treatment options with your clinician."
            sources={["osaCriteria", "arousalRdi"]}
            title="A valid RDI of ≥5 supports OSA."
            tone="good"
          >
            <p>
              This applies when RDI means apneas + hypopneas + RERAs per hour of sleep.
              It is an arousal-based pattern that was historically often called UARS.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "below5Scored" && usesAasm1A ? (
          <AnswerCard
            eyebrow="OSA not demonstrated"
            reply="The PSG used the AASM recommended 1A scoring criteria, explicitly scored RERAs, and both AHI and RDI were <5. That study did not establish OSA on that night. If symptoms persist, review study quality, sleep time, REM and supine sleep, other possible causes, and whether repeat PSG or specialist review is appropriate. Esophageal pressure monitoring is an optional, more sensitive specialist technique that may identify subtle effort-related events associated with the pattern historically called UARS."
            sources={["diagnosticRepeat", "arousalRdi"]}
            title="This PSG did not establish OSA on that night."
            tone="neutral"
          >
            <p>
              Review technical quality, total sleep time, REM and supine sleep, and
              non-respiratory causes of poor sleep. If suspicion remains, a repeat PSG or
              specialist review may be appropriate. Esophageal pressure monitoring is an
              optional, more sensitive specialist technique that may identify subtle
              effort-related events associated with the pattern historically called UARS.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "below5Scored" && scoringRule === "4" ? (
          <AnswerCard
            eyebrow="AASM 1A result not reported"
            reply="If symptoms or clinical suspicion persist, ask whether an AHI using AASM recommended 1A scoring was also calculated or whether rescoring would be useful."
            sources={["aasm1a", "ethics", "scoringImpact"]}
            title="The report does not show the AHI using AASM recommended 1A scoring."
          >
            <p>
              The AHI was calculated using the 4% rule. Even though RERAs were scored and
              the RDI was &lt;5, this does not show what the AHI would be under AASM
              recommended 1A scoring. In particular, hypopneas associated with a 3%
              oxygen drop may not be included.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "blankZero" ? (
          <AnswerCard
            eyebrow="Ambiguous RERA reporting"
            reply="A blank or zero RERA field does not show by itself whether RERAs were actively scored. A next step would be to ask the lab whether RERAs were explicitly scored and whether RDI includes apneas, hypopneas, and RERAs per hour of sleep."
            sources={["arousalRdi"]}
            title="Blank or zero is not enough information."
          >
            <p>
              AHI equal to RDI can mean no RERAs were found, but it can also reflect
              rounding, a nonstandard RDI definition, or RERAs not being scored.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "unknown" ? (
          <AnswerCard
            eyebrow="Incomplete arousal-based evaluation"
            reply={
              usesAasm1A
                ? "The AHI was <5 using AASM 1A scoring, but that does not confirm that RERAs were scored or included in RDI. Ask whether RERAs were explicitly scored and whether RDI includes apneas, hypopneas, and RERAs per hour of sleep."
                : scoringRule === "4"
                  ? "With AHI <5 under 4%-only scoring and no clear RERA/RDI reporting, arousal-based obstruction was not fully evaluated. Ask whether RERAs were scored, what RDI includes, and whether the study can be rescored using the AASM recommended 1A scoring criteria."
                  : "With AHI <5 and no clear RERA/RDI reporting, arousal-based obstruction cannot be confirmed from the report. Ask which hypopnea rule was used, whether RERAs were scored, and what RDI includes."
            }
            sources={["arousalRdi", "aasm1a"]}
            title="RERA and RDI information is still needed."
          >
            <p>
              {usesAasm1A ? (
                <>AASM 1A hypopnea scoring does not guarantee that RERAs were scored. Ask whether RERAs were explicitly scored and what RDI includes.</>
              ) : (
                <>Ask whether RERAs were scored and what RDI includes.</>
              )}
              {!usesAasm1A ? (
                <> Also ask whether the study used—or can be rescored with—the AASM recommended 1A scoring criteria.</>
              ) : null}
            </p>
          </AnswerCard>
        ) : null}

        {testType === "unknown" ? (
          <AnswerCard
            eyebrow="Get the actual report"
            reply="A next step would be to ask for the complete report and first identify whether it was a home sleep apnea test or an attended in-lab PSG. If it was a PSG, also identify the hypopnea scoring criteria, AHI, RERAs, and RDI."
            sources={["diagnosticUse", "arousalRdi"]}
            title="“No apnea” is a summary, not enough information."
            tone="neutral"
          >
            <p>
              Look for <strong>HSAT, home sleep apnea test, or REI</strong> versus
              <strong> PSG, polysomnogram, or total sleep time</strong>.
            </p>
          </AnswerCard>
        ) : null}

        <aside className="assumptions">
          <strong>This short checker assumes:</strong> an adult, a technically adequate
          study, and events that are mainly obstructive. If the report says the study was
          inadequate or shows central apneas, complex medical conditions, or another sleep
          disorder, the pathway is different.
        </aside>

        <aside className="boundary">
          This is an educational tool based on American Academy of Sleep Medicine
          sleep-testing guidelines. It does not diagnose OSA or UARS.
        </aside>
      </div>

      <footer>
        <span>Adult US pathway · AASM guidance reviewed August 2026</span>
        <span>Educational prototype</span>
      </footer>
    </main>
  );
}
