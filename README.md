# Patient Advocacy Tool

Sleep Study Check is a static patient-advocacy guide for reviewing negative or
low-index sleep study results. It walks through persistent symptoms, test type,
hypopnea scoring, and RDI/RERA reporting, with links to AASM guidance and
supporting studies.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate

```bash
npm run lint
npm test
```

`npm test` creates a static export in `out/` and runs the page-focused source
and rendered-HTML tests.

## GitHub Pages

The Next.js configuration creates a static export and automatically applies the
repository base path when built by GitHub Actions.

## Analytics

The Pages workflow reads the GA4 Measurement ID from the
`GA_MEASUREMENT_ID` repository variable. Google Analytics loads only after a
visitor opts in. The site uses GA4's automatic page, session, and engagement
measurement and does not send questionnaire selections or health-related values.
