import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders the updated sleep study checker", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
  assert.match(html, /My sleep study said/i);
  assert.match(html, /Patient Advocacy Tool/i);
  assert.match(html, /Are symptoms still affecting you despite the sleep test/i);
  assert.doesNotMatch(html, /I’m not sure/i);
  assert.match(html, /I haven’t done my sleep study yet/i);
  assert.match(html, /Sleep Study Check/i);
  assert.match(
    html,
    /Check that the test conclusively rules out obstructive sleep breathing disorders/i,
  );
  assert.doesNotMatch(html, /typically reports REI or AHI/i);
  assert.match(html, /American Academy of Sleep Medicine/i);
  assert.doesNotMatch(html, /exactly 5\.0 counts as 5 or higher/i);
  assert.doesNotMatch(html, /AASM-recommended 3%-or-arousal/i);
  assert.doesNotMatch(html, /Copy next step/i);
  assert.doesNotMatch(html, /codex-preview/i);
  assert.doesNotMatch(html, /Starter Project/i);
});
