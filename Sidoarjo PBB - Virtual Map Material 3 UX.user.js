// ==UserScript==
// @name         Sidoarjo PBB - Virtual Map Material 3 UX
// @namespace    http://tampermonkey.net/
// @version      3.18
// @description  Material 3 design, Atkinson Hyperlegible Next font, dark/light theme for Virtual Map
// @author       Antigravity
// @downloadURL  https://raw.githubusercontent.com/PinkThor/DARJO_PBB/main/Sidoarjo%20PBB%20-%20Virtual%20Map%20Material%203%20UX.user.js
// @updateURL    https://raw.githubusercontent.com/PinkThor/DARJO_PBB/main/Sidoarjo%20PBB%20-%20Virtual%20Map%20Material%203%20UX.user.js
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/virtual-map*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('[TM-VMap] Script started');

    // ── Font Injection ──
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap';
    document.head.appendChild(link);
    console.log('[TM-VMap] Font link injected');

    // ── Safe localStorage ──
    function getTheme() {
        try { return localStorage.getItem('tm-theme'); }
        catch (e) { return null; }
    }
    function setTheme(val) {
        try { localStorage.setItem('tm-theme', val); }
        catch (e) { /* blocked */ }
    }

    // ── Apply saved theme ──
    if (getTheme() === 'light') {
        document.documentElement.classList.add('tm-light');
    }

    // ── CSS Injection ──
    var css = [
        // ── Variables: Dark ──
        ':root {',
        '  --m3-surface: #0D1117;',
        '  --m3-surface-1: #161B22;',
        '  --m3-surface-2: #1C2128;',
        '  --m3-outline: #30363D;',
        '  --m3-on-surface: #E1E3E5;',
        '  --m3-on-surface-variant: #A8B0B8;',
        '  --m3-primary: #79C0FF;',
        '  --m3-primary-container: #1D3A5C;',
        '  --m3-secondary-container: #1F4D2E;',
        '  --m3-error: #FF7B72;',
        '  --m3-success: #7EE787;',
        '}',

        // ── Variables: Light ──
        'html.tm-light {',
        '  --m3-surface: #F6F8FA;',
        '  --m3-surface-1: #FFFFFF;',
        '  --m3-surface-2: #F0F2F4;',
        '  --m3-outline: #D0D7DE;',
        '  --m3-on-surface: #1F2328;',
        '  --m3-on-surface-variant: #57606A;',
        '  --m3-primary: #0969DA;',
        '  --m3-primary-container: #DDF4FF;',
        '  --m3-secondary-container: #DCFFE4;',
        '  --m3-error: #CF222E;',
        '  --m3-success: #1A7F37;',
        '}',

        // ── Global Font ──
        'body, input, button, select, textarea, label, table, #infoDetail, #riwayatSpptCard, #riwayatPenugasanCard, #listVillage, #listName, #searchName, #interactionForm, #layers, #legend, .ol-popup {',
        '  font-family: "Atkinson Hyperlegible Next", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
        '  -webkit-font-smoothing: antialiased;',
        '}',

        // ── Body ──
        'body {',
        '  background-color: var(--m3-surface) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',

        // ── Floating Panels ──
        '#infoDetail, #riwayatSpptCard, #riwayatPenugasanCard, #listVillage, #listName, #searchName, #interactionForm, #layers, #legend {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 20px !important;',
        '  box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  overflow: hidden;',
        '  transition: background 0.3s ease, border-color 0.3s ease;',
        '}',
        '/* Tiny width bump on desktop only — mobile keeps its full-width sheet layout */',
        '@media (min-width: 1024px) {',
        '  #infoDetail, #riwayatSpptCard, #riwayatPenugasanCard, #listVillage, #listName, #searchName, #interactionForm {',
        '    min-width: 340px !important;',
        '  }',
        '}',
        '/* Bug fix: #infoDetail and #listVillage ship with both bottom-0 (unprefixed, */',
        '/* so it still applies at lg) and lg:top-0. On desktop that pins the panel to */',
        '/* both the top AND bottom of the viewport at once — with height:auto on a */',
        '/* position:fixed box, the browser is forced to stretch it to fill the full */',
        '/* height instead of sizing to its content (lg:min-h-min only sets a minimum, */',
        "/* it can't override an explicitly stretched height). Cancel bottom at lg. */",
        '@media (min-width: 1024px) {',
        '  #infoDetail, #listVillage {',
        '    bottom: auto !important;',
        '  }',
        '}',
        'html.tm-light #infoDetail, html.tm-light #riwayatSpptCard, html.tm-light #riwayatPenugasanCard, html.tm-light #listVillage, html.tm-light #listName, html.tm-light #searchName, html.tm-light #interactionForm, html.tm-light #layers, html.tm-light #legend {',
        '  box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important;',
        '}',

        // ── Card Headers ──
        '#riwayatPenugasanCard .bg-gray-100, #listVillage .bg-gray-100, #listName .bg-gray-100, #interactionForm .bg-gray-100 {',
        '  background: var(--m3-surface-2) !important;',
        '  border-bottom: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  padding: 16px 20px !important;',
        '}',
        '/* DETAIL NOP header: label text removed via JS (observeNop), */',
        '/* just the bare number + close button remain — almost no padding. */',
        '#infoDetail .bg-gray-100 {',
        '  background: var(--m3-surface-2) !important;',
        '  border-bottom: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  padding: 4px 10px !important;',
        '  position: relative !important;',
        '  min-height: 40px;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '}',
        '/* NOP heading: large per request (was 28px, dialed back a touch), Regular weight to match the data values */',
        '#d_nop {',
        '  font-size: 22px !important;',
        '  font-weight: 400 !important;',
        '  line-height: 1.2 !important;',
        '}',
        '/* NOP number centered across the full header width, independent of the close button */',
        '#infoDetail .bg-gray-100 > .flex.text-lg.font-bold {',
        '  position: absolute !important;',
        '  left: 0;',
        '  right: 0;',
        '  top: 50%;',
        '  transform: translateY(-50%);',
        '  margin: 0 !important;',
        '  justify-content: center !important;',
        '  pointer-events: auto;',
        '  user-select: text;',
        '  -webkit-user-select: text;',
        '}',
        '/* Close button stays pinned right, unaffected by the absolute NOP text above */',
        '#infoDetail .bg-gray-100 > div:last-child {',
        '  margin-left: auto !important;',
        '  position: relative;',
        '  z-index: 1;',
        '}',
        '/* NOP format toggle: small dot, opposite side from the close button. */',
        '/* Visually subtle (tiny dot, no border/fill) but a generous tap target. */',
        '.tm-nop-toggle {',
        '  position: relative;',
        '  z-index: 1;',
        '  flex-shrink: 0;',
        '  width: 28px;',
        '  height: 28px;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  border: none;',
        '  background: transparent;',
        '  color: var(--m3-on-surface-variant);',
        '  font-size: 9px;',
        '  line-height: 1;',
        '  cursor: pointer;',
        '  padding: 0;',
        '  margin: 0;',
        '  border-radius: 999px;',
        '  transition: background 0.2s ease, color 0.2s ease;',
        '}',
        '.tm-nop-toggle:hover {',
        '  background: var(--m3-surface-1);',
        '  color: var(--m3-on-surface);',
        '}',
        '.tm-nop-toggle.tm-active {',
        '  color: var(--m3-primary);',
        '}',
        '#detail-op.tm-rows-hidden .tm-property-row {',
        '  display: none !important;',
        '}',
        '/* RIWAYAT TAGIHAN SPPT sub-header removed outright per request — */',
        '/* note this also hides its close (X) button, so the panel no longer */',
        '/* has its own close control inside this card. */',
        '#riwayatSpptCard .flex.justify-between.bg-gray-100.rounded-t-md.p-3 {',
        '  display: none !important;',
        '}',
        '#searchName .card-header {',
        '  background: var(--m3-surface-2) !important;',
        '  border-bottom: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '#searchName .card {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',

        // ── Search Container ──
        '.fixed.top-0.flex.flex-col .m-3.bg-white {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 16px !important;',
        '  padding: 8px !important;',
        '  box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;',
        '}',
        'html.tm-light .fixed.top-0.flex.flex-col .m-3.bg-white {',
        '  box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important;',
        '}',

        // ── M3 Segmented Buttons ──
        '.grid.grid-cols-5 {',
        '  background: var(--m3-surface-2) !important;',
        '  border-radius: 12px !important;',
        '  padding: 4px !important;',
        '  gap: 4px !important;',
        '}',
        '.grid.grid-cols-5 > div {',
        '  border: none !important;',
        '  border-radius: 8px !important;',
        '  padding-top: 6px !important;',
        '  padding-bottom: 6px !important;',
        '  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);',
        '  background: transparent;',
        '}',
        '.grid.grid-cols-5 > div:has(input:checked) {',
        '  background: var(--m3-primary-container) !important;',
        '}',
        '.grid.grid-cols-5 label {',
        '  color: var(--m3-on-surface-variant) !important;',
        '  transition: color 0.2s ease;',
        '}',
        '.grid.grid-cols-5 > div:has(input:checked) label {',
        '  color: var(--m3-primary) !important;',
        '  font-weight: 700 !important;',
        '}',
        '.grid.grid-cols-5 svg {',
        '  color: var(--m3-on-surface-variant) !important;',
        '}',
        '.grid.grid-cols-5 > div:has(input:checked) svg {',
        '  color: var(--m3-primary) !important;',
        '  stroke: var(--m3-primary) !important;',
        '  transform: scale(1.05);',
        '}',

        // ── Search Bar ──
        '#formSearch {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 28px !important;',
        '  padding: 6px 16px !important;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;',
        '}',
        'html.tm-light #formSearch {',
        '  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;',
        '}',
        '#inputSearch {',
        '  background: transparent !important;',
        '  color: var(--m3-on-surface) !important;',
        '  font-size: 15px !important;',
        '  border: none !important;',
        '}',
        '#inputSearch::placeholder {',
        '  color: var(--m3-on-surface-variant) !important;',
        '  opacity: 0.8;',
        '}',
        '#cari svg {',
        '  color: var(--m3-primary) !important;',
        '  transition: transform 0.2s ease;',
        '}',
        '#cari:hover svg { transform: scale(1.15); }',

        // ── Wilayah Dropdown ──
        '#inputKodeWilayah {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 12px !important;',
        '  overflow: hidden;',
        '}',
        '#inputKodeWilayah .flex-auto {',
        '  background: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  font-weight: 700;',
        '}',

        // ── Select2 ──
        '.select2-container--default .select2-selection--single {',
        '  background-color: transparent !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '.select2-container--default .select2-selection--single .select2-selection__rendered {',
        '  color: var(--m3-on-surface) !important;',
        '}',

        // ── FAB Buttons ──
        '#fullscreenButton, #buttonLayer, #homeButton, #legendButton {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border-radius: 50% !important;',
        '  width: 44px !important;',
        '  height: 44px !important;',
        '  box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;',
        '  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '}',
        'html.tm-light #fullscreenButton, html.tm-light #buttonLayer, html.tm-light #homeButton, html.tm-light #legendButton {',
        '  box-shadow: 0 4px 10px rgba(0,0,0,0.06) !important;',
        '}',
        '#fullscreenButton:hover, #buttonLayer:hover, #homeButton:hover, #legendButton:hover {',
        '  background: var(--m3-surface-2) !important;',
        '  color: var(--m3-primary) !important;',
        '  transform: scale(1.08);',
        '}',
        '#fullscreenButton svg, #buttonLayer svg, #homeButton svg, #legendButton svg {',
        '  width: 20px !important;',
        '  height: 20px !important;',
        '}',

        // ── Detail Panel ──
        '#infoDetail .p-3.space-y-3 { padding: 12px 16px !important; }',
        '#detail-op .flex.flex-col.space-y-2 {',
        '  gap: 4px !important;',
        '}',
        '#detail-op .flex.flex-col.space-y-2 > :not([hidden]) ~ :not([hidden]) {',
        '  margin-top: 0 !important;',
        '}',
        '#detail-op .text-xs {',
        '  color: var(--m3-on-surface-variant) !important;',
        '  text-transform: uppercase;',
        '  font-weight: 400 !important;',
        '  font-size: 10px !important;',
        '  letter-spacing: 0.05em;',
        '  margin-bottom: 2px;',
        '}',
        '/* SPPT year (e.g. 2026) — embiggened again per request */',
        '#detail-op .text-xs .tm-sppt-year {',
        '  font-size: 14px !important;',
        '  font-weight: 700 !important;',
        '  color: var(--m3-on-surface) !important;',
        '  letter-spacing: 0.03em;',
        '}',
        '#detail-op .text-md.font-bold, #detail-op .text-right.text-md.font-bold {',
        '  color: var(--m3-on-surface) !important;',
        '  font-size: 17px !important;',
        '  font-weight: 400 !important;',
        '}',
        '/* BELUM LUNAS keeps white on red; LUNAS uses darker success text via .bg-green-500 */',
        '#detail-op .text-white:not(.bg-green-500) {',
        '  color: #ffffff !important;',
        '  font-weight: 400 !important;',
        '}',
        '/* Bug fix: .bg-green-500/.bg-red-500/.bg-red-600 also carry .text-xs (for */',
        '/* sizing only), but #detail-op .text-xs (specificity 110) was beating the */',
        '/* global badge rule (specificity 10) on color/size/weight/case — BELUM LUNAS */',
        '/* dodged this via a :not() specificity boost above, LUNAS had no rescue and */',
        '/* was rendering gray instead of green. Re-assert at equal-or-higher specificity. */',
        '#detail-op .bg-green-500, #detail-op .bg-red-500, #detail-op .bg-red-600 {',
        '  text-transform: none !important;',
        '  letter-spacing: normal !important;',
        '  font-size: 12px !important;',
        '  font-weight: 400 !important;',
        '  margin-bottom: 0 !important;',
        '}',
        '#detail-op .bg-green-500 {',
        '  color: var(--m3-success) !important;',
        '}',
        '#detail-op .flex.flex-col.space-y-2 > div {',
        '  border-bottom: 1px solid rgba(255,255,255,0.05) !important;',
        '  padding-bottom: 4px !important;',
        '  margin-bottom: 0 !important;',
        '}',
        'html.tm-light #detail-op .flex.flex-col.space-y-2 > div {',
        '  border-bottom: 1px solid rgba(0,0,0,0.05) !important;',
        '}',

        // ── NAMA WP row + collapsible WP-contact-details toggle ──
        // (structure built by restructureDetailOp() in JS)
        '#detail-op .tm-wp-name-row {',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: space-between;',
        '  gap: 8px;',
        '}',
        '/* Extra-specific selector so this wins over the .text-md.font-bold rule above */',
        '#detail-op .text-md.font-bold.tm-wp-name {',
        '  font-size: 19px !important;',
        '  font-weight: 400 !important;',
        '  line-height: 1.3 !important;',
        '}',
        '#detail-op .tm-wp-toggle {',
        '  flex-shrink: 0;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  width: 26px;',
        '  height: 26px;',
        '  border-radius: 999px;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  background: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface-variant) !important;',
        '  cursor: pointer;',
        '  padding: 0;',
        '  transition: border-color 0.2s ease, color 0.2s ease;',
        '}',
        '#detail-op .tm-wp-toggle:hover {',
        '  border-color: var(--m3-primary) !important;',
        '  color: var(--m3-primary) !important;',
        '}',
        '#detail-op .tm-wp-toggle svg {',
        '  width: 14px;',
        '  height: 14px;',
        '  transition: transform 0.2s ease;',
        '}',
        '#detail-op .tm-wp-toggle.tm-rotated svg {',
        '  transform: rotate(180deg);',
        '}',
        '#detail-op .tm-wp-details {',
        '  display: none;',
        '  flex-direction: column;',
        '  gap: 4px;',
        '}',
        '#detail-op .tm-wp-details.tm-expanded {',
        '  display: flex;',
        '}',
        '#detail-op .tm-wp-details > div {',
        '  border-bottom: 1px solid rgba(255,255,255,0.05) !important;',
        '  padding-bottom: 4px !important;',
        '  margin-bottom: 0 !important;',
        '}',
        'html.tm-light #detail-op .tm-wp-details > div {',
        '  border-bottom: 1px solid rgba(0,0,0,0.05) !important;',
        '}',

        // ── Tanah/Bangunan category color-coding ──
        // Left column (Luas Tanah, Njop Bumi/M2) = land; right column
        // (Luas Bangunan, Njop Bangunan/M2) = building. Colors + a small dot
        // (not color alone) so the relationship reads at a glance down each
        // column, and remains distinguishable for colorblind readers too.
        '#detail-op .tm-cat-tanah .text-xs {',
        '  color: #B45309 !important;',
        '}',
        '#detail-op .tm-cat-tanah .text-xs::before {',
        '  content: "";',
        '  display: inline-block;',
        '  width: 6px;',
        '  height: 6px;',
        '  border-radius: 50%;',
        '  background: #B45309;',
        '  margin-right: 5px;',
        '  vertical-align: middle;',
        '}',
        '#detail-op .tm-cat-bangunan .text-xs {',
        '  color: #2563EB !important;',
        '}',
        '#detail-op .tm-cat-bangunan .text-xs::after {',
        '  content: "";',
        '  display: inline-block;',
        '  width: 6px;',
        '  height: 6px;',
        '  border-radius: 50%;',
        '  background: #2563EB;',
        '  margin-left: 5px;',
        '  vertical-align: middle;',
        '}',

        // ── 2-column row alignment: left column always left, right always right ──
        // (overrides whatever text-right/plain classes each field happened to carry
        // before being re-paired by restructureDetailOp)
        '#detail-op .flex.justify-between > div:first-child,',
        '#detail-op .flex.justify-between > div:first-child * {',
        '  text-align: left !important;',
        '}',
        '#detail-op .flex.justify-between > div:last-child,',
        '#detail-op .flex.justify-between > div:last-child * {',
        '  text-align: right !important;',
        '}',

        // ── Divider ──
        '.bg-gray-100.h-\\[2px\\] {',
        '  background-color: var(--m3-outline) !important;',
        '  height: 1px !important;',
        '  margin: 12px 0 !important;',
        '}',
        '#infoDetail .bg-gray-100.h-\\[2px\\], #riwayatSpptCard .bg-gray-100.h-\\[2px\\], #riwayatPenugasanCard .bg-gray-100.h-\\[2px\\] {',
        '  display: none !important;',
        '}',

        // ── Lunas / Belum Lunas badges ──
        '.bg-green-500, .bg-red-500, .bg-red-600 {',
        '  display: inline-block !important;',
        '  width: fit-content !important;',
        '  max-width: 100% !important;',
        '  font-size: 12px !important;',
        '  line-height: 1.25 !important;',
        '  white-space: nowrap !important;',
        '  box-shadow: none !important;',
        '  border-radius: 8px !important;',
        '  font-weight: 400 !important;',
        '  padding: 4px 10px !important;',
        '}',
        '.bg-green-500 {',
        '  background-color: var(--m3-secondary-container) !important;',
        '  color: var(--m3-success) !important;',
        '  border: 1px solid rgba(126, 231, 135, 0.2);',
        '}',
        '.bg-red-500, .bg-red-600 {',
        '  background-color: var(--m3-error) !important;',
        '  color: #ffffff !important;',
        '  border: 1px solid rgba(207, 34, 46, 0.35);',
        '}',
        '/* Shrink wrapper so the pill is only as wide as its label */',
        '#detail-op .tm-status-wrap {',
        '  display: inline-flex !important;',
        '  justify-content: flex-end !important;',
        '  width: auto !important;',
        '  max-width: 100% !important;',
        '  margin-left: auto !important;',
        '}',

        // ── Action Buttons ──
        '#buttonActionDetail {',
        '  display: flex;',
        '  flex-wrap: wrap;',
        '  gap: 8px !important;',
        '  margin-top: 4px !important;',
        '  padding-top: 0;',
        '}',
        '#buttonActionDetail a, #buttonActionDetail button {',
        '  all: unset;',
        '  display: inline-flex !important;',
        '  align-items: center;',
        '  justify-content: center;',
        '  cursor: pointer;',
        '  border-radius: 20px !important;',
        '  font-weight: 700 !important;',
        '  font-size: 12px !important;',
        '  height: 38px !important;',
        '  padding: 0 16px !important;',
        '  box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;',
        '  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);',
        '}',
        'html.tm-light #buttonActionDetail a, html.tm-light #buttonActionDetail button {',
        '  box-shadow: 0 2px 6px rgba(0,0,0,0.05) !important;',
        '}',
        '#buttonActionDetail svg {',
        '  width: 16px !important;',
        '  height: 16px !important;',
        '  margin-right: 6px;',
        '}',
        '#ruteCoordinate {',
        '  background-color: var(--m3-primary-container) !important;',
        '  color: var(--m3-primary) !important;',
        '  border: 1px solid rgba(121, 192, 255, 0.15) !important;',
        '}',
        '#ruteCoordinate:hover {',
        '  background-color: #244b73 !important;',
        '  transform: translateY(-2px);',
        '}',
        '/* The actual visible "highlight": Tailwind hardcodes this inner pill to */',
        '/* white bg + blue border, which clashes with the dark theme. Recolor it */',
        '/* to match instead of just stripping it, so it still reads as a button. */',
        '#buttonActionDetail .border-2.border-blue-400 {',
        '  background-color: var(--m3-primary-container) !important;',
        '  border-color: rgba(121, 192, 255, 0.15) !important;',
        '  color: var(--m3-primary) !important;',
        '  box-shadow: none !important;',
        '}',
        '#ruteCoordinate:hover .border-2.border-blue-400 {',
        '  background-color: #244b73 !important;',
        '}',
        '/* Separate compact copy control: 44px minimum hit target for mobile. */',
        '#buttonActionDetail .tm-copy-coordinate {',
        '  all: unset;',
        '  box-sizing: border-box;',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  width: 44px !important;',
        '  min-width: 44px !important;',
        '  height: 44px !important;',
        '  padding: 0 !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 14px !important;',
        '  background: var(--m3-surface-1) !important;',
        '  color: var(--m3-primary) !important;',
        '  cursor: pointer;',
        '  touch-action: manipulation;',
        '  box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;',
        '}',
        '#buttonActionDetail .tm-copy-coordinate:hover, #buttonActionDetail .tm-copy-coordinate:focus-visible {',
        '  background: var(--m3-primary-container) !important;',
        '  outline: 2px solid var(--m3-primary) !important;',
        '  outline-offset: 2px;',
        '}',
        '#buttonActionDetail .tm-copy-coordinate svg {',
        '  width: 19px !important;',
        '  height: 19px !important;',
        '  margin: 0 !important;',
        '}',
        '#buttonActionDetail .tm-copy-coordinate.tm-copied {',
        '  color: var(--m3-success) !important;',
        '}',
        '#riwayatSppt, #riwayatPenugasan {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '}',
        '#riwayatSppt:hover, #riwayatPenugasan:hover {',
        '  background-color: var(--m3-surface-1) !important;',
        '  color: var(--m3-primary) !important;',
        '  transform: translateY(-2px);',
        '}',
        '/* Fix white highlight ghost on action buttons */',
        '#buttonActionDetail .bg-white {',
        '  background: transparent !important;',
        '  border: none !important;',
        '  padding: 0 !important;',
        '  box-shadow: none !important;',
        '}',
        '#buttonActionDetail a .text-white, #buttonActionDetail button .text-white {',
        '  color: inherit !important;',
        '}',
        '/* Universal ghost-highlight reset: catches any nested wrapper */',
        '/* (icon badges, Tailwind opacity-suffixed classes like bg-white/10, */',
        '/* etc.) regardless of exact class name, on all 3 action buttons. */',
        '#ruteCoordinate *, #riwayatSppt *, #riwayatPenugasan * {',
        '  background: transparent !important;',
        '  background-color: transparent !important;',
        '  border: none !important;',
        '  box-shadow: none !important;',
        '  outline: none !important;',
        '  padding: 0 !important;',
        '}',
        '#riwayatSppt, #riwayatPenugasan {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 20px !important;',
        '  font-weight: 700 !important;',
        '  font-size: 12px !important;',
        '  height: 38px !important;',
        '  padding: 0 16px !important;',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '}',
        '#riwayatSppt svg, #riwayatPenugasan svg {',
        '  display: none !important;',
        '}',
        '/* eCT: same green system as LUNAS badges */',
        '#riwayatSppt {',
        '  background-color: var(--m3-secondary-container) !important;',
        '  border: 1px solid rgba(126, 231, 135, 0.2) !important;',
        '  color: var(--m3-success) !important;',
        '  padding: 0 24px !important;',
        '  min-width: 152px !important;',
        '}',
        '#riwayatSppt:hover {',
        '  background-color: var(--m3-secondary-container) !important;',
        '  filter: brightness(0.93);',
        '  color: var(--m3-success) !important;',
        '}',

        // ── Riwayat Cards (compact) ──
        '#riwayatSpptCard { margin-top: 12px !important; }',
        '/* Full-width rows: remove the side padding that was insetting them */',
        '#riwayatSpptCard > .p-3.space-y-3 {',
        '  padding-left: 0 !important;',
        '  padding-right: 0 !important;',
        '}',
        '#listRiwayat {',
        '  gap: 0 !important;',
        '  display: flex;',
        '  flex-direction: column;',
        '  padding: 0 !important;',
        '}',
        '/* Was Tailwind\'s max-h-72 (288px, ~3-4 cards). Sized for ~5 full */',
        '/* compact rows plus a peek of the 6th as a scroll hint. */',
        '#listRiwayat {',
        '  max-height: 350px !important;',
        '}',
        '/* Tailwind space-y-3 on #listRiwayat stacks on top of our flex gap above. Neutralize it so spacing is controlled by gap alone. */',
        '#listRiwayat > :not([hidden]) ~ :not([hidden]) {',
        '  margin-top: 0 !important;',
        '}',
        '.overflow-auto, #listRiwayat {',
        '  scrollbar-width: thin;',
        '  scrollbar-color: var(--m3-outline) var(--m3-surface);',
        '}',
        '/* WebKit: hide the up/down scrollbar arrow buttons, keep a plain thin thumb */',
        '#listRiwayat::-webkit-scrollbar {',
        '  width: 6px;',
        '}',
        '#listRiwayat::-webkit-scrollbar-track {',
        '  background: transparent;',
        '}',
        '#listRiwayat::-webkit-scrollbar-thumb {',
        '  background: var(--m3-outline);',
        '  border-radius: 999px;',
        '}',
        '#listRiwayat::-webkit-scrollbar-button {',
        '  display: none;',
        '  width: 0;',
        '  height: 0;',
        '}',
        '/* Flat full-width row, no card box/shadow — alternating tint + a clearer divider */',
        '#listRiwayat .flex.flex-col.bg-white {',
        '  background: transparent !important;',
        '  border: none !important;',
        '  border-bottom: 2px solid var(--m3-outline) !important;',
        '  border-radius: 0 !important;',
        '  padding: 10px 14px !important;',
        '  box-shadow: none !important;',
        '}',
        '#listRiwayat .flex.flex-col.bg-white:nth-child(even) {',
        '  background: var(--m3-surface-2) !important;',
        '}',
        '#listRiwayat .flex.flex-col.bg-white:last-child {',
        '  border-bottom: none !important;',
        '}',
        '/* Tighten the 2 internal rows per entry (Tailwind space-y-2 default is 8px) */',
        '#listRiwayat .flex.flex-col.bg-white > :not([hidden]) ~ :not([hidden]) {',
        '  margin-top: 4px !important;',
        '}',
        '/* New 2-row layout (built by compactRiwayatCard() below): */',
        '/* row1 = year | amount + denda | date  —  row2 = jumlah bayar | total | LUNAS */',
        '/* Both rows share the same grid columns so the pokok amount (row1) and the */',
        '/* total amount (row2) land at the same x-position, regardless of how long */',
        '/* "2024" vs "Jumlah Bayar:" happen to be — flex space-between couldn\'t */',
        '/* guarantee that since the offset would shift with the date/badge width too. */',
        '#listRiwayat .tm-riwayat-row1, #listRiwayat .tm-riwayat-row2 {',
        '  display: grid;',
        '  grid-template-columns: 90px 1fr auto;',
        '  column-gap: 6px;',
        '  align-items: baseline;',
        '}',
        '#listRiwayat .tm-riwayat-row1 {',
        '  border-bottom: 1px solid var(--m3-outline) !important;',
        '  padding-bottom: 4px !important;',
        '}',
        '/* Badge is a padded pill, not plain text — baseline alignment looks off on it specifically */',
        '#listRiwayat .tm-riwayat-row2 > .bg-green-500,',
        '#listRiwayat .tm-riwayat-row2 > .bg-red-500,',
        '#listRiwayat .tm-riwayat-row2 > .bg-red-600 {',
        '  align-self: center;',
        '}',
        '#listRiwayat .tm-riwayat-row1 > .font-bold {',
        '  white-space: nowrap;',
        '  font-size: 15px !important;',
        '  font-weight: 700 !important;',
        '  justify-self: end;',
        '}',
        '#listRiwayat .tm-riwayat-row1 > div:last-child {',
        '  color: var(--m3-on-surface-variant) !important;',
        '  font-size: 13px !important;',
        '  font-weight: 400 !important;',
        '  white-space: nowrap;',
        '}',
        '#listRiwayat .tm-riwayat-row2 > .text-xs {',
        '  justify-self: end;',
        '  white-space: nowrap;',
        '}',
        '#listRiwayat .tm-riwayat-amount-combo {',
        '  display: flex;',
        '  align-items: baseline;',
        '  gap: 4px;',
        '  white-space: nowrap;',
        '  overflow: hidden;',
        '  min-width: 0;',
        '}',
        '#listRiwayat .tm-riwayat-amount-combo .text-md {',
        '  font-size: 14px !important;',
        '  font-weight: 400 !important;',
        '}',
        '#listRiwayat .tm-riwayat-sep {',
        '  color: var(--m3-on-surface-variant) !important;',
        '  font-weight: 400 !important;',
        '}',
        '#listRiwayat .text-md {',
        '  font-size: 15px !important;',
        '  font-weight: 400 !important;',
        '  line-height: 1.3 !important;',
        '}',
        '#listRiwayat .text-xs {',
        '  color: var(--m3-on-surface-variant) !important;',
        '  font-size: 10px !important;',
        '  font-weight: 400 !important;',
        '}',
        '/* Declared after .text-xs so red wins on elements carrying both classes */',
        '#listRiwayat .text-red-600 { color: var(--m3-error) !important; }',
        '/* BELUM LUNAS keeps white on red; LUNAS uses darker success text via .bg-green-500 below */',
        '#listRiwayat .text-white:not(.bg-green-500) {',
        '  color: #ffffff !important;',
        '  font-weight: 400 !important;',
        '}',
        '#listRiwayat .bg-green-500 {',
        '  background-color: var(--m3-secondary-container) !important;',
        '  color: var(--m3-success) !important;',
        '  border-radius: 6px !important;',
        '}',
        '#listRiwayat .bg-red-500, #listRiwayat .bg-red-600 {',
        '  background-color: var(--m3-error) !important;',
        '  color: #ffffff !important;',
        '  border-radius: 6px !important;',
        '}',

        // ── Legend & Layers ──
        '#legend, #layers { padding: 16px !important; font-size: 14px !important; }',
        '#legend .flex.items-center { margin-bottom: 8px; }',

        // ── Close Buttons ──
        '#closeDetail, #closeRiwayatSppt, #closeRiwayatPenugasan, #closeDesa, #closeNama {',
        '  background: transparent !important;',
        '  border: none !important;',
        '  color: var(--m3-on-surface-variant) !important;',
        '  transition: color 0.2s ease, transform 0.2s ease;',
        '}',
        '#closeDetail:hover, #closeRiwayatSppt:hover, #closeRiwayatPenugasan:hover, #closeDesa:hover, #closeNama:hover {',
        '  color: var(--m3-on-surface) !important;',
        '  transform: scale(1.1);',
        '}',

        // ── Map Popup ──
        '.ol-popup {',
        '  background-color: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 12px !important;',
        '  box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '.ol-popup:after { border-top-color: var(--m3-surface-1) !important; }',
        '.ol-popup:before { border-top-color: var(--m3-outline) !important; }',
        '.ol-popup-closer { color: var(--m3-on-surface-variant) !important; text-decoration: none !important; }',

        // ── Mouse Position ──
        '.mousePosition {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 8px 0 0 0 !important;',
        '  font-size: 11px !important;',
        '  font-weight: bold !important;',
        '}',

        // ── Theme Toggle FAB ──
        '#tm-theme-toggle {',
        '  position: fixed;',
        '  bottom: 40px;',
        '  right: 20px;',
        '  z-index: 9999;',
        '  width: 44px;',
        '  height: 44px;',
        '  border-radius: 50%;',
        '  border: 1px solid var(--m3-outline);',
        '  background: var(--m3-surface-1);',
        '  color: var(--m3-on-surface);',
        '  font-size: 18px;',
        '  cursor: pointer;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,0.4);',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  transition: transform 0.15s, box-shadow 0.15s, background 0.2s;',
        '}',
        'html.tm-light #tm-theme-toggle { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }',
        '#tm-theme-toggle:hover {',
        '  transform: scale(1.1);',
        '  background: var(--m3-surface-2);',
        '}',
        '',
        '/* ── Inner Wrapper Background Refinements ── */',
        '#infoDetail .bg-white, #riwayatSpptCard .bg-white, #riwayatPenugasanCard .bg-white, #listVillage .bg-white, #interactionForm, #interactionForm .bg-white {',
        '  background-color: var(--m3-surface-1) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '',
        '/* ── Bootstrap Card and List styling within panels ── */',
        '#infoDetail .card, #listVillage .card, #searchName .card, #interactionForm .card {',
        '  background: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '#infoDetail .card-header, #listVillage .card-header, #searchName .card-header, #interactionForm .card-header {',
        '  background: var(--m3-surface-2) !important;',
        '  border-bottom: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '#infoDetail .card-body, #listVillage .card-body, #searchName .card-body, #interactionForm .card-body {',
        '  background: var(--m3-surface-1) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '',
        '/* ── Accordion elements and links ── */',
        '#accordion .card-header button, #accordion .card-header a {',
        '  color: var(--m3-on-surface) !important;',
        '  font-weight: 700 !important;',
        '  text-decoration: none !important;',
        '  transition: color 0.2s ease;',
        '}',
        '#accordion .card-header button:hover, #accordion .card-header a:hover {',
        '  color: var(--m3-primary) !important;',
        '}',
        '#accordion .card-body {',
        '  background-color: var(--m3-surface-1) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '',
        '/* ── Custom Select inputs ── */',
        '.custom-select {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 8px !important;',
        '  padding: 6px 12px !important;',
        '}',
        '',
        '/* ── Global WebKit Scrollbars ── */',
        '::-webkit-scrollbar {',
        '  width: 8px;',
        '  height: 8px;',
        '}',
        '::-webkit-scrollbar-track {',
        '  background: var(--m3-surface) !important;',
        '}',
        '::-webkit-scrollbar-thumb {',
        '  background: var(--m3-outline) !important;',
        '  border-radius: 4px !important;',
        '}',
        '::-webkit-scrollbar-thumb:hover {',
        '  background: var(--m3-on-surface-variant) !important;',
        '}',
        '',
        '/* ── Select2 Dropdown Refinements ── */',
        '.select2-dropdown {',
        '  background-color: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '.select2-results__option {',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '.select2-results__option--highlighted[aria-selected], .select2-results__option--highlighted {',
        '  background-color: var(--m3-primary-container) !important;',
        '  color: var(--m3-primary) !important;',
        '}',
        '.select2-container--default .select2-search--dropdown .select2-search__field {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 4px !important;',
        '}',
        '',
        '/* ── OpenLayers Layer Switcher Extension ── */',
        '.layer-switcher {',
        '  background-color: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 12px !important;',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '.layer-switcher button {',
        '  background-color: var(--m3-surface-1) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border-radius: 50% !important;',
        '  width: 36px !important;',
        '  height: 36px !important;',
        '  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;',
        '  transition: all 0.2s ease !important;',
        '}',
        'html.tm-light .layer-switcher button {',
        '  box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;',
        '}',
        '.layer-switcher button:hover, .layer-switcher button:focus {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-primary) !important;',
        '}',
        '.layer-switcher label {',
        '  color: var(--m3-on-surface) !important;',
        '}',
        '',
        '/* ── Interaction Form Inputs & Buttons ── */',
        '#interactionForm input[type="text"], #interactionForm input[type="file"], #interactionForm textarea {',
        '  background-color: var(--m3-surface-2) !important;',
        '  color: var(--m3-on-surface) !important;',
        '  border: 1px solid var(--m3-outline) !important;',
        '  border-radius: 8px !important;',
        '}',
        '#interactionForm .btn-success, #interactionForm button {',
        '  background-color: var(--m3-success) !important;',
        '  color: var(--m3-surface-1) !important;',
        '  border: none !important;',
        '  border-radius: 20px !important;',
        '  padding: 8px 24px !important;',
        '  font-weight: 700 !important;',
        '}',
    ].join('\n');

    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    console.log('[TM-VMap] Styles injected');

    // ── Theme Toggle Button ──
    var isLight = function () { return document.documentElement.classList.contains('tm-light'); };
    var btn = document.createElement('button');
    btn.id = 'tm-theme-toggle';
    btn.title = 'Toggle light / dark mode';
    btn.textContent = isLight() ? '\uD83C\uDF19' : '\u2600\uFE0F';
    btn.addEventListener('click', function () {
        var nowLight = document.documentElement.classList.toggle('tm-light');
        btn.textContent = nowLight ? '\uD83C\uDF19' : '\u2600\uFE0F';
        setTheme(nowLight ? 'light' : 'dark');
    });
    document.body.appendChild(btn);
    console.log('[TM-VMap] Theme toggle created');

    // ── Cross-tab sync ──
    window.addEventListener('storage', function (e) {
        if (e.key === 'tm-theme') {
            if (e.newValue === 'light') {
                document.documentElement.classList.add('tm-light');
            } else {
                document.documentElement.classList.remove('tm-light');
            }
            btn.textContent = (e.newValue === 'light') ? '\uD83C\uDF19' : '\u2600\uFE0F';
        }
    });

    var isRowsHidden = false;

    // ── NOP Formatter + Format Toggle ──
    // Strips the NOP down to digits-only by default, removes the static
    // "DETAIL NOP" label text node from its parent, and adds small dot
    // toggles (opposite side of the close button) for NOP format and detail rows visibility.
    function observeNop() {
        var target = document.getElementById('d_nop');
        if (!target) return;

        var isFormatted = false;

        var rawDigits = function () {
            return (target.textContent || '').replace(/\D/g, '');
        };

        var formatNop = function (digits) {
            if (!digits || digits.length !== 18) return digits; // unexpected length — show raw, don't guess
            return digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 7) + '.' +
                digits.slice(7, 10) + '.' + digits.slice(10, 13) + '-' + digits.slice(13, 17) + '.' + digits.slice(17);
        };

        var render = function () {
            var digits = rawDigits();
            if (!digits) return;
            var display = isFormatted ? formatNop(digits) : digits;
            if (target.textContent !== display) {
                target.textContent = display;
            }
        };

        var stripLabel = function () {
            var parent = target.parentElement;
            if (!parent) return;
            var node = parent.firstChild;
            while (node) {
                var next = node.nextSibling;
                if (node.nodeType === 3) { // plain text node, e.g. "DETAIL NOP \u00a0"
                    parent.removeChild(node);
                }
                node = next;
            }
        };

        var observer = new MutationObserver(function () {
            observer.disconnect();
            render();
            stripLabel();
            observer.observe(target, { characterData: true, childList: true, subtree: true });
        });

        observer.observe(target, { characterData: true, childList: true, subtree: true });
        render(); // Initial run
        stripLabel();

        // ── Toggle buttons: opposite side of the close (X) button ──
        var header = target.closest('.bg-gray-100');
        if (header) {
            if (!document.getElementById('tmNopToggle')) {
                var toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.id = 'tmNopToggle';
                toggleBtn.className = 'tm-nop-toggle';
                toggleBtn.setAttribute('aria-label', 'Tampilkan format NOP');
                toggleBtn.setAttribute('aria-pressed', 'false');
                toggleBtn.textContent = '\u25CF'; // small filled dot
                toggleBtn.addEventListener('click', function () {
                    isFormatted = !isFormatted;
                    toggleBtn.setAttribute('aria-pressed', isFormatted ? 'true' : 'false');
                    toggleBtn.classList.toggle('tm-active', isFormatted);
                    render();
                });
                header.insertBefore(toggleBtn, header.firstChild);
            }

            if (!document.getElementById('tmRowsToggle')) {
                var rowsBtn = document.createElement('button');
                rowsBtn.type = 'button';
                rowsBtn.id = 'tmRowsToggle';
                rowsBtn.className = 'tm-nop-toggle';
                rowsBtn.setAttribute('aria-label', 'Sembunyikan / Tampilkan baris detail');
                rowsBtn.setAttribute('aria-pressed', isRowsHidden ? 'true' : 'false');
                if (isRowsHidden) rowsBtn.classList.add('tm-active');
                rowsBtn.textContent = '\u25CB'; // small hollow circle dot
                rowsBtn.addEventListener('click', function () {
                    isRowsHidden = !isRowsHidden;
                    rowsBtn.setAttribute('aria-pressed', isRowsHidden ? 'true' : 'false');
                    rowsBtn.classList.toggle('tm-active', isRowsHidden);
                    var detailOp = document.getElementById('detail-op');
                    if (detailOp) {
                        detailOp.classList.toggle('tm-rows-hidden', isRowsHidden);
                    }
                });
                var nopBtn = document.getElementById('tmNopToggle');
                if (nopBtn && nopBtn.nextSibling) {
                    header.insertBefore(rowsBtn, nopBtn.nextSibling);
                } else {
                    header.insertBefore(rowsBtn, header.firstChild);
                }
            }
        }
    }

    // ── Coordinate extraction + clipboard helper ──
    // Parse coordinates from the live Google Maps URL instead of hardcoding
    // site-specific values; supports both search and directions URL formats.
    function getRuteCoordinates(el) {
        var href = el && (el.getAttribute('href') || '');
        var match = href.match(/(-?\d{1,3}\.\d+)\s*,\s*(?:%20)?(-?\d{1,3}\.\d+)/i);
        if (!match) return null;
        return match[1] + ',' + match[2];
    }

    function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        // Fallback for mobile browsers/userscript contexts without Clipboard API.
        return new Promise(function (resolve, reject) {
            var field = document.createElement('textarea');
            field.value = text;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            field.style.pointerEvents = 'none';
            document.body.appendChild(field);
            field.select();
            field.setSelectionRange(0, field.value.length);
            var copied = false;
            try { copied = document.execCommand('copy'); } catch (e) { /* denied */ }
            document.body.removeChild(field);
            if (copied) resolve();
            else reject(new Error('Clipboard copy was denied'));
        });
    }

    function installCoordinateCopyButton(link) {
        if (!link || document.getElementById('tmCopyCoordinate')) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.id = 'tmCopyCoordinate';
        button.className = 'tm-copy-coordinate';
        button.setAttribute('aria-label', 'Salin koordinat');
        button.setAttribute('title', 'Salin koordinat');
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"></path></svg>';
        button.addEventListener('click', function () {
            var coordinates = getRuteCoordinates(link);
            if (!coordinates) {
                button.setAttribute('aria-label', 'Koordinat tidak tersedia');
                return;
            }
            copyTextToClipboard(coordinates).then(function () {
                button.classList.add('tm-copied');
                button.setAttribute('aria-label', 'Koordinat disalin: ' + coordinates);
                button.setAttribute('title', 'Koordinat disalin');
                window.setTimeout(function () {
                    button.classList.remove('tm-copied');
                    button.setAttribute('aria-label', 'Salin koordinat');
                    button.setAttribute('title', 'Salin koordinat');
                }, 1400);
            }).catch(function (error) {
                console.warn('[TM-VMap] Coordinate copy failed:', error);
                button.setAttribute('aria-label', 'Gagal menyalin koordinat');
            });
        });

        var actions = link.parentElement;
        if (actions) actions.insertBefore(button, link.nextSibling);
    }

    // ── Rute Link Formatter MutationObserver ──
    function observeRute() {
        var el = document.getElementById('ruteCoordinate');
        if (!el) return;
        installCoordinateCopyButton(el);

        var formatHref = function () {
            var href = el.getAttribute('href') || '';
            if (href && href.indexOf('/maps/dir/') !== -1) {
                var match = href.match(/\/(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                    var lat = match[1];
                    var lng = match[2];
                    var newHref = 'https://www.google.com/maps/search/' + lat + ',%20' + lng + '/data=!3m2!1e3!4b1';
                    el.setAttribute('href', newHref);
                    console.log('[TM-VMap] Href updated for ruteCoordinate:', newHref);
                }
            }
        };

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'href') {
                    formatHref();
                }
            });
        });

        observer.observe(el, { attributes: true, attributeFilter: ['href'] });
        formatHref(); // Initial run
    }

    // ── Static Label Override MutationObserver ──
    // Forces a fixed text label on a button, re-applying it if the
    // underlying framework re-renders the element's inner content.
    function observeStaticLabel(id, label) {
        var el = document.getElementById(id);
        if (!el) return;

        var apply = function () {
            if (el.textContent.trim() !== label) {
                observer.disconnect();
                el.textContent = label;
                observer.observe(el, { characterData: true, childList: true, subtree: true });
            }
        };

        var observer = new MutationObserver(apply);
        observer.observe(el, { characterData: true, childList: true, subtree: true });
        apply(); // Initial run
    }

    // ── Riwayat Card Compactor ──
    // Original markup per card is 3 rows / 5 visual lines:
    //   row0: "Th. <year>"            <date>
    //   row1: "Rp <amount>"
    //         "Rp <denda>"            (red, omitted below if it's Rp 0)
    //   row2: "Jumlah Bayar"
    //         "Rp <total>"            [LUNAS badge]
    // This collapses it to 2 rows:
    //   row1: <year>   "Rp <amount> + Rp <denda>"   <date>
    //   row2: "Jumlah Bayar: Rp <total>"             [LUNAS badge]
    // Existing DOM nodes (badge, amounts) are moved rather than re-created
    // so their classes/colors (e.g. a non-LUNAS status badge) are preserved.
    function isZeroAmount(text) {
        var digits = (text || '').replace(/\D/g, '');
        return !digits || /^0+$/.test(digits);
    }

    function compactRiwayatCard(card) {
        if (!card || card.nodeType !== 1 || card.getAttribute('data-tm-compact') === '1') return;
        if (card.children.length < 3) return;

        try {
            var row0 = card.children[0]; // "Th. <year>" + date, border-b
            var row1 = card.children[1]; // amount + denda
            var row2 = card.children[2]; // jumlah bayar wrap + badge

            var yearEl = row0.children[0];
            var dateEl = row0.children[1];
            var amountEl = row1.children[0];
            var dendaEl = row1.children[1];
            var jumlahWrap = row2.children[0];
            var lunasBadge = row2.children[1];

            // Bail out untouched if the site's markup doesn't match what we expect.
            if (!yearEl || !dateEl || !amountEl || !jumlahWrap) return;

            var labelEl = jumlahWrap.children[0];
            var totalEl = jumlahWrap.children[1];

            yearEl.textContent = (yearEl.textContent || '').replace(/^Th\.\s*/i, '').trim();
            if (labelEl) labelEl.textContent = (labelEl.textContent || '').trim() + ':';

            // ── New row 1: year | amount (+ denda) | date ──
            var newRow1 = document.createElement('div');
            newRow1.className = 'tm-riwayat-row1';
            newRow1.appendChild(yearEl);

            var amountCombo = document.createElement('div');
            amountCombo.className = 'tm-riwayat-amount-combo';
            amountCombo.appendChild(amountEl);
            if (dendaEl && !isZeroAmount(dendaEl.textContent)) {
                var sep = document.createElement('span');
                sep.className = 'tm-riwayat-sep';
                sep.textContent = '+';
                amountCombo.appendChild(sep);
                amountCombo.appendChild(dendaEl);
            }
            newRow1.appendChild(amountCombo);
            newRow1.appendChild(dateEl);

            // ── New row 2: "Jumlah Bayar:" | <total> | badge ──
            // (label, total, and badge as 3 separate grid items — same column
            // template as row1's year/amount/date — so the total's leading
            // edge lands at the exact same x-position as the pokok amount above)
            var newRow2 = document.createElement('div');
            newRow2.className = 'tm-riwayat-row2';
            if (labelEl) newRow2.appendChild(labelEl);
            if (totalEl) newRow2.appendChild(totalEl);
            if (lunasBadge) newRow2.appendChild(lunasBadge);

            // row0/row1/row2 are now emptied out (their children were moved above)
            card.removeChild(row0);
            card.removeChild(row1);
            card.removeChild(row2);

            card.appendChild(newRow1);
            card.appendChild(newRow2);

            card.setAttribute('data-tm-compact', '1');
        } catch (e) {
            console.error('[TM-VMap] Failed to compact a riwayat card:', e);
        }
    }

    function observeRiwayatList() {
        var list = document.getElementById('listRiwayat');
        if (!list) return;

        var processAll = function () {
            observer.disconnect();
            var uncompacted = list.querySelectorAll('> div:not([data-tm-compact="1"])');
            for (var i = 0; i < uncompacted.length; i++) {
                compactRiwayatCard(uncompacted[i]);
            }
            shrinkStatusBadges(list);
            observer.observe(list, { childList: true, subtree: true });
        };

        var scheduled = false;
        var schedule = function () {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(function () {
                scheduled = false;
                processAll();
            });
        };

        var observer = new MutationObserver(schedule);
        observer.observe(list, { childList: true, subtree: true });
        schedule(); // Initial run
    }

    // ── SPPT year emphasis ──
    // "SPPT TAHUN 2026" → wrap the year so it can render one size up + bold.
    function emphasizeSpptYear(container) {
        if (!container) return;

        var labels = container.querySelectorAll('.text-xs');
        for (var i = 0; i < labels.length; i++) {
            var el = labels[i];
            if (el.querySelector('.tm-sppt-year')) continue;

            var text = (el.textContent || '').trim();
            var match = text.match(/^SPPT\s+TAHUN\s+(\d{4})$/i);
            if (!match) continue;

            el.textContent = 'SPPT TAHUN ';
            var yearSpan = document.createElement('span');
            yearSpan.className = 'tm-sppt-year';
            yearSpan.textContent = match[1];
            el.appendChild(yearSpan);
        }
    }

    // ── Status badge shrink-wrap ──
    // Site uses bg-red-500 (not bg-red-600) for BELUM LUNAS; tag wrappers so
    // the colored pill hugs its text instead of stretching full column width.
    // Also forces color/size/weight/case via inline style: .text-xs (for
    // sizing only) otherwise out-specifies the badge color rules inside
    // #detail-op specifically, which was rendering LUNAS gray instead of green.
    function shrinkStatusBadges(root) {
        if (!root) return;

        var pills = root.querySelectorAll('.bg-green-500, .bg-red-500, .bg-red-600');
        for (var i = 0; i < pills.length; i++) {
            var pill = pills[i];
            pill.style.setProperty('display', 'inline-block', 'important');
            pill.style.setProperty('width', 'fit-content', 'important');
            pill.style.setProperty('text-transform', 'none', 'important');
            pill.style.setProperty('letter-spacing', 'normal', 'important');
            pill.style.setProperty('font-size', '12px', 'important');
            pill.style.setProperty('font-weight', '400', 'important');
            pill.style.setProperty('margin-bottom', '0', 'important');
            pill.style.setProperty('color', pill.classList.contains('bg-green-500') ? 'var(--m3-success)' : '#ffffff', 'important');

            var wrap = pill.parentElement;
            if (!wrap || wrap.classList.contains('tm-wp-name')) continue;
            wrap.classList.add('tm-status-wrap');
        }
    }

    // ── Detail Panel Restructure ──
    // 1) NAMA WP loses its caption and becomes a bigger name line, with a
    //    small chevron toggle next to it.
    // 2) ALAMAT WP / KODE POS WP / NO. TELP WP / NPWP are collapsed behind
    //    that toggle, hidden by default.
    // 3) The 4 property rows (Jenis Tanah/Kode ZNT, Luas Tanah/Njop Bumi,
    //    Luas Bangunan/Njop Bangunan, Tanggal Pendataan/Nip Pendata) are
    //    re-paired into: Luas Tanah+Luas Bangunan, Njop Bumi+Njop Bangunan,
    //    Kode ZNT+Tanggal Pendataan, Jenis Tanah+Nip Pendata.
    // Existing nodes are moved (not re-created) so any future value changes
    // from the page itself keep landing in the right place.
    // Each of the 3 steps below checks its own fields independently, so a
    // single missing/renamed field only skips that one step instead of
    // silently blocking everything else.
    function restructureDetailOp() {
        // Descendant selector (not a strict direct-child) in case the live
        // page wraps this in an extra element the static markup didn't show.
        var container = document.querySelector('#detail-op .flex.flex-col.space-y-2');
        if (!container) return; // not rendered yet — the observer will retry
        if (container.getAttribute('data-tm-restructured') === '1') return;

        try {
            var fieldMap = {};
            var labels = container.querySelectorAll('.text-xs');
            for (var i = 0; i < labels.length; i++) {
                var labelEl = labels[i];
                var valueEl = labelEl.nextElementSibling;
                if (!valueEl) continue;
                var key = (labelEl.textContent || '').trim().toUpperCase();
                if (key && !fieldMap[key]) {
                    fieldMap[key] = { label: labelEl, value: valueEl, block: labelEl.parentElement };
                }
            }
            console.log('[TM-VMap] detail-op fields detected:', Object.keys(fieldMap));

            var hasAll = function (keys) {
                for (var k = 0; k < keys.length; k++) {
                    if (!fieldMap[keys[k]]) return false;
                }
                return true;
            };

            // ── 1) Re-pair the 4 property rows (needs all 8 fields to be safe) ──
            var reorderKeys = ['JENIS TANAH', 'KODE ZNT', 'LUAS TANAH', 'NJOP BUMI/M2',
                'LUAS BANGUNAN', 'NJOP BANGUNAN/M2', 'TANGGAL PENDATAAN', 'NIP PENDATA'];
            if (hasAll(reorderKeys)) {
                var oldRowA = fieldMap['JENIS TANAH'].block.parentElement; // anchor
                var oldRowB = fieldMap['LUAS TANAH'].block.parentElement;
                var oldRowC = fieldMap['LUAS BANGUNAN'].block.parentElement;
                var oldRowD = fieldMap['TANGGAL PENDATAAN'].block.parentElement;

                var makeRow = function (leftKey, rightKey, isToggleable) {
                    var row = document.createElement('div');
                    row.className = 'flex justify-between' + (isToggleable ? ' tm-property-row' : '');
                    row.appendChild(fieldMap[leftKey].block);
                    row.appendChild(fieldMap[rightKey].block);
                    return row;
                };

                var rowLuas = makeRow('LUAS TANAH', 'LUAS BANGUNAN', false);
                var rowNjop = makeRow('NJOP BUMI/M2', 'NJOP BANGUNAN/M2', true);
                var rowZntTanggal = makeRow('KODE ZNT', 'TANGGAL PENDATAAN', true);
                var rowJenisNip = makeRow('JENIS TANAH', 'NIP PENDATA', true);

                // Color-code by category: left column = Tanah (land), right column =
                // Bangunan (building) — consistent across both rows, so the Luas/Njop
                // relationship reads at a glance instead of needing to match text.
                fieldMap['LUAS TANAH'].block.classList.add('tm-cat-tanah');
                fieldMap['NJOP BUMI/M2'].block.classList.add('tm-cat-tanah');
                fieldMap['LUAS BANGUNAN'].block.classList.add('tm-cat-bangunan');
                fieldMap['NJOP BANGUNAN/M2'].block.classList.add('tm-cat-bangunan');

                container.insertBefore(rowLuas, oldRowA);
                container.insertBefore(rowNjop, oldRowA);
                container.insertBefore(rowZntTanggal, oldRowA);
                container.insertBefore(rowJenisNip, oldRowA);

                [oldRowA, oldRowB, oldRowC, oldRowD].forEach(function (oldRow) {
                    if (oldRow && oldRow.parentElement === container) container.removeChild(oldRow);
                });
                console.log('[TM-VMap] detail-op: property rows reordered');
            } else {
                console.log('[TM-VMap] detail-op: skipped reorder, missing one of', reorderKeys);
            }

            // Fallback: tag only specific toggleable detail rows (NJOP, ZNT/Tanggal, Jenis/NIP) with tm-property-row
            var toggleableKeys = ['NJOP BUMI/M2', 'NJOP BANGUNAN/M2', 'KODE ZNT', 'TANGGAL PENDATAAN', 'JENIS TANAH', 'NIP PENDATA'];
            toggleableKeys.forEach(function (k) {
                if (fieldMap[k] && fieldMap[k].block && fieldMap[k].block.parentElement && fieldMap[k].block.parentElement.classList.contains('flex')) {
                    fieldMap[k].block.parentElement.classList.add('tm-property-row');
                }
            });

            // ── 2) NAMA WP: drop caption, enlarge value, add collapse toggle ──
            // (collapses whichever of the 4 contact fields are actually present,
            // rather than requiring all 4)
            if (fieldMap['NAMA WP']) {
                var namaBlock = fieldMap['NAMA WP'].block;
                var nameValueEl = fieldMap['NAMA WP'].value;
                fieldMap['NAMA WP'].label.remove();
                nameValueEl.classList.add('tm-wp-name');

                var nameRow = document.createElement('div');
                nameRow.className = 'tm-wp-name-row';
                nameRow.appendChild(nameValueEl);

                var contactKeys = ['ALAMAT WP', 'KODE POS WP', 'NO. TELP WP', 'NPWP'];
                var presentContactKeys = contactKeys.filter(function (key) { return !!fieldMap[key]; });

                container.insertBefore(nameRow, namaBlock);

                if (presentContactKeys.length) {
                    var toggleBtn = document.createElement('button');
                    toggleBtn.type = 'button';
                    toggleBtn.className = 'tm-wp-toggle';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.setAttribute('aria-label', 'Tampilkan detail WP');
                    toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
                    nameRow.appendChild(toggleBtn);

                    var wpWrapper = document.createElement('div');
                    wpWrapper.className = 'tm-wp-details';
                    presentContactKeys.forEach(function (key) {
                        wpWrapper.appendChild(fieldMap[key].block);
                    });

                    toggleBtn.addEventListener('click', function () {
                        var expanded = wpWrapper.classList.toggle('tm-expanded');
                        toggleBtn.classList.toggle('tm-rotated', expanded);
                        toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                    });

                    container.insertBefore(wpWrapper, namaBlock);
                }

                container.removeChild(namaBlock);
                console.log('[TM-VMap] detail-op: NAMA WP restyled, collapsed fields:', presentContactKeys);
            } else {
                console.log('[TM-VMap] detail-op: NAMA WP not found, skipped name/collapse step');
            }

            container.setAttribute('data-tm-restructured', '1');
        } catch (e) {
            console.error('[TM-VMap] Failed to restructure detail-op:', e);
        }
    }

    function observeDetailOp() {
        var target = document.getElementById('detail-op');
        if (!target) return;

        var scheduled = false;
        var schedule = function () {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(function () {
                scheduled = false;
                observer.disconnect();
                var container = document.querySelector('#detail-op .flex.flex-col.space-y-2');
                if (container) {
                    emphasizeSpptYear(container);
                    shrinkStatusBadges(container);
                    restructureDetailOp();
                }
                target.classList.toggle('tm-rows-hidden', isRowsHidden);
                observer.observe(target, { childList: true, subtree: true });
            });
        };

        var observer = new MutationObserver(schedule);
        observer.observe(target, { childList: true, subtree: true });
        schedule(); // Initial run
    }

    try {
        observeNop();
        console.log('[TM-VMap] NOP observer initialized');
        observeRute();
        console.log('[TM-VMap] Rute link observer initialized');
        observeStaticLabel('riwayatSppt', 'eCT');
        console.log('[TM-VMap] riwayatSppt label override initialized');
        observeStaticLabel('riwayatPenugasan', '?');
        console.log('[TM-VMap] riwayatPenugasan label override initialized');
        observeRiwayatList();
        console.log('[TM-VMap] Riwayat list compactor initialized');
        observeDetailOp();
        console.log('[TM-VMap] Detail panel restructure initialized');
    } catch (e) {
        console.error('[TM-VMap] Failed to initialize observers:', e);
    }

    console.log('[TM-VMap] Fully initialized');
})();
