const OUTPUT_PRIORITY = {
  O001: 0,
  O013: 1,
  O010: 2,
  O002: 3,
  O003: 4,
  O005: 4,
  O006: 4,
  O009: 4,
  O011: 4,
  O004: 5,
  O007: 5,
  O008: 5,
  O012: 7,
  O014: 9,
};

const GENERIC_FORBIDDEN_PATTERNS = [
  /you (?:definitely )?have (?:OSA|UARS)/i,
  /diagnos(?:e|ed|is) (?:you with|as) (?:OSA|UARS)/i,
  /set (?:your )?(?:CPAP|PAP)?\s*pressure to \d/i,
  /increase (?:your )?(?:CPAP|PAP)?\s*pressure/i,
  /coverage (?:is|will be) (?:guaranteed|denied)/i,
  /the (?:HSAT|home test) (?:was|is) false/i,
  /(?:dead space|EERS).{0,30}\b\d+\s*(?:mm|cm|mL)\b/i,
];

export const DEFAULT_SCENARIO = {
  id: "guided-case",
  drivingRisk: "no",
  safetyAcknowledged: false,
  ageBand: "adult",
  country: "US",
  symptoms: {
    sleepiness: false,
    fatigue: false,
    nonrestorative: false,
    insomnia: false,
    headache: false,
    cognitive: false,
  },
  primaryGoal: "unknown",
  reportAvailable: false,
  hsat: {
    studyType: "Type III HSAT",
    metricCode: "REI",
    value: null,
    hypopneaRule: "unknown",
    denominator: "unknown",
    technicalAdequacy: "unknown",
    wakeInclusionPlausible: "unknown",
    nightsRecorded: 1,
    testFit: "appropriate",
    comorbidities: [],
  },
  psg: {
    studyType: "PSG",
    hypopneaRule: "unknown",
    ahi3a: null,
    ahi4: null,
    clinicalAhi: null,
    sameStudy: true,
    rdi: null,
    reraIndex: null,
    reraScored: "unknown",
    rdiFormula: "unknown",
    iflPercent: null,
    narrativeIfl: "unknown",
    signalContext: "unknown",
    representativeness: "unknown",
    persistentSuspicion: true,
  },
  pap: {
    interventionRequest: "review_symptoms",
    usageHours: null,
    sleepHours: null,
    allSleepPeriodsCovered: "unknown",
    leakState: "unknown",
    ahiFlow: null,
    centralSignal: "unknown_nonconcerning",
    waveformState: "unavailable",
    flowLimitationFlag: "unknown",
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withDefaults(overrides) {
  const base = clone(DEFAULT_SCENARIO);
  return {
    ...base,
    ...overrides,
    symptoms: { ...base.symptoms, ...(overrides.symptoms || {}) },
    hsat: { ...base.hsat, ...(overrides.hsat || {}) },
    psg: { ...base.psg, ...(overrides.psg || {}) },
    pap: { ...base.pap, ...(overrides.pap || {}) },
  };
}

function hasPersistentSymptoms(scenario) {
  return Object.values(scenario.symptoms || {}).some(Boolean);
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function addOutput(result, outputId, details = []) {
  addUnique(result.outputIds, outputId);
  if (details.length) {
    result.detailsByOutput[outputId] = [
      ...(result.detailsByOutput[outputId] || []),
      ...details,
    ];
  }
}

function addUnknown(result, value) {
  addUnique(result.unknownStates, value);
}

function addSupported(result, value) {
  addUnique(result.supportedStates, value);
}

function addQuestion(result, value) {
  addUnique(result.questions, value);
}

function finish(result, scenario) {
  const symptomsPersist = hasPersistentSymptoms(scenario);
  if (symptomsPersist && scenario.ageBand !== "under_18") {
    addOutput(result, "O012");
    addQuestion(
      result,
      "What respiratory and non-respiratory causes should be evaluated in parallel?",
    );
  }

  addOutput(result, "O014");
  result.outputIds.sort(
    (a, b) => (OUTPUT_PRIORITY[a] ?? 99) - (OUTPUT_PRIORITY[b] ?? 99),
  );
  result.claimIds = [];
  return result;
}

function evaluateHsat(scenario, result) {
  const h = scenario.hsat;
  result.route.push("H100");

  const missingIdentity = [];
  if (!h.studyType) missingIdentity.push("study type");
  if (!h.metricCode) missingIdentity.push("metric name");
  if (missingIdentity.length) {
    result.route.push("H111");
    missingIdentity.forEach((field) => addUnknown(result, field));
    addOutput(result, "O002", [`Missing: ${missingIdentity.join(", ")}.`]);
  }

  result.route.push("H101", "H102");
  const numericValue = isNumber(h.value) ? h.value : null;
  let hsatResultState = "unknown";
  if (numericValue !== null) {
    hsatResultState =
      numericValue < 5
        ? "negative"
        : numericValue < 15
          ? "mild"
          : "moderate_severe";
    addSupported(
      result,
      `${h.metricCode || "Home-test index"} ${numericValue.toFixed(1)} (${h.hypopneaRule === "4" ? "4% rule" : h.hypopneaRule === "3a" ? "AASM recommended 1A scoring criteria" : "rule not reported"}).`,
    );
  } else {
    addUnknown(result, "reported HSAT index value");
  }

  if (h.technicalAdequacy === "inadequate" || h.technicalAdequacy === "inconclusive") {
    result.route.push("H106", "H112");
    addSupported(result, `Technical adequacy: ${h.technicalAdequacy}.`);
    addOutput(result, "O003", [
      `The report was marked ${h.technicalAdequacy}.`,
      ...(h.comorbidities || []).map((item) => `PSG-preferred context reported: ${item}.`),
    ]);
    addQuestion(result, "Would an attended PSG be the appropriate next diagnostic test?");
    return;
  }

  result.route.push("H103");
  const dilutionPlausible =
    ["monitoring_time", "recording_time"].includes(h.denominator) &&
    h.wakeInclusionPlausible !== false &&
    h.wakeInclusionPlausible !== "no";

  if (dilutionPlausible) {
    result.route.push("H108");
    addSupported(result, "The index used monitoring/recording time that may include wake.");
    addOutput(result, "O004", ["Monitoring-time denominator may dilute a sleep-hour event rate."]);
    if (!isNumber(h.nightsRecorded) || h.nightsRecorded <= 1) {
      result.route.push("H109");
      addSupported(result, "The result represents a single recorded night.");
    }
  }

  result.route.push("H104");
  const psgPreferredContext =
    (h.comorbidities || []).length > 0 || h.testFit === "unknown";

  if (psgPreferredContext) {
    result.route.push("H106", "H112");
    addOutput(result, "O003", [
      ...(h.comorbidities || []).map((item) => `PSG-preferred context reported: ${item}.`),
    ]);
    addQuestion(result, "Does this clinical context favor PSG over another HSAT?");
    return;
  }

  if (hsatResultState === "moderate_severe" && h.testFit === "appropriate") {
    result.route.push("H110", "H112");
    addSupported(result, "The HSAT result supports clinician follow-up in its intended-use setting.");
    addQuestion(result, "How does the clinician interpret this positive result in context?");
    return;
  }

  result.route.push("H105");
  if (hasPersistentSymptoms(scenario) || h.persistentSuspicion !== false) {
    result.route.push("H107", "H106", "H112");
    addSupported(result, "Most HSATs cannot directly score EEG arousals or RERAs.");
    addOutput(result, "O004", ["Arousal-based respiratory events were not directly evaluated."]);
    addOutput(result, "O003");
    addQuestion(result, "With continuing clinical suspicion, should an attended PSG be discussed?");
  } else {
    result.route.push("H112");
  }
}

function evaluatePsg(scenario, result) {
  const p = scenario.psg;
  result.route.push("P200", "P201");

  const hasMetric =
    isNumber(p.ahi3a) || isNumber(p.ahi4) || isNumber(p.clinicalAhi) || isNumber(p.rdi);
  const dualScores = isNumber(p.ahi3a) && isNumber(p.ahi4);
  if (!hasMetric) {
    result.route.push("P202");
    addUnknown(result, "respiratory metric");
    addOutput(result, "O002", ["Missing: a PSG respiratory metric."]);
  } else if (p.hypopneaRule === "unknown" && !dualScores) {
    result.route.push("P202");
    addUnknown(result, "hypopnea scoring rule");
    addOutput(result, "O002", ["Missing: the PSG hypopnea scoring rule."]);
  }

  result.route.push("P203");
  if (dualScores && p.sameStudy) {
    result.route.push("P204");
    addSupported(
      result,
      `Same-study AHI-3A ${p.ahi3a.toFixed(1)} and AHI-4% ${p.ahi4.toFixed(1)}.`,
    );
    if (p.ahi3a >= 5 && p.ahi4 < 5) {
      result.route.push("P205");
      addOutput(result, "O005", [
        scenario.country === "US"
          ? "Clinical scoring and payer scoring may not use the same threshold."
          : "Clinical and payer scoring rules can differ by jurisdiction.",
      ]);
      addQuestion(result, "Which AHI definition drove the clinical interpretation and payer submission?");
    }
  } else if (dualScores && !p.sameStudy) {
    addUnknown(result, "whether the two AHI values share the same night and denominator");
  }

  result.route.push("P206");
  const clinicalAhi = isNumber(p.ahi3a)
    ? p.ahi3a
    : isNumber(p.clinicalAhi)
      ? p.clinicalAhi
      : p.hypopneaRule === "4" && isNumber(p.ahi4)
        ? p.ahi4
        : null;

  if (clinicalAhi !== null) {
    addSupported(result, `Clinical AHI available: ${clinicalAhi.toFixed(1)}.`);
  } else {
    addUnknown(result, "arousal-inclusive clinical AHI");
  }

  if (clinicalAhi !== null && clinicalAhi >= 5) {
    result.route.push("P214");
  } else {
    result.route.push("P207");
    const reraDataAvailable =
      p.reraScored === "yes" && (isNumber(p.rdi) || isNumber(p.reraIndex));

    if (reraDataAvailable) {
      result.route.push("P208");
      const verifiedFormula = p.rdiFormula === "AHI_plus_RERAs_per_TST";
      const meetsEventCriteria =
        verifiedFormula &&
        isNumber(p.rdi) &&
        (p.rdi >= 15 || (p.rdi >= 5 && hasPersistentSymptoms(scenario)));

      if (meetsEventCriteria) {
        result.route.push("P209");
        addSupported(
          result,
          `RDI ${p.rdi.toFixed(1)} uses apneas + hypopneas + RERAs per total sleep time.`,
        );
        addOutput(result, "O006");
        addQuestion(result, "How does the interpreting clinician apply the verified RDI formula?");
        result.route.push("P214");
      } else if (verifiedFormula) {
        result.route.push("P211");
        if (isNumber(p.reraIndex)) {
          addSupported(result, `RERA index reported: ${p.reraIndex.toFixed(1)}.`);
        }
      } else {
        result.route.push("P210", "P211");
        addUnknown(result, "RDI formula");
        addOutput(result, "O007");
        addQuestion(result, "How did this laboratory calculate RDI?");
      }
    } else {
      result.route.push("P210", "P211");
      addUnknown(
        result,
        p.reraScored === "no" ? "RERA burden (not scored)" : "RERA burden",
      );
      addOutput(result, "O007");
      addQuestion(result, "Were RERAs scored, and what exactly is included in RDI?");
    }

    const iflPresent = isNumber(p.iflPercent) || p.narrativeIfl === "present";
    if (iflPresent) {
      if (result.route.at(-1) !== "P211") result.route.push("P211");
      result.route.push("P212", "P213");
      const detail = isNumber(p.iflPercent)
        ? `Inspiratory flow limitation was reported during ${p.iflPercent}% of total sleep time.`
        : "The report describes inspiratory flow limitation without a validated percentage threshold.";
      addSupported(result, detail);
      addOutput(result, "O008", [detail]);
      addQuestion(result, "What signal and method were used to identify flow limitation?");
      result.route.push("P214");
    } else if (result.route.at(-1) !== "P214") {
      result.route.push("P214");
    }
  }

  const unresolvedAhi = clinicalAhi === null || clinicalAhi < 5;
  if (
    unresolvedAhi &&
    p.persistentSuspicion !== false &&
    ["limited", "unknown"].includes(p.representativeness)
  ) {
    result.route.push("P215");
    addUnknown(result, "whether the night adequately represented REM and supine sleep");
    addQuestion(result, "Did this night adequately represent REM and positional vulnerability?");
  }
  result.route.push("P216");
}

function evaluatePap(scenario, result) {
  const p = scenario.pap;
  result.route.push("T300");
  const unsafeRequest = [
    "pressure_change",
    "mode_change",
    "EERS",
    "rebreathing",
    "block_vent",
  ].includes(p.interventionRequest);

  if (unsafeRequest) {
    result.route.push("T316", "T315");
    addOutput(result, "O013", ["The requested modification is outside this educational tool's safety boundary."]);
    addQuestion(result, "What underlying data should a sleep clinician review before any intervention change?");
    return;
  }

  result.route.push("T301", "T302");
  let exposure = "unknown";
  if (p.allSleepPeriodsCovered === "yes") {
    exposure = "complete";
  } else if (p.allSleepPeriodsCovered === "no") {
    exposure = "partial";
  } else if (isNumber(p.usageHours) && isNumber(p.sleepHours)) {
    exposure = p.usageHours >= p.sleepHours * 0.9 ? "complete" : "partial";
  }

  if (exposure === "complete") {
    addSupported(result, "PAP use appears to cover the reported sleep period.");
  } else if (exposure === "partial") {
    addSupported(result, "PAP use does not cover the full reported sleep period.");
  } else {
    addUnknown(result, "therapeutic exposure across the full sleep period");
  }

  result.route.push("T303");
  const leakState = p.leakState || "unknown";
  if (leakState === "unknown") addUnknown(result, "manufacturer-specific leak context");
  if (leakState === "concern") addSupported(result, "Leak/interface data were marked as a concern.");

  const qualityProblem = exposure !== "complete" || ["concern", "unknown"].includes(leakState);
  if (qualityProblem) {
    result.route.push("T310");
    addOutput(result, "O009", [
      exposure === "partial" ? "The mask was not used across the full sleep period." : "Full-night exposure is not established.",
      leakState === "concern" ? "Leak/interface data need review." : leakState === "unknown" ? "Leak context is unknown." : "",
    ].filter(Boolean));
    addQuestion(result, "Can exposure and leak/interface problems be resolved before judging residual efficacy?");
  }

  result.route.push("T304", "T305");
  if (isNumber(p.ahiFlow)) {
    addSupported(result, `Device-reported AHI-flow: ${p.ahiFlow.toFixed(1)}.`);
  } else {
    addUnknown(result, "device-reported residual event index");
  }

  const centralConcern = p.centralSignal === "concern";
  if (centralConcern) {
    result.route.push("T311");
    addOutput(result, "O010", ["A new, increasing, or persistent device central/clear-airway signal was reported."]);
    addQuestion(result, "Does the central/clear-airway trend require confirmatory clinician review?");
  }

  result.route.push("T306", "T307", "T308", "T309");
  let efficacy = "uncertain";
  if (centralConcern) {
    efficacy = "concern";
  } else if (
    exposure === "complete" &&
    leakState === "acceptable" &&
    isNumber(p.ahiFlow) &&
    p.ahiFlow < 5
  ) {
    efficacy = "supported";
  }

  if (efficacy === "supported") {
    result.route.push("T312");
    if (hasPersistentSymptoms(scenario)) {
      result.route.push("T313");
      addOutput(result, "O011");
      addQuestion(result, "Would follow-up testing help explain persistent symptoms despite apparently adequate PAP data?");
      result.route.push("T314");
    } else {
      result.route.push("T315");
      return;
    }
  } else {
    result.route.push("T313", "T314");
  }

  result.route.push("T315");
}

export function evaluateScenario(inputScenario) {
  const scenario = withDefaults(inputScenario || {});
  const result = {
    scenario,
    route: ["G000", "G001"],
    outputIds: [],
    detailsByOutput: {},
    supportedStates: [],
    unknownStates: [],
    questions: [],
    claimIds: [],
  };

  if (scenario.drivingRisk === "high") {
    result.route.push("G002");
    addOutput(result, "O001");
    addSupported(result, "Recent dangerous sleepy-driving risk was reported.");
  }

  result.route.push("G003");
  if (scenario.ageBand === "under_18") {
    addUnknown(result, "pediatric pathway (outside v0 scope)");
    result.route.push("G008");
    return finish(result, scenario);
  }

  result.route.push("G004", "G005");
  if (scenario.primaryGoal === "negative_hsat") {
    evaluateHsat(scenario, result);
  } else if (["psg_scoring", "low_ahi_high_rdi"].includes(scenario.primaryGoal)) {
    evaluatePsg(scenario, result);
  } else if (scenario.primaryGoal === "pap_symptoms") {
    evaluatePap(scenario, result);
  } else {
    result.route.push("G006");
    ["test or device source", "metric name", "scoring rule", "denominator"].forEach((field) =>
      addUnknown(result, field),
    );
    addOutput(result, "O002", ["No objective report or PAP summary was available for this run."]);
    addQuestion(result, "Can the complete signed sleep report or device summary be obtained?");
    result.route.push("G008");
    return finish(result, scenario);
  }

  result.route.push("G007", "G008");
  return finish(result, scenario);
}

export const TEST_SCENARIOS = [
  {
    id: "TC01",
    title: "Symptoms without objective testing",
    scenario: withDefaults({
      id: "TC01",
      symptoms: { fatigue: true, nonrestorative: true },
      primaryGoal: "unknown",
      reportAvailable: false,
    }),
    requiredOutputs: ["O002", "O012"],
    requiredRoute: ["G000", "G001", "G003", "G004", "G005", "G006", "G008"],
  },
  {
    id: "TC02",
    title: "Negative adequate HSAT with persistent symptoms",
    scenario: withDefaults({
      id: "TC02",
      symptoms: { sleepiness: true },
      primaryGoal: "negative_hsat",
      reportAvailable: true,
      hsat: {
        value: 2.2,
        hypopneaRule: "4",
        denominator: "monitoring_time",
        technicalAdequacy: "adequate",
        wakeInclusionPlausible: "yes",
        nightsRecorded: 1,
        testFit: "appropriate",
        comorbidities: [],
      },
    }),
    requiredOutputs: ["O003", "O004"],
    requiredRoute: ["H100", "H101", "H102", "H103", "H108", "H109", "H104", "H105", "H107", "H106", "H112"],
  },
  {
    id: "TC03",
    title: "Technically inadequate HSAT with comorbidity",
    scenario: withDefaults({
      id: "TC03",
      symptoms: { fatigue: true },
      primaryGoal: "negative_hsat",
      reportAvailable: true,
      hsat: {
        value: 1.4,
        hypopneaRule: "4",
        technicalAdequacy: "inadequate",
        denominator: "monitoring_time",
        comorbidities: ["chronic opioid use"],
      },
    }),
    requiredOutputs: ["O003"],
    requiredRoute: ["H100", "H101", "H102", "H106", "H112"],
  },
  {
    id: "TC04",
    title: "Same-night AHI-3A / AHI-4% mismatch",
    scenario: withDefaults({
      id: "TC04",
      symptoms: { sleepiness: true },
      primaryGoal: "psg_scoring",
      reportAvailable: true,
      psg: {
        hypopneaRule: "dual",
        ahi3a: 12,
        ahi4: 3.1,
        sameStudy: true,
        rdi: 15,
        reraScored: "yes",
        rdiFormula: "AHI_plus_RERAs_per_TST",
        representativeness: "adequate",
      },
    }),
    requiredOutputs: ["O005"],
    requiredRoute: ["P200", "P201", "P203", "P204", "P205", "P206", "P214", "P216"],
  },
  {
    id: "TC05",
    title: "Low AHI with verified high RDI / RERAs",
    scenario: withDefaults({
      id: "TC05",
      symptoms: { sleepiness: true },
      primaryGoal: "low_ahi_high_rdi",
      reportAvailable: true,
      psg: {
        hypopneaRule: "3a",
        ahi3a: 3.2,
        rdi: 16.4,
        reraIndex: 13.2,
        reraScored: "yes",
        rdiFormula: "AHI_plus_RERAs_per_TST",
        representativeness: "adequate",
      },
    }),
    requiredOutputs: ["O006"],
    requiredRoute: ["P200", "P201", "P203", "P206", "P207", "P208", "P209", "P214", "P216"],
  },
  {
    id: "TC06",
    title: "Low AHI; RERAs not scored; flow limitation reported",
    scenario: withDefaults({
      id: "TC06",
      symptoms: { fatigue: true, nonrestorative: true },
      primaryGoal: "low_ahi_high_rdi",
      reportAvailable: true,
      psg: {
        hypopneaRule: "3a",
        ahi3a: 2.8,
        reraScored: "no",
        rdiFormula: "unknown",
        narrativeIfl: "present",
        signalContext: "nasal_pressure",
        representativeness: "limited",
      },
    }),
    requiredOutputs: ["O007", "O008"],
    requiredRoute: ["P200", "P201", "P203", "P206", "P207", "P210", "P211", "P212", "P213", "P214", "P215", "P216"],
  },
  {
    id: "TC07",
    title: "Quantified flow limitation below a research cutoff",
    scenario: withDefaults({
      id: "TC07",
      symptoms: { fatigue: true },
      primaryGoal: "low_ahi_high_rdi",
      reportAvailable: true,
      psg: {
        hypopneaRule: "3a",
        ahi3a: 2,
        rdi: 2,
        reraIndex: 0,
        reraScored: "yes",
        rdiFormula: "AHI_plus_RERAs_per_TST",
        iflPercent: 18,
        narrativeIfl: "present",
        signalContext: "nasal_pressure",
        representativeness: "adequate",
      },
    }),
    requiredOutputs: ["O008"],
    requiredRoute: ["P200", "P201", "P203", "P206", "P207", "P208", "P211", "P212", "P213", "P214", "P216"],
  },
  {
    id: "TC08",
    title: "Low PAP AHI with partial use and leak",
    scenario: withDefaults({
      id: "TC08",
      symptoms: { fatigue: true },
      primaryGoal: "pap_symptoms",
      reportAvailable: true,
      pap: {
        usageHours: 5,
        sleepHours: 8,
        allSleepPeriodsCovered: "no",
        leakState: "concern",
        ahiFlow: 1.2,
        centralSignal: "unknown_nonconcerning",
        waveformState: "unavailable",
      },
    }),
    requiredOutputs: ["O009", "O012"],
    requiredRoute: ["T300", "T301", "T302", "T303", "T310", "T304", "T305", "T306", "T307", "T308", "T309", "T313", "T314", "T315"],
  },
  {
    id: "TC09",
    title: "Low PAP AHI, good exposure/leak, persistent sleepiness",
    scenario: withDefaults({
      id: "TC09",
      symptoms: { sleepiness: true },
      primaryGoal: "pap_symptoms",
      reportAvailable: true,
      pap: {
        usageHours: 5.5,
        sleepHours: 5.5,
        allSleepPeriodsCovered: "yes",
        leakState: "acceptable",
        ahiFlow: 1,
        centralSignal: "no",
        waveformState: "available_unreviewed",
      },
    }),
    requiredOutputs: ["O011", "O012"],
    requiredRoute: ["T300", "T301", "T302", "T303", "T304", "T305", "T306", "T307", "T308", "T309", "T312", "T313", "T314", "T315"],
  },
  {
    id: "TC10",
    title: "Rising device central-event signal",
    scenario: withDefaults({
      id: "TC10",
      symptoms: { sleepiness: true },
      primaryGoal: "pap_symptoms",
      reportAvailable: true,
      pap: {
        usageHours: 7.5,
        sleepHours: 7.5,
        allSleepPeriodsCovered: "yes",
        leakState: "acceptable",
        ahiFlow: 8,
        centralSignal: "concern",
        waveformState: "available_unreviewed",
      },
    }),
    requiredOutputs: ["O010"],
    requiredRoute: ["T300", "T301", "T302", "T303", "T304", "T305", "T311", "T306", "T307", "T308", "T309", "T313", "T314", "T315"],
    firstOutput: "O010",
  },
  {
    id: "TC11",
    title: "Dangerous sleepy driving",
    scenario: withDefaults({
      id: "TC11",
      drivingRisk: "high",
      safetyAcknowledged: true,
      symptoms: { sleepiness: true },
      primaryGoal: "unknown",
    }),
    requiredOutputs: ["O001"],
    requiredRoute: ["G000", "G001", "G002", "G003"],
    firstOutput: "O001",
  },
  {
    id: "TC12",
    title: "DIY EERS / vent-block request",
    scenario: withDefaults({
      id: "TC12",
      symptoms: { nonrestorative: true },
      primaryGoal: "pap_symptoms",
      pap: { interventionRequest: "EERS", ahiFlow: 1.1 },
    }),
    requiredOutputs: ["O013"],
    requiredRoute: ["T300", "T316", "T315"],
    firstOutput: "O013",
  },
];

function isSubsequence(expected, actual) {
  let cursor = 0;
  for (const item of actual) {
    if (item === expected[cursor]) cursor += 1;
  }
  return cursor === expected.length;
}

export function runAcceptanceSuite(outputTextById = {}) {
  return TEST_SCENARIOS.map((test) => {
    const result = evaluateScenario(test.scenario);
    const missingOutputs = test.requiredOutputs.filter(
      (outputId) => !result.outputIds.includes(outputId),
    );
    const routePass = isSubsequence(test.requiredRoute, result.route);
    const firstOutputPass = !test.firstOutput || result.outputIds[0] === test.firstOutput;
    const renderedText = result.outputIds
      .map((outputId) => outputTextById[outputId] || "")
      .join(" ");
    const forbiddenMatches = GENERIC_FORBIDDEN_PATTERNS.filter((pattern) =>
      pattern.test(renderedText),
    ).map((pattern) => pattern.source);
    const checks = [
      {
        label: "Required outputs",
        pass: missingOutputs.length === 0,
        detail: missingOutputs.length ? `Missing ${missingOutputs.join(", ")}` : "All present",
      },
      {
        label: "Required route",
        pass: routePass,
        detail: routePass ? "Expected nodes appear in order" : "Route mismatch",
      },
      {
        label: "Safety priority",
        pass: firstOutputPass,
        detail: firstOutputPass ? "Correct" : `${test.firstOutput} was not first`,
      },
      {
        label: "Forbidden inference scan",
        pass: forbiddenMatches.length === 0,
        detail: forbiddenMatches.length ? forbiddenMatches.join(", ") : "No prohibited phrasing detected",
      },
    ];
    return {
      ...test,
      result,
      checks,
      pass: checks.every((check) => check.pass),
    };
  });
}

export function resetScenario() {
  return clone(DEFAULT_SCENARIO);
}

export function loadTestScenario(testId) {
  const match = TEST_SCENARIOS.find((test) => test.id === testId);
  return match ? clone(match.scenario) : resetScenario();
}
