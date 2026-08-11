import assert from "node:assert/strict";
import test from "node:test";

import specData from "../app/spec-data.json" with { type: "json" };
import {
  evaluateScenario,
  loadTestScenario,
  runAcceptanceSuite,
} from "../app/engine.js";

const outputTextById = Object.fromEntries(
  specData.outputs.map((output) => [
    output["Output ID"],
    output["Approved user-facing message"],
  ]),
);

test("all workbook acceptance scenarios pass the executable engine", () => {
  const suite = runAcceptanceSuite(outputTextById);
  assert.equal(suite.length, 12);
  assert.deepEqual(
    suite.filter((result) => !result.pass).map((result) => result.id),
    [],
  );
});

test("dangerous sleepy-driving guidance is always the first output", () => {
  const result = evaluateScenario(loadTestScenario("TC11"));
  assert.equal(result.outputIds[0], "O001");
  assert.equal(result.route[2], "G002");
});

test("specialist-only EERS boundary fires before educational outputs", () => {
  const result = evaluateScenario(loadTestScenario("TC12"));
  assert.equal(result.outputIds[0], "O013");
  assert.ok(result.route.includes("T316"));
});

test("RERAs not scored remains an unknown and coexists with flow-limitation context", () => {
  const result = evaluateScenario(loadTestScenario("TC06"));
  assert.ok(result.outputIds.includes("O007"));
  assert.ok(result.outputIds.includes("O008"));
  assert.ok(result.unknownStates.some((state) => state.includes("not scored")));
});
