"use client";

import { useState } from "react";

type TestType = "hsat" | "psg" | "unknown" | null;
type SymptomStatus = "yes" | "no" | null;
type ScoringRule = "3a" | "4" | "both" | "unknown" | null;
type ResultBand = "atLeast5" | "below5" | "unknown" | null;
type RdiStatus = "atLeast5" | "below5Scored" | "blankZero" | null;
type SourceKey =
  | "diagnosticUse"
  | "diagnosticNegative"
  | "diagnosticRepeat"
  | "osaCriteria"
  | "arousalRdi"
  | "aasm1a"
  | "ethics"
  | "hsatUnderestimate"
  | "scoringImpact"
  | "reraScoring"
  | "respiratoryLegMovements";

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
      "We recommend that if a single home sleep apnea test is negative, inconclusive, or technically inadequate, polysomnography be performed for the diagnosis of OSA.",
    relevance:
      "Recommendation 3 is rated STRONG and directly supports moving to an attended PSG rather than repeating the HSAT.",
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
  reraScoring: {
    href: "https://aasm.org/wp-content/uploads/2017/11/Summary-of-Updates-in-v2.0-FINAL.pdf",
    title: "AASM Scoring Manual: Summary of Updates in Version 2.0",
    publication: "AASM scoring manual update",
    year: "2012",
    excerpt:
      "Electing to score respiratory effort-related arousals is still OPTIONAL.",
    relevance:
      "Explains why a blank or zero RERA field does not, by itself, confirm that the scorer actively evaluated RERAs.",
  },
  respiratoryLegMovements: {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4288611/",
    title: "An Evidence-Based Recommendation for a New Definition of Respiratory-Related Leg Movements",
    publication: "Peer-reviewed sleep study",
    year: "2015",
    excerpt:
      "Current sleep scoring rules exclude leg movements that occur near respiratory events from being scored as periodic leg movements during sleep.",
    relevance:
      "Shows that respiratory events can be associated with leg movements and that the rule used to separate them can materially change the reported PLM index.",
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
  children?: React.ReactNode;
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
      number={5}
      title="What does the report say about RDI and RERAs?"
    >
      <ChoiceButton
        active={value === "atLeast5"}
        label="RDI is ≥5"
        onClick={() => onChange("atLeast5")}
      />
      <ChoiceButton
        active={value === "below5Scored"}
        label="RDI <5 and RERAs were scored"
        onClick={() => onChange("below5Scored")}
      />
      <ChoiceButton
        active={value === "blankZero"}
        label="RDI <5 and RERAs are 0, blank, or not reported"
        onClick={() => onChange("blankZero")}
      />
    </QuestionCard>
  );
}

export default function Home() {
  const [symptomStatus, setSymptomStatus] = useState<SymptomStatus>(null);
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

  function chooseSymptoms(value: SymptomStatus) {
    setSymptomStatus(value);
    chooseTest(null);
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
    setSymptomStatus(null);
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
        {symptomStatus ? (
          <button className="start-over" onClick={reset} type="button">Start over</button>
        ) : null}
      </header>

      <div className="page-shell">
        <section className="intro">
          <p className="kicker">Patient Advocacy Tool</p>
          <h1>A sleep test said<br /><em>“no apnea.”</em></h1>
          <p className="lede">
            Check that the test conclusively rules out sleep breathing disorders.
          </p>
        </section>

        <QuestionCard
          help="Examples include unrefreshing sleep, daytime sleepiness, fatigue, insomnia, waking with gasping or choking, loud snoring, or witnessed breathing pauses."
          number={1}
          title="Are symptoms still affecting you despite the sleep test?"
        >
          <ChoiceButton
            active={symptomStatus === "yes"}
            label="Yes — symptoms are still present"
            onClick={() => chooseSymptoms("yes")}
          />
          <ChoiceButton
            active={symptomStatus === "no"}
            label="No"
            onClick={() => chooseSymptoms("no")}
          />
        </QuestionCard>

        {symptomStatus ? (
          <section className="context-note" aria-live="polite">
            <strong>
              {symptomStatus === "yes"
                ? "Persistent symptoms are important, but they do not identify the cause by themselves."
                : "No important symptoms remain."}
            </strong>
            <span>
              {symptomStatus === "yes"
                ? "Next, check what the sleep test actually measured."
                : "You can still review the report; follow-up testing depends on the report and clinical context."}
            </span>
          </section>
        ) : null}

        {symptomStatus ? (
          <QuestionCard number={2} title="Was it a home test or an in-lab sleep study?">
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
        ) : null}

        {testType === "hsat" ? (
          <QuestionCard
            number={3}
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
              A home test can still underestimate severity because it usually does not
              measure EEG arousals or true sleep time.
            </p>
          </AnswerCard>
        ) : null}

        {testType === "hsat" && hsatResult === "below5" ? (
          <AnswerCard
            eyebrow="Strong AASM recommendation"
            reply="Ask the ordering clinician for an attended PSG rather than another HSAT. Ask whether the PSG can report the AHI using AASM recommended 1A scoring criteria."
            sources={["diagnosticNegative", "hsatUnderestimate", "aasm1a"]}
            title="An attended PSG should be performed."
          >
            <p>
              A negative HSAT does not reliably rule out OSA. After a single negative,
              inconclusive, or technically inadequate HSAT, repeating the HSAT is
              generally not recommended because PSG is more sensitive.
            </p>
            <blockquote className="guideline-quote">
              <p>
                “We recommend that if a single home sleep apnea test is negative,
                inconclusive, or technically inadequate, polysomnography be performed
                for the diagnosis of OSA.”
              </p>
              <cite>AASM Clinical Practice Guideline, Recommendation 3 (STRONG)</cite>
            </blockquote>
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
            number={3}
            title="Does your test state the scoring guidelines?"
          >
            <ChoiceButton
              active={scoringRule === "3a"}
              label="I see AHI 3% or recommended AASM 1A."
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
            number={4}
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
            eyebrow="AASM 1A · AHI and RDI <5 · RERAs scored"
            reply="Because symptoms are still present, discuss the result with the sleep physician. Ask whether the raw study showed persistent inspiratory flow limitation, whether unexplained arousals or leg movements appeared related to breathing, and whether another cause of the symptoms should be evaluated. If clinical suspicion for OSA remains, discuss whether a second in-lab PSG should be considered. If another PSG is ordered, ask for AASM 1A hypopnea scoring and for RERAs and RDI to be scored and reported; confirm the request with the sleep lab."
            sources={[
              "aasm1a",
              "arousalRdi",
              "diagnosticRepeat",
              "respiratoryLegMovements",
            ]}
            title="This result is below the usual OSA threshold."
            tone="neutral"
          >
            <p>
              The study used the current AASM recommended 1A scoring rule and both the
              AHI and RDI remained &lt;5. The 1A rule counts qualifying hypopneas when
              reduced airflow causes either a 3% oxygen drop or an arousal from sleep.
            </p>
            <p>
              A RERA is a period of restricted airflow or increasing breathing effort
              that ends in an arousal but does not meet apnea or hypopnea criteria.
              Because RERAs were scored, the RDI adds information about breathing
              disturbances beyond the AHI alone.
            </p>
            <p>
              Unexplained or “spontaneous” arousals do not prove that respiratory events
              were missed. Periodic limb movements can be a separate source of sleep
              disruption, although respiratory events can also trigger nearby leg
              movements and the scoring rule used to separate them can change the
              reported PLM index.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "below5Scored" && scoringRule === "4" ? (
          <AnswerCard
            eyebrow="AASM 1B / 4% · AHI and RDI <5 · RERAs scored"
            reply="Ask whether the existing PSG can be rescored using AASM recommended 1A criteria or whether a separate 1A AHI can be calculated from the recording. If the study remains negative and clinical suspicion for OSA remains, discuss whether a second in-lab PSG should be considered. If another PSG is ordered, ask for AASM 1A hypopnea scoring and for RERAs and RDI to be scored and reported; confirm the request with the sleep lab."
            sources={[
              "aasm1a",
              "arousalRdi",
              "diagnosticRepeat",
              "ethics",
              "scoringImpact",
              "respiratoryLegMovements",
            ]}
            title="This result does not rule out OSA using AASM 1A scoring."
          >
            <p>
              This study used the 4% rule, which requires a qualifying reduction in
              airflow to cause at least a 4% oxygen drop before it is counted as a
              hypopnea. AASM recommended 1A scoring can also count qualifying events
              associated with a 3% oxygen drop or an arousal from sleep.
            </p>
            <p>
              RERAs were scored, which adds useful information to the RDI. A RERA is a
              period of restricted airflow or increasing breathing effort that ends in
              an arousal but does not meet apnea or hypopnea criteria.
            </p>
            <p>
              A 4%-based RDI that includes RERAs is not necessarily the same result as an
              AHI calculated with AASM 1A. For example, a qualifying hypopnea associated
              with a 3% oxygen drop but no arousal can count under 1A but would not meet
              the 4% rule or qualify as a RERA.
            </p>
            <p>
              Unexplained or “spontaneous” arousals do not prove that RERAs were missed.
              Periodic limb movements can occur independently of breathing disturbances,
              but respiratory events can also trigger nearby leg movements and different
              scoring rules can change the reported PLM index.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "blankZero" && usesAasm1A ? (
          <AnswerCard
            eyebrow="AASM 1A · AHI/RDI <5 · RERAs 0 or not reported"
            reply="Ask whether RERAs were actually scored, what events were included in the reported RDI, and whether the raw study showed persistent inspiratory flow limitation. If the PSG remains negative but clinical suspicion for OSA remains, discuss whether a second in-lab PSG should be considered. If another PSG is ordered, ask for AASM 1A hypopnea scoring and for RERAs and RDI to be scored and reported; confirm the request with the sleep lab."
            sources={[
              "aasm1a",
              "arousalRdi",
              "reraScoring",
              "diagnosticRepeat",
              "respiratoryLegMovements",
            ]}
            title="The report does not clearly show whether RERAs were evaluated."
          >
            <p>
              The result is below the usual OSA threshold using AASM recommended 1A
              scoring, but the report does not clearly show whether RERAs were evaluated
              and included in the RDI. The 1A rule already captures many breathing
              disturbances that disrupt sleep because a qualifying hypopnea can be
              counted with either a 3% oxygen drop or an arousal.
            </p>
            <p>
              A RERA is a period of restricted airflow or increasing breathing effort
              that ends in an arousal but does not meet apnea or hypopnea criteria. These
              events can be added to apneas and hypopneas when calculating the RDI.
            </p>
            <p>
              A RERA value of 0 or a blank field does not reveal whether the laboratory
              carefully evaluated RERAs and found none or did not score them. AASM
              scoring materials describe RERA scoring as optional, so the report should
              be checked before assuming that 0 means none were found.
            </p>
            <p>
              Unexplained or “spontaneous” arousals do not establish that respiratory
              events were missed. Periodic limb movements may be a separate source of
              sleep disruption, although respiratory events can also trigger nearby leg
              movements and the scoring rule used can affect the reported PLM index.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && rdiStatus === "blankZero" && scoringRule === "4" ? (
          <AnswerCard
            eyebrow="AASM 1B / 4% · AHI/RDI <5 · RERAs 0 or not reported"
            reply="First ask whether RERAs were actually scored and what the reported RDI includes. Then ask whether the existing PSG can be rescored using AASM recommended 1A criteria, with a separate 1A AHI reported. If the PSG remains negative but clinical suspicion for OSA persists, discuss whether a second in-lab PSG should be considered. If another PSG is ordered, ask for AASM 1A hypopnea scoring and for RERAs and RDI to be scored and reported; confirm the request with the sleep lab."
            sources={[
              "aasm1a",
              "arousalRdi",
              "reraScoring",
              "diagnosticRepeat",
              "ethics",
              "scoringImpact",
              "respiratoryLegMovements",
            ]}
            title="This result does not rule out OSA using AASM 1A scoring."
          >
            <p>
              The study used the 4% hypopnea rule, and the report does not clearly show
              whether RERAs were evaluated. AASM recommended 1A scoring can count
              qualifying events associated with a 3% oxygen drop or an arousal, while
              the 4% rule requires at least a 4% oxygen drop.
            </p>
            <p>
              A RERA is a period of restricted airflow or increasing breathing effort
              that ends in an arousal but does not meet apnea or hypopnea criteria. RERAs
              can be added to apneas and hypopneas when calculating the RDI.
            </p>
            <p>
              A RERA value of 0 or a blank field does not reveal whether the laboratory
              carefully evaluated RERAs and found none or did not score them. This matters
              especially under the 4% rule because respiratory events that cause an
              arousal without a 4% oxygen drop will not qualify as 4% hypopneas.
            </p>
            <p>
              Unexplained or “spontaneous” arousals do not prove that respiratory events
              were missed. Periodic limb movements may be a separate source of sleep
              disruption, although respiratory events can also trigger nearby leg
              movements and different scoring rules can substantially affect the
              reported PLM count.
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
