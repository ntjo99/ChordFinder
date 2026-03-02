# Milestone 5 Release Audit

## Feature Coherence
- Key/scale and chord filters combine via deterministic intersection.
- Diatonic chord mode constrains available chord roots/qualities when key/scale is enabled.
- Interval behavior uses auto-include semantics:
  - valid tones are implicitly included
  - interval chips only drive exclusion
  - invalid interval chips are visible but disabled
- Reset controls:
  - global reset in top summary bar
  - interval section reset (clears exclusions)
  - chord add-ons reset (clears extensions/alterations)
- Note naming stays deterministic (`sharps` or `flats`) across all selectors/labels.

## Manual Visual Regression Checklist
- [ ] Key only scenario looks correct.
- [ ] Chord only scenario looks correct.
- [ ] Omit interval scenario removes tones globally.
- [ ] Diatonic mode on/off updates chord options correctly.
- [ ] Sharps vs flats updates note labels consistently.
- [ ] Narrow layout (mobile-ish width) has no layout break/jank.

## Performance/Stability Checklist
- [ ] No noticeable lag while toggling filters rapidly.
- [ ] No runaway rerenders or memory growth during resize/interaction.
- [ ] Browser console remains clean during normal interactions.

## Deployment Readiness
- Static web output produced from `pnpm build:web`.
- SPA fallback file (`_redirects`) included for static hosting.
- Favicon, title, and meta description included.
