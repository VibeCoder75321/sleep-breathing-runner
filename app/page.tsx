"use client";

import { useState } from "react";

type TestType = "hsat" | "psg" | "unknown" | null;
type SymptomStatus = "yes" | "no" | "notTested" | null;
type ScoringRule = "3a" | "4" | "both" | "unknown" | null;
type ResultBand = "atLeast5" | "below5" | "unknown" | null;
type ReraFinding = "positive" | "zeroBlank" | "missing" | null;
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
      <summary>American Academy of Sleep Medicine sources &amp; supporting studies</summary>
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
          <h3>What to do next</h3>
          <p>{reply}</p>
        </div>
        <div className="answer-actions">
          <SourceLinks sources={sources} />
        </div>
      </div>
    </section>
  );
}

function ReraQuestion({
  value,
  onChange,
}: {
  value: ReraFinding;
  onChange: (value: ReraFinding) => void;
}) {
  return (
    <QuestionCard
      help="RERA means respiratory effort-related arousal—a period of restricted breathing that briefly disturbs sleep. Look in the respiratory-events table. Do not use the RDI number for this question."
      number={5}
      title="What do you see next to “RERA” on the report?"
    >
      <ChoiceButton
        active={value === "positive"}
        label="A number greater than 0"
        onClick={() => onChange("positive")}
      />
      <ChoiceButton
        active={value === "zeroBlank"}
        label="0 or a blank space"
        onClick={() => onChange("zeroBlank")}
      />
      <ChoiceButton
        active={value === "missing"}
        label="I can’t find “RERA”"
        onClick={() => onChange("missing")}
      />
    </QuestionCard>
  );
}

function RdiQuestion({
  value,
  onChange,
}: {
  value: ResultBand;
  onChange: (value: ResultBand) => void;
}) {
  return (
    <QuestionCard
      help="This may be a broader events-per-hour number that includes RERAs."
      number={6}
      title="Now find the respiratory disturbance index (RDI). What number is shown?"
    >
      <ChoiceButton
        active={value === "atLeast5"}
        label="≥5"
        onClick={() => onChange("atLeast5")}
      />
      <ChoiceButton
        active={value === "below5"}
        label="<5"
        onClick={() => onChange("below5")}
      />
      <ChoiceButton
        active={value === "unknown"}
        label="Not listed / I can’t find it"
        onClick={() => onChange("unknown")}
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
  const [reraFinding, setReraFinding] = useState<ReraFinding>(null);
  const [rdiResult, setRdiResult] = useState<ResultBand>(null);

  function chooseTest(value: TestType) {
    setTestType(value);
    setScoringRule(null);
    setHsatResult(null);
    setPsgResult(null);
    setReraFinding(null);
    setRdiResult(null);
  }

  function chooseSymptoms(value: SymptomStatus) {
    setSymptomStatus(value);
    chooseTest(null);
  }

  function chooseScoring(value: ScoringRule) {
    setScoringRule(value);
    setPsgResult(null);
    setReraFinding(null);
    setRdiResult(null);
  }

  function choosePsgResult(value: ResultBand) {
    setPsgResult(value);
    setReraFinding(null);
    setRdiResult(null);
  }

  function chooseReraFinding(value: ReraFinding) {
    setReraFinding(value);
    setRdiResult(null);
  }

  function reset() {
    setSymptomStatus(null);
    chooseTest(null);
  }

  const hasKnownScoring =
    scoringRule === "3a" || scoringRule === "4" || scoringRule === "both";
  const lowPsg = testType === "psg" && hasKnownScoring && psgResult === "below5";
  const usesAasm1A = scoringRule === "3a" || scoringRule === "both";
  const reraFindingIsUnclear =
    reraFinding === "zeroBlank" || reraFinding === "missing";

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
          <h1>My sleep study said<br /><em>“no apnea.”</em></h1>
          <p className="lede">
            A “normal” sleep study does not always answer the whole question. This
            two-minute checker helps you understand what your test measured, whether
            important breathing events may have been missed, and what to ask your
            clinician next.
          </p>
          <p className="intro-note">
            Have your full report nearby. You do not need to understand the medical
            terms—we’ll show you exactly what words and numbers to find.
          </p>
          <p className="intro-trust">
            Based on guidance from the American Academy of Sleep Medicine (AASM).
            This tool does not diagnose a sleep disorder.
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
          <ChoiceButton
            active={symptomStatus === "notTested"}
            label="I haven’t done my sleep study yet"
            onClick={() => chooseSymptoms("notTested")}
          />
        </QuestionCard>

        {symptomStatus === "notTested" ? (
          <AnswerCard
            eyebrow="Before your sleep study"
            reply="Ask your doctor to explicitly order an in-lab sleep study (polysomnography, or PSG) using AASM recommended 1A scoring (3% oxygen drop OR arousal), with respiratory effort-related arousals (RERAs) scored and the respiratory disturbance index (RDI) reported."
            sources={["ethics"]}
            title="Ask your doctor to explicitly order an in-lab sleep study."
            tone="neutral"
          >
            <p>
              The scoring rule can change which breathing events are counted, so the
              requested method should be written into the order rather than assumed.
            </p>
          </AnswerCard>
        ) : null}

        {symptomStatus === "no" ? (
          <section className="context-note" aria-live="polite">
            <strong>No important symptoms remain.</strong>
            <span>
              You can still review the report; follow-up testing depends on the report
              and clinical context.
            </span>
          </section>
        ) : null}

        {symptomStatus === "yes" || symptomStatus === "no" ? (
          <QuestionCard number={2} title="Was it a home test or an in-lab sleep study?">
            <ChoiceButton
              active={testType === "hsat"}
              label="Home sleep apnea test (HSAT)"
              description="Usually worn at home; it measures less than an in-lab study."
              onClick={() => chooseTest("hsat")}
            />
            <ChoiceButton
              active={testType === "psg"}
              label="In-lab sleep study — polysomnography (PSG)"
              description="Measures sleep stages and whether breathing problems disturb your sleep."
              onClick={() => chooseTest("psg")}
            />
          </QuestionCard>
        ) : null}

        {testType === "hsat" ? (
          <QuestionCard
            help="These are averages of breathing events per hour. Home reports often use REI."
            number={3}
            title="What was the apnea-hypopnea index (AHI) or respiratory event index (REI)?"
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
            eyebrow="Obstructive sleep apnea supported"
            reply="Review treatment options with your clinician."
            sources={["diagnosticUse", "hsatUnderestimate"]}
            title="This result supports obstructive sleep apnea."
            tone="good"
          >
            <p>
              A home test can still underestimate severity because it usually does not
              measure brain-wave activity or true sleep time.
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
            help="AHI means apnea-hypopnea index—the average number of breathing pauses or reductions in airflow counted per hour of sleep. Scan the report for 3% or 4% oxygen desaturation, AASM 1A or 1B, CMS, or Medicare."
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
              description="CMS means Centers for Medicare & Medicaid Services."
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
            eyebrow="Obstructive sleep apnea supported"
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
            <ReraQuestion value={reraFinding} onChange={chooseReraFinding} />
            {reraFinding === "positive" ? (
              <RdiQuestion value={rdiResult} onChange={setRdiResult} />
            ) : null}
          </>
        ) : null}

        {lowPsg && reraFinding === "positive" && rdiResult === "atLeast5" ? (
          <AnswerCard
            eyebrow="RERA-inclusive obstructive sleep apnea"
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

        {lowPsg && reraFinding === "positive" && rdiResult === "unknown" ? (
          <AnswerCard
            eyebrow="RDI needed"
            reply="Ask for the complete PSG report or ask the sleep lab what RDI was reported and whether it includes apneas, hypopneas, and RERAs per hour of sleep."
            sources={["arousalRdi"]}
            title="Find the RDI before interpreting this result."
            tone="neutral"
          >
            <p>
              A RERA number greater than 0 shows that at least one RERA was reported,
              but the RDI is needed to see the combined rate of apneas, hypopneas, and
              RERAs.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && reraFinding === "positive" && rdiResult === "below5" && usesAasm1A ? (
          <AnswerCard
            eyebrow="AASM 1A — AHI/RDI <5 — RERAs were scored"
            reply="Ask your sleep physician whether the study showed ongoing restricted or flow-limited breathing that did not get counted as an event, and whether another cause of your symptoms needs evaluation. If your physician still strongly suspects OSA despite the negative study, AASM says a second in-lab sleep study may be considered. If another study is ordered, ask the clinician to specifically request AASM 1A scoring (3% oxygen drop OR arousal), plus RERA and RDI reporting."
            sources={[
              "aasm1a",
              "arousalRdi",
              "diagnosticRepeat",
              "respiratoryLegMovements",
            ]}
            title="This sleep study did not meet the usual criteria for OSA, even after including breathing events that can disrupt sleep without a large oxygen drop."
            tone="neutral"
          >
            <p>
              A RERA (respiratory effort-related arousal) is restricted breathing that
              causes an arousal but does not qualify as an apnea or hypopnea. Your study
              included these events.
            </p>
            <p>
              That does not mean persistent symptoms should be dismissed. A single night
              of testing may not always explain ongoing sleepiness, fatigue, unrefreshing
              sleep, insomnia, or other symptoms.
            </p>
            <p>
              If your report also shows many “spontaneous” arousals or PLMs (periodic limb
              movements—repetitive leg movements during sleep), ask whether those findings
              could help explain your disrupted sleep or if they could be related to
              flow-limited breathing. They do not prove that breathing events were missed,
              but they may deserve closer review.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && reraFinding === "positive" && rdiResult === "below5" && scoringRule === "4" ? (
          <AnswerCard
            eyebrow="AASM 1B / 4% — AHI/RDI <5 — RERAs were scored"
            reply="Ask whether your existing sleep study can be rescored using AASM 1A criteria and whether a separate 1A AHI can be reported. If that is not possible, or the result remains negative despite strong clinical suspicion, AASM says a second in-lab sleep study may be considered. For a repeat study, ask the ordering clinician to specifically request AASM 1A scoring (3% oxygen drop OR arousal), plus RERA and RDI reporting."
            sources={[
              "aasm1a",
              "arousalRdi",
              "diagnosticRepeat",
              "ethics",
              "scoringImpact",
              "respiratoryLegMovements",
            ]}
            title="This result does not rule out OSA, based on the current AASM-recommended 1A hypopnea or arousal scoring rule."
          >
            <p>
              Your study used the 4% rule, which can miss breathing events that cause a
              smaller oxygen drop or disrupt sleep through an arousal. AASM currently
              recommends the broader 1A rule: 3% oxygen drop OR arousal.
            </p>
            <p>
              Your study did include RERAs (respiratory effort-related
              arousals)—restricted breathing that causes an arousal without meeting apnea
              or hypopnea criteria. That adds useful information, but a 4%-based RDI is
              not the same as having your AHI calculated using AASM 1A.
            </p>
            <p>
              If your report also shows many “spontaneous” arousals or PLMs (periodic limb
              movements—repetitive leg movements during sleep), those findings do not
              prove that breathing events were missed, but persistent unexplained sleep
              disruption may justify a closer review.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && reraFindingIsUnclear && usesAasm1A ? (
          <AnswerCard
            eyebrow="AASM 1A AHI below 5 — RERA scoring unclear"
            reply="Ask: “Were RERAs actively scored, and does my respiratory disturbance index (RDI) include them?” Also ask whether the study showed ongoing flow-limited breathing—narrowed airflow that did not get counted as an event. If RERAs were not scored and your symptoms remain unexplained, ask whether the existing study can be reviewed or whether another in-lab sleep study is appropriate. If another study is ordered, ask for AASM 1A scoring with RERA and RDI reporting."
            sources={[
              "aasm1a",
              "arousalRdi",
              "reraScoring",
              "diagnosticRepeat",
            ]}
            title="The recommended AHI rule was used, but the report does not show whether subtler breathing events were also counted."
          >
            <p>
              Your apnea-hypopnea index (AHI) was calculated using the American Academy
              of Sleep Medicine’s recommended 1A rule. This counts hypopneas when they
              cause either a 3% oxygen drop or a brief arousal from sleep.
            </p>
            <p>
              Respiratory effort-related arousals (RERAs) are a separate type of
              restricted breathing that disturbs sleep but does not qualify as an apnea
              or hypopnea. Using AASM 1A does not automatically mean RERAs were scored.
            </p>
            <p>
              A zero, blank, or missing RERA result could mean that none were found—or
              that the lab did not score them.
            </p>
          </AnswerCard>
        ) : null}

        {lowPsg && reraFindingIsUnclear && scoringRule === "4" ? (
          <AnswerCard
            eyebrow="4% AHI below 5 — RERA scoring unclear"
            reply="Ask: “Can my existing study be rescored using AASM 1A criteria, and were RERAs actually scored?” If an RDI is listed, also ask what events it includes. If the study cannot be rescored and your symptoms continue, ask whether another in-lab sleep study is appropriate."
            sources={[
              "aasm1a",
              "arousalRdi",
              "reraScoring",
              "diagnosticRepeat",
              "ethics",
              "scoringImpact",
            ]}
            title="This result does not conclusively rule out obstructive sleep apnea."
          >
            <p>
              Your apnea-hypopnea index (AHI) was calculated using the 4% rule. This
              method can leave out breathing events that would count under the American
              Academy of Sleep Medicine’s recommended 1A rule because they caused a
              smaller oxygen drop or briefly disturbed your sleep.
            </p>
            <p>
              The report also does not clearly show whether respiratory effort-related
              arousals (RERAs)—restricted breathing that disturbs sleep—were actually
              counted.
            </p>
            <p>
              A zero, blank, or missing RERA result could mean that none were found—or
              that the lab did not score them.
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
          sleep-testing guidelines. It does not diagnose obstructive sleep apnea (OSA)
          or upper airway resistance syndrome (UARS).
        </aside>
      </div>

      <footer>
        <span>Adult US pathway · AASM guidance reviewed August 2026</span>
        <span>Educational prototype</span>
      </footer>
    </main>
  );
}
