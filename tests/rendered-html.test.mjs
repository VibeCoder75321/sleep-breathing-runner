import assert from "node:assert/strict";
import test from "node:test";

test("renders the updated sleep study checker", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /A sleep test said/i);
  assert.match(html, /Patient Advocacy Tool/i);
  assert.match(html, /Are symptoms still affecting you despite the sleep test/i);
  assert.doesNotMatch(html, /I’m not sure/i);
  assert.match(html, /Sleep Study Check/i);
  assert.match(html, /Check that the test conclusively rules out sleep breathing disorders/i);
  assert.doesNotMatch(html, /typically reports REI or AHI/i);
  assert.match(html, /American Academy of Sleep Medicine/i);
  assert.doesNotMatch(html, /exactly 5\.0 counts as 5 or higher/i);
  assert.doesNotMatch(html, /AASM-recommended 3%-or-arousal/i);
  assert.doesNotMatch(html, /Copy next step/i);
  assert.doesNotMatch(html, /codex-preview/i);
  assert.doesNotMatch(html, /Starter Project/i);
});
