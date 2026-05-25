# AGENTS.md
- Treat `.nimi/app-scaffold/intent.json` and `.nimi/app-scaffold/lock.json` as app-scaffold intent and lock state.
- Treat `.nimi/{config,contracts,methodology}/**` as `@nimiplatform/nimi-coding` managed projections created by `pnpm run init`.
- Keep auth, Runtime, permission, manifest, and Tauri shell glue in scaffold-managed files.
- The app-owned area is `src/shell/routes/product-area.tsx`, `src/tester/**`, app-owned tester Tauri modules under `src-tauri/src/{tester_storage.rs,world_tour.rs}`, and tester contract tests.
- `.nimi/admission/**` and `ADMISSION.md` are developer-submitted review inputs, not platform admission truth.
- Local checks are pre-submission self-checks only.
