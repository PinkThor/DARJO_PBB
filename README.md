# Sidoarjo PBB / SIE — Userscripts (source folder)

Five independent Tampermonkey scripts for the Sidoarjo PBB / SIE app
(`sie.pajakdaerah.sidoarjokab.go.id:440`). No script depends on another; each can be
enabled/disabled independently. Local filenames are short aliases (see Conventions).

| Script | Local file | @version | Scope |
|---|---|---|---|
| Virtual Map Material 3 UX | `VMap-3.20.js` | 3.20 | virtual-map detail page: theme + font popup, panel restructure, riwayat compaction, NOP formatter, coordinate copy |
| SIE Material 3 Expressive | `SIE-1.3.2.js` | 1.3.2 | list/arsip pages: theme + font popup, DataTables toolbar, filters, true full-page CSV export |
| Material 3 Expressive (Compact) | `Compact-1.3.2.js` | 1.3.2 | form pages (n2n01/02/03): full Material 3 takeover — THE live form script |
| RUMUS NJOP Bangunan | `RUMUS-1.0.1.user.js` | 1.0.1 | NJOP calculator on n2n02-form |
| Verifikator Helper | `VERIFIKATOR-3.11.1.user.js` | 3.11.1 | SPOP/LSPOP audit badges + persistent toasts |

> **Backup:** `_backup/` holds the original (pre-Compact) form script. Do **not** install it
> in Tampermonkey alongside Compact — both restyle the form pages and will fight.

## Shared storage (localStorage) — sync between scripts

| Key | Values | Used by |
|---|---|---|
| `tm-theme` | `"light"` \| `"dark"` | VMap + SIE (SIE migrates legacy `tm-pbb-list-theme` on first run, then only writes `tm-theme`) |
| `tm-font` | `"atkinson"` \| `"system"` \| `"mono"` | VMap + SIE |

- Theme + font choices made on the v-map detail page apply instantly on the SIE list pages
  and vice-versa (same keys, cross-tab `storage` listener).
- All localStorage reads/writes go through `try/catch` wrappers; invalid stored values fall
  back to defaults (theme default, `atkinson`).

## Conventions

- **Local filename is a short alias; @version is appended** (`VMap-3.20.js`).
- **@downloadURL / @updateURL point at the UNVERSIONED GitHub file**
  (`PinkThor/DARJO_PBB`, `main`) under the *long descriptive name* — repo files keep stable
  names so Tampermonkey auto-updates never break on a local rename.
- Every script: `@grant none`, `@noframes`, `@run-at document-idle`.
- Double-injection guards: `__tmVmapLoaded`, `__tmSieLoaded`, `__tmCompactLoaded`,
  `__njopLoaded`, `__verifHelperLoaded`.

## Feature gaps / notes

- SIE's full export walks every server-side page (currently 137 at 100/page) sequentially and
  takes a few seconds — the button shows `N/P` progress and is disabled meanwhile.
- SIE + VMap share the theme/font popup UX but not its code: the ~120-line popup is
  deliberately duplicated in both scripts (a shared module was considered via a build step
  and declined — the duplication is kept in sync by hand).
- RUMUS fetch failures show `t/o` (timeout) or `✕` in the NJOP cell.
