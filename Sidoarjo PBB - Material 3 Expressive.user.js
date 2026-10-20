// ==UserScript==
// @name         Sidoarjo PBB - Material 3 Expressive
// @namespace    http://tampermonkey.net/
// @version      1.2.9
// @description  Material 3 light-by-default GovTech layout with responsive grid forms, hidden sidebar, compact spacing, and self-healing SPOP/LSPOP sections.
// @author       You
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n01-form/*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n02-form/*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n03-form/*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n01-form/*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n02-form/*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n03-form/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log(
        '%c[TM USERSCRIPT] Sidoarjo PBB v1.2.9 — script is running',
        'background:#6200ee;color:#fff;padding:3px 8px;border-radius:4px;font-weight:bold;'
    );

    // v1.1.5: declared here (top of IIFE, executes immediately) rather than
    // next to injectCardToggles() further down — a `let` further down
    // stays in the temporal dead zone until its own line runs, and scan()
    // (called near the bottom of the file, but earlier in execution order
    // than that later `let` line) was calling injectCardToggles() before
    // the flag existed yet, throwing "Cannot access before initialization"
    // on every single scan() pass.
    let tmNoHeaderLogged = false;

    /* ─── Cleanup registry ─── */
    const _cleanups = [];
    const onUnload = fn => _cleanups.push(fn);
    window.addEventListener('pagehide', () => _cleanups.forEach(fn => fn()), { once: true });

    /* ─── Safe LocalStorage Exception Wrappers ─── */
    function safeGetStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('LocalStorage read blocked by browser privacy policies:', e);
            return null;
        }
    }

    /* ─── Standard DOM Injection for Added Style Patches ─── */
    const patchStyle = document.createElement('style');
    patchStyle.textContent = `
        /* ─── Added Patch: Select2 Floating Dropdown Depth Fixes ─── */
        .select2-container--open {
            z-index: 9999999 !important;
        }
        .select2-container--default .select2-dropdown {
            background-color: var(--m3-surface, #0D1117) !important;
            border-color: var(--m3-outline, #30363D) !important;
            color: var(--m3-on-surface, #C9D1D9) !important;
        }
    `;
    (document.head || document.documentElement).appendChild(patchStyle);

    /* ─── Font ─── */
    document.head.appendChild(
        Object.assign(document.createElement('link'), {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap'
        })
    );

    /* ─── Material 3 Expressive Dark ─── */
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        :root {
            --m3-surface: #0D1117;
            --m3-surface-1: #161B22;
            --m3-surface-2: #1C2128;
            --m3-outline: #30363D;
            --m3-on-surface: #E1E3E5;
            --m3-on-surface-variant: #A8B0B8;
            --m3-primary: #79C0FF;
            --m3-primary-container: #1D3A5C;
            --m3-secondary-container: #1F4D2E;
            --m3-error: #FF7B72;
            --m3-tertiary: #FFD6A5;
            /* v1.0.9: single radius token, Fluent/GovTech-scale (was hardcoded
               16px on cards, 8px on inputs/buttons — two competing scales).
               Everything below reads --m3-radius-lg for containers (cards,
               dropdowns, modals) and --m3-radius-sm for controls (inputs,
               buttons, chips), so a future density pass only touches 2 values. */
            --m3-radius-lg: 10px;
            --m3-radius-sm: 6px;
        }
        html, body, .page-wrapper, .container-fluid {
            background: var(--m3-surface) !important;
            color: var(--m3-on-surface) !important;
            font-family: 'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            -webkit-font-smoothing: antialiased;
        }
        /* Empty breadcrumb bar (page title + right-side toolbar that never
           actually get populated on this page) — just wastes vertical
           space at the top. */
        .page-breadcrumb { display: none !important; }
        /* v1.0.9: 16/24 -> 12/20. Saves ~8px top-of-page and ~8px per side
           on wide screens without the content feeling edge-to-edge. */
        .container-fluid { padding: 12px 20px; }
        @media (min-width: 1400px) { .container-fluid { max-width: 1600px; margin: 0 auto; } }
        .row { --bs-gutter-x: 16px !important; }
        .card {
            background: var(--m3-surface-1) !important;
            border: 1px solid var(--m3-outline) !important;
            border-radius: var(--m3-radius-lg) !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important;
            margin-bottom: 12px !important;
            transition: box-shadow .2s ease;
            overflow: hidden !important;
        }
        .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }
        .card-header {
            background: transparent !important;
            border-bottom: 1px solid var(--m3-outline) !important;
            border-radius: 0 !important;
            padding: 10px 16px !important;
            /* v1.0.35: fixed min-height + flex centering so every header
               is the same height whether or not it carries a Tambah
               button (32px tall + 20px v-padding = 52px). Without this,
               a header with a button auto-grows to 52px while a plain
               title-only header (e.g. Konfirmasi) only reaches ~39px,
               so cards sharing a row (LSPOP/Konfirmasi) visibly
               mismatch. */
            min-height: 52px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
        }
        .card-header:first-child { border-radius: var(--m3-radius-lg) var(--m3-radius-lg) 0 0 !important; }
        .card-header > a {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            gap: 12px;
        }
        .card-header h4 {
            color: var(--m3-on-surface) !important;
            font-size: 16px !important;
            font-weight: 700;
            letter-spacing: 0.015em;
            margin: 0 !important;
        }
        /* ─── Section accent colors: distinct per card, so each is instantly recognizable ─── */
        #headingPemohon, #headingSyarat, #headingRiwayat,
        #headingPermohonan, #headinglspop, #headingApproval {
            border-bottom: none !important;
        }
        #headingPemohon { background: #3B82F6 !important; }
        #headingPemohon h4 { color: #fff !important; }
        #headingSyarat { background: #F5A623 !important; }
        #headingSyarat h4 { color: #3D2A00 !important; }
        /* Riwayat: most saturated of the six, for clear at-a-glance differentiation */
        #headingRiwayat { background: #E11D48 !important; }
        #headingRiwayat h4 { color: #fff !important; }
        #headingPermohonan { background: #10B981 !important; }
        #headingPermohonan h4 { color: #fff !important; }
        #headinglspop { background: #06B6D4 !important; }
        #headinglspop h4 { color: #fff !important; }
        #headingApproval { background: #6366F1 !important; }
        #headingApproval h4 { color: #fff !important; }
        .card-body {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            padding: 12px 14px !important;
            overflow: visible !important;
        }
        .card-body .table { border-radius: 0 !important; }
        .card-body .table-responsive { border-radius: var(--m3-radius-sm) !important; overflow: hidden !important; }
        .card-body .w-100.text-center {
            border-bottom-color: var(--m3-outline) !important;
            margin: 2px 0 4px !important;
        }
        /* Persyaratan's requirements table: width:100% alone isn't a hard
           cap in the default table-layout:auto — the browser will still
           grow the table past its container if a cell's content can't
           shrink enough (here, the "Lihat" button column has a fixed
           min-width + white-space:nowrap). table-layout:fixed makes
           width:100% actually binding; giving the button column an
           explicit width lets the label column take the remainder and
           wrap normally instead of forcing overflow.
           Not scoped to .tm-triple-shell — n2n03-form uses a native
           col-lg-8/col-lg-4 Bootstrap layout instead of that wrapper, but
           has the exact same Persyaratan table pattern and overflow risk. */
        .card-body table.w-100 {
            table-layout: fixed !important;
            width: 100% !important;
        }
        .card-body table.w-100 td:last-child,
        .card-body table.w-100 th:last-child {
            width: 100px !important;
        }
        .card-body table.w-100 td:first-child,
        .card-body table.w-100 th:first-child {
            overflow-wrap: break-word !important;
            word-break: break-word !important;
        }
        .card-body .w-100.text-center span {
            background: var(--m3-surface-1) !important;
            color: var(--m3-primary) !important;
            font-weight: 700;
            font-size: 14px;
            padding: 4px 12px;
            border-radius: var(--m3-radius-sm);
        }
        .data-letak-op-wrapper {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 24px !important;
            align-items: flex-start !important;
            margin: 0 !important;
        }
        /* flex:1 1 0 + min-width:0 lets both halves share space equally
           regardless of inner content width; no max-width cap needed */
        .data-letak-op-wrapper > [class*="col-"] {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            max-width: none !important;
            padding: 0 !important;
        }
        .data-letak-op-wrapper > [class*="col-"]:last-child {
            border-left: 1px solid var(--m3-outline);
            padding-left: 24px !important;
        }
        @media (max-width: 991px) {
            .data-letak-op-wrapper { flex-direction: column !important; gap: 16px !important; }
            .data-letak-op-wrapper > [class*="col-"] {
                min-width: 100% !important;
                border-left: none !important;
                padding-left: 0 !important;
            }
        }
        .data-tanah-grid { display: flex !important; flex-wrap: wrap !important; margin: 0 -12px !important; }
        .data-tanah-grid > [class*="col-lg-4"],
        .data-tanah-grid > [class*="col-md-"] {
            flex: 0 0 50% !important;
            max-width: 50% !important;
            padding: 0 12px !important;
        }
        @media (max-width: 991px) {
            .data-tanah-grid > [class*="col-lg-4"],
            .data-tanah-grid > [class*="col-md-"] { flex: 0 0 100% !important; max-width: 100% !important; }
        }
        .table { color: var(--m3-on-surface) !important; }
        .table-bordered td, .table-bordered th { border-color: #21262D !important; border-width: 1px !important; }
        .table-striped tbody tr:nth-of-type(odd) { background: #1A1F24 !important; }
        .table thead th {
            background: var(--m3-surface-2) !important;
            color: var(--m3-on-surface-variant) !important;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .05em;
            border-bottom: 1px solid var(--m3-outline) !important;
            padding: 8px 12px;
        }
        .table tbody td { padding: 8px 12px; font-size: 13px; vertical-align: middle; }
        #collapse-requirement table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        #collapse-requirement tr {
            display: flex !important;
            align-items: center !important;
            border-bottom: 1px solid var(--m3-outline) !important;
            padding-bottom: 8px !important;
        }
        #collapse-requirement td { vertical-align: middle; padding: 0; border: none !important; }
        #collapse-requirement td:first-child { flex: 1 1 auto !important; min-width: 0; }
        #collapse-requirement td:first-child label {
            font-size: 13px; line-height: 1.5;
            color: var(--m3-on-surface-variant); margin: 0; cursor: default;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        #collapse-requirement td:last-child { flex: 0 0 auto !important; white-space: nowrap; margin-left: 12px; }
        .form-group {
            /* v1.0.9: 1.25rem (20px) -> 0.7rem (~11px). This was the single
               biggest contributor to vertical scroll in Data Wajib Pajak /
               Data Letak Objek Pajak — 13 stacked form-groups at 20px margin
               is 260px of pure gutter before any field height is counted. */
            margin-bottom: 0.7rem;
            overflow: visible !important;
        }
        .form-group::after {
            content: '';
            display: table;
            clear: both;
        }
        /* Server puts approved values as float-right; stack below input so nothing clips */
        .form-group strong.text-success.float-right {
            display: block;
            float: none !important;
            clear: both;
            margin-top: 6px;
            font-size: 12px;
            line-height: 1.45;
            text-align: right;
            word-break: break-word;
            white-space: normal;
        }
        .form-control, input.form-control, select.form-control, textarea.form-control {
            background: var(--m3-surface) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
            border-radius: var(--m3-radius-sm) !important;
            /* v1.0.9: 42px -> 34px min-height. Still comfortably above the
               ~30px minimum tap target for mouse-driven office data entry
               (this isn't a touch kiosk), and shaves 8px off every single
               field on the page — with 13+ fields per section that adds up
               fast without needing to touch layout structure at all. */
            padding: 6px 12px !important;
            font-size: 13px;
            line-height: 1.4;
            min-height: 34px;
            box-sizing: border-box;
            transition: all .2s ease;
        }
        textarea.form-control {
            min-height: 72px;
        }
        /* v1.1: .form-control's own padding/border/background (all !important)
           were tying with and beating Select2's select2-hidden-accessible
           hide rules (also !important) whenever our <style> loaded after
           Select2's — since both sides use !important, equal specificity
           falls back to source order. That popped the raw, unstyled
           <select> back into view (tiny width, options stacking letter by
           letter) anywhere Select2 hadn't visibly re-rendered yet. Higher
           specificity here guarantees this always wins regardless of
           style-tag order. */
        select.form-control.select2-hidden-accessible {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            clip-path: inset(50%) !important;
            border: 0 !important;
            white-space: nowrap !important;
        }
        .input-group {
            flex-wrap: nowrap;
            align-items: stretch;
        }
        .input-group .form-control {
            min-height: 34px;
        }
        .input-group-append .input-group-text {
            display: flex;
            align-items: center;
            min-height: 34px;
            padding: 6px 10px !important;
            line-height: 1.2;
        }
        .form-control:focus {
            border-color: var(--m3-primary) !important;
            box-shadow: 0 0 0 3px rgba(121,192,255,.15) !important;
            outline: none;
        }
        .input-group-text.bg-danger, .bg-danger:not(.card-header), .badge-danger,
        .text-white.bg-danger:not(.card-header), span[class*="bg-danger"]:not(.card-header), .input-group-append span.bg-danger {
            background-color: #4a1c1c !important;
            color: var(--m3-error) !important;
            border-color: #5c2424 !important;
            font-weight: 600 !important;
        }
        .select2-container--bootstrap4 .select2-selection {
            background: var(--m3-surface-1) !important;
            border-color: var(--m3-outline) !important;
            border-radius: var(--m3-radius-sm) !important;
            height: auto !important;
            min-height: 34px;
            padding: 4px 10px;
        }
        .select2-container--bootstrap4 .select2-selection--single {
            height: auto !important;
            min-height: 34px;
        }
        .select2-container--bootstrap4 .select2-selection--single .select2-selection__rendered {
            line-height: 1.45;
            padding-top: 4px;
            padding-bottom: 4px;
            white-space: normal;
            word-break: break-word;
            color: var(--m3-on-surface) !important;
        }
        .select2-container--bootstrap4 .select2-selection__arrow {
            height: 100%;
            top: 0;
        }
        /* Select2 measures parent at init; after layout moves widths can collapse (~30px) */
        #n2n01Form .select2-container,
        #n2n02Form .select2-container,
        #n2n03Form .select2-container,
        #collapse-permohonan .select2-container,
        #collapse-pemohon .select2-container {
            width: 100% !important;
            max-width: 100% !important;
            display: block;
        }
        .select2-dropdown {
            background: var(--m3-surface-1) !important;
            border-color: var(--m3-outline) !important;
            border-radius: var(--m3-radius-sm) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5);
        }
        .select2-results__option { color: var(--m3-on-surface); padding: 10px 14px; font-size: 14px; }
        .select2-results__option--highlighted {
            background: var(--m3-primary-container) !important;
            color: var(--m3-primary) !important;
        }
        .btn {
            border-radius: var(--m3-radius-sm) !important;
            font-family: 'Atkinson Hyperlegible', sans-serif !important;
            font-weight: 500;
            font-size: 13px;
            letter-spacing: .025em;
            padding: 7px 14px !important;
            border: none !important;
            transition: all .2s cubic-bezier(.4,0,.2,1);
        }
        .btn-info { background: var(--m3-primary-container) !important; color: var(--m3-primary) !important; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
        .btn-info:hover { background: #244b73 !important; }
        .btn-success { background: var(--m3-secondary-container) !important; color: #7EE787 !important; }
        .btn-danger { background: #4a1c1c !important; color: var(--m3-error) !important; }
        .btn-warning { background: #4a3b1f !important; color: var(--m3-tertiary) !important; }
        .left-sidebar {
            transform: translateX(-100%);
            transition: transform .35s cubic-bezier(.4,0,.2,1);
            position: fixed;
            left: 0; top: 0; bottom: 0;
            width: 260px;
            z-index: 9998;
            background: var(--m3-surface-1) !important;
            border-right: 1px solid var(--m3-outline) !important;
        }
        .left-sidebar.tm-visible { transform: translateX(0); box-shadow: 8px 0 32px rgba(0,0,0,.6); }
        .tm-sidebar-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9997;
            background: rgba(0,0,0,.35);
            opacity: 0;
            pointer-events: none;
            transition: opacity .25s ease;
        }
        .tm-sidebar-backdrop.tm-visible {
            opacity: 1;
            pointer-events: auto;
        }
        .sidebar-link {
            color: var(--m3-on-surface-variant);
            border-radius: 0 100px 100px 0;
            margin: 4px 8px 4px 0;
            padding: 12px 24px;
            font-size: 14px;
            transition: all .2s;
        }
        .sidebar-link:hover, .sidebar-item.active .sidebar-link {
            background: rgba(121,192,255,.08) !important;
            color: var(--m3-primary) !important;
        }
        /* v1.2.6: v1.2.5's fix used .left-sidebar-prefixed class selectors,
           which still lost on live pages — main-wrapper carries
           class="mini-sidebar" (icon-only collapsed mode), and this
           template renders submenu flyouts/colors via its own
           [data-sidebarbg="skin6"]-attribute-anchored rules. Attribute
           selectors count the same specificity weight as classes, and the
           site's selector chains more of them than ours did, so its
           !important rules were STILL winning the specificity tiebreak
           against our !important rules — same "!important vs !important"
           fight, just decided by whoever has more classes/attributes in
           the chain, and the site had more. An ID always outranks any
           number of classes or attribute selectors regardless of
           !important on both sides, and the nav list already carries
           id="sidebarnav" — anchoring every rule there is a guaranteed
           win instead of an escalating specificity arms race. */
        #sidebarnav a.sidebar-link,
        #sidebarnav .sidebar-nav ul li a.sidebar-link {
            color: var(--m3-on-surface-variant) !important;
            background: transparent !important;
        }
        #sidebarnav a.sidebar-link i,
        #sidebarnav a.sidebar-link .mdi {
            color: var(--m3-on-surface-variant) !important;
        }
        #sidebarnav .sidebar-item.active > a.sidebar-link,
        #sidebarnav a.sidebar-link:hover {
            color: var(--m3-primary) !important;
            background: rgba(121,192,255,.08) !important;
        }
        #sidebarnav .sidebar-item.active > a.sidebar-link i,
        #sidebarnav .sidebar-item.active > a.sidebar-link .mdi,
        #sidebarnav a.sidebar-link:hover i,
        #sidebarnav a.sidebar-link:hover .mdi {
            color: var(--m3-primary) !important;
        }
        /* Submenu (ul.first-level) panel background — including the
           mini-sidebar HOVER FLYOUT variant, which this template renders
           as the same ul.first-level markup positioned absolutely rather
           than a separate element, so no extra selector is needed for it
           specifically — it was inheriting the site's own hardcoded dark
           "skin6" background regardless of theme; pin it to the same
           surface as the sidebar itself. */
        #sidebarnav ul.first-level,
        #sidebarnav ul.collapse {
            background: var(--m3-surface-1) !important;
        }
        #sidebarnav ul.first-level a.sidebar-link {
            padding-left: 44px !important;
            font-size: 13px;
        }
        /* has-arrow chevron: site renders this via a themed ::before/::after
           icon font glyph with its own hardcoded color, independent of the
           link's text color — needs its own explicit override, and a
           rotate transform so it still indicates open/closed state. */
        #sidebarnav .has-arrow::before,
        #sidebarnav .has-arrow::after {
            color: var(--m3-on-surface-variant) !important;
            border-color: var(--m3-on-surface-variant) !important;
            transition: transform .2s ease, color .2s ease;
        }
        #sidebarnav .sidebar-item.active > .has-arrow::before,
        #sidebarnav .sidebar-item.active > .has-arrow::after,
        #sidebarnav [aria-expanded="true"].has-arrow::before,
        #sidebarnav [aria-expanded="true"].has-arrow::after {
            color: var(--m3-primary) !important;
            border-color: var(--m3-primary) !important;
        }
        .page-wrapper { margin-left: 0 !important; }
        .topbar, .navbar, .navbar-collapse {
            background: var(--m3-surface-1) !important;
            border-bottom: 1px solid var(--m3-outline) !important;
            box-shadow: 0 1px 3px rgba(0,0,0,.3);
        }
        .navbar-header { background: var(--m3-surface-1) !important; }
        .navbar-dark .navbar-nav .nav-link { color: var(--m3-on-surface-variant); }
        .sidebartoggler, .nav-toggler {
            color: var(--m3-primary);
            border-radius: var(--m3-radius-sm);
            width: 40px; height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background .2s;
        }
        .sidebartoggler:hover, .nav-toggler:hover {
            background: rgba(121,192,255,.1);
            color: var(--m3-primary);
        }
        a { color: var(--m3-primary); transition: color .2s; }
        a:hover { color: #A8D8FF; }
        .modal-content {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
            border-radius: var(--m3-radius-lg) !important;
            box-shadow: 0 16px 48px rgba(0,0,0,.6);
            overflow: hidden !important;
        }
        /* Ajax modals (#formSpop, #lspopForm, …) */
        .modal-dialog.tm-ajax-modal-dialog .modal-content,
        .modal-dialog.tm-spop-modal-dialog .modal-content,
        .modal-dialog:has(#formSpop) .modal-content,
        .modal-dialog:has(#lspopForm) .modal-content {
            overflow: visible !important;
        }
        .modal-header {
            border-bottom: 1px solid var(--m3-outline) !important;
            padding: 14px 18px;
            display: flex !important;
            align-items: center !important;
            gap: 10px;
        }
        .modal-header .modal-title { flex: 1 1 auto; }
        .modal-footer { border-top: 1px solid var(--m3-outline) !important; padding: 10px 18px; }
        /* v1.0.25: .tm-header-simpan-btn removed along with the feature
           that used it — see enhanceAjaxModals() for the removal note. */
        /* v1.0.26: SPOP modal header (title + × close button) removed
           entirely, per request, to reclaim vertical space. Pure CSS, not
           a DOM removal — this avoids the whole class of AJAX-reload
           guard bugs the Simpan feature ran into, since a CSS rule
           doesn't need to "remember" anything across the modal's content
           being replaced on every reopen; it just always applies to
           whatever's currently there. Closing the modal still works via
           the "Tutup" button in .modal-footer (unaffected — that block
           was left alone in v1.0.25), so no functionality is lost.
           Scoped to .tm-spop-modal-dialog only — the LSPOP modal and any
           other ajax modal keep their normal header. */
        .modal-dialog.tm-spop-modal-dialog .modal-header {
            display: none !important;
        }
        .modal-dialog.tm-ajax-modal-dialog,
        .modal-dialog.tm-spop-modal-dialog,
        .modal-dialog:has(#formSpop),
        .modal-dialog:has(#lspopForm) {
            width: min(1180px, calc(100vw - 48px)) !important;
            max-width: min(1180px, calc(100vw - 48px)) !important;
            margin: 1.75rem auto;
        }
        .modal-dialog.tm-ajax-modal-dialog .modal-body,
        .modal-dialog.tm-spop-modal-dialog .modal-body,
        .modal-dialog:has(#formSpop) .modal-body,
        .modal-dialog:has(#lspopForm) .modal-body {
            max-height: min(92vh, 940px);
            overflow-x: hidden;
            overflow-y: auto;
            padding: 16px 24px;
        }
        .modal-dialog.tm-ajax-modal-dialog .modal-title,
        .modal-dialog.tm-spop-modal-dialog .modal-title,
        .modal-dialog:has(#formSpop) .modal-title,
        .modal-dialog:has(#lspopForm) .modal-title {
            color: var(--m3-on-surface) !important;
            font-weight: 700;
            font-size: 18px;
        }
        .modal-dialog.tm-ajax-modal-dialog .close,
        .modal-dialog.tm-spop-modal-dialog .close,
        .modal-dialog:has(#formSpop) .close,
        .modal-dialog:has(#lspopForm) .close {
            color: var(--m3-on-surface-variant) !important;
            opacity: 1;
            text-shadow: none;
            font-size: 28px;
            line-height: 1;
        }
        .modal-dialog.tm-ajax-modal-dialog .close:hover,
        .modal-dialog.tm-spop-modal-dialog .close:hover,
        .modal-dialog:has(#formSpop) .close:hover,
        .modal-dialog:has(#lspopForm) .close:hover {
            color: var(--m3-on-surface) !important;
        }
        #formSpop .w-100.text-center {
            height: auto !important;
            border-bottom: 1px solid var(--m3-outline) !important;
            margin: 2px 0 4px !important;
        }
        #formSpop .w-100.text-center span {
            background: var(--m3-surface-1) !important;
            color: var(--m3-primary) !important;
            font-weight: 700;
            font-size: 16px;
            padding: 6px 16px;
            border-radius: var(--m3-radius-sm);
        }
        #formSpop label,
        #lspopForm label {
            color: var(--m3-on-surface-variant);
            font-size: 13px;
        }
        #formSpop .text-success,
        #formSpop strong.text-success {
            color: #7EE787 !important;
        }
        html.tm-light #formSpop .text-success,
        html.tm-light #formSpop strong.text-success {
            color: #1A7F37 !important;
        }
        #formSpop .select2-container,
        #lspopForm .select2-container {
            width: 100% !important;
            max-width: 100% !important;
        }
        #formSpop .form-group,
        #lspopForm .form-group {
            margin-bottom: 10px;
            overflow: visible !important;
        }
        #formSpop .form-control,
        #formSpop .select2-container--bootstrap4 .select2-selection,
        #lspopForm .form-control,
        #lspopForm .select2-container--bootstrap4 .select2-selection {
            min-height: 40px;
            padding: 7px 12px !important;
            font-size: 14px;
        }
        #formSpop label, #lspopForm label {
            font-size: 13px;
            margin-bottom: 3px;
        }
        #formSpop .text-error,
        #lspopForm .text-error {
            display: block;
            clear: both;
            margin-top: 4px;
            line-height: 1.35;
            font-size: 12px;
        }
        #lspopForm .select2-selection__rendered {
            white-space: normal;
            word-break: break-word;
        }
        .modal.modals.show .select2-container--open {
            z-index: 10060 !important;
        }
        @media (max-width: 767px) {
            .modal-dialog.tm-ajax-modal-dialog,
            .modal-dialog.tm-spop-modal-dialog,
            .modal-dialog:has(#formSpop),
            .modal-dialog:has(#lspopForm) {
                width: calc(100vw - 16px) !important;
                max-width: calc(100vw - 16px) !important;
                margin: 8px auto;
            }
        }
        .timeline-panel {
            background: var(--m3-surface-2) !important;
            border: 1px solid var(--m3-outline) !important;
            border-radius: var(--m3-radius-lg);
            color: var(--m3-on-surface);
        }
        /* ─── Customizer (discussion panel) slide-in ─── */
        /* The site's own framework JS normally wires .service-panel-toggle to
           toggle 'show-service-panel' on .customizer. That JS doesn't run
           under Tampermonkey, so we replicate both the CSS and the wiring. */
        /* .customizer also has class .card which sets overflow:hidden — that
           clips the toggle button that protrudes 54px to the left. Override it. */
        .customizer.card {
            overflow: visible !important;
            border: none !important;
            border-radius: 0 !important;
        }
        /* Panel was full-height (100vh, matching site default) — cut to
           half and anchor it to the bottom so it doesn't float awkwardly
           mid-page. Flex column so the body actually respects this cap
           (only scrolls once real content overflows it) instead of the
           body silently growing past 50vh regardless. */
        .customizer {
            height: 50vh !important;
            top: auto !important;
            bottom: 0 !important;
            display: flex !important;
            flex-direction: column !important;
        }
        .customizer .card-header {
            flex-shrink: 0;
        }
        /* Body takes the remaining space after the header; min-height:0 is
           required for a flex child to actually shrink and let overflow
           do its job instead of forcing the flex container to grow.
           overflow:hidden here (not auto) because the actual scrolling
           happens one level deeper, on .chat-box — see below. Two nested
           scroll regions (this PerfectScrollbar container + chat-box's
           own) would otherwise fight each other / show a double scrollbar. */
        .customizer .customizer-body {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
        }
        /* height:100% on .chat-box only resolves if every ancestor between
           it and .customizer-body also has a real (non-auto) height — so
           the flex chain has to be threaded through all of them, not just
           set on .chat-box itself. */
        .customizer #pills-tabContent,
        .customizer .tab-pane,
        .customizer .tab-pane > .p-1,
        .customizer .chatting-box,
        .customizer .chatting-box > .card-body.p-1:first-child {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
        }
        .customizer .chat-box.scrollable {
            height: 100% !important;
            max-height: 100% !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow-y: auto !important;
        }
        /* Compose form gets physically relocated (see relocateChatCompose
           in JS) to be a direct child of .customizer, sibling to
           .customizer-body, so it can't scroll away with the chat history
           — it just sits pinned at the bottom via normal flex layout. */
        .customizer > .chat-send-message-footer {
            flex-shrink: 0;
            background: var(--m3-surface-1);
            border-top: 1px solid var(--m3-outline);
        }
        .customizer.show-service-panel {
            right: 0 !important;
            box-shadow: -8px 0 32px rgba(0,0,0,.5) !important;
        }

        /* ─── n2n03-form specific: Data SPOP / Data LSPOP tables ─── */
        /* These tables carry Bootstrap's .w-100 class, forcing them to
           always stretch to exactly 100% of the container regardless of
           how little content there is — with the numbering column hidden
           and most remaining columns short (NOP, No SPOP, short names),
           that stretch is what created the large dead-space gaps in each
           cell. Letting the table size to its actual content instead
           (width:auto) fixes that; horizontal scroll (already in place)
           still covers the case where content genuinely needs more room
           than the container. Centered via margin so it doesn't just sit
           flush-left with empty space to the right once it's narrower. */
        #spopTable.w-100, #lspopTable.w-100 {
            width: auto !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
        /* These are wide multi-column tables (6-9 columns) — same
           category as permitList/globalTable, not the simple 2-column
           Persyaratan table. Forcing table-layout:fixed to squeeze them
           into the container was the wrong fix: with this many columns,
           evenly dividing the leftover space after pinning first/last
           columns gives each remaining column ~70-80px, which mangles
           headers like "TAHUN DIBANGUN" into vertical letter-soup, and
           capping width:100% removes the very overflow that the
           horizontal scrollbar needs to reach the hidden columns.
           Correct pattern: let the table size naturally and scroll
           horizontally (Bootstrap's .table-responsive already does this
           by default), with the Aksi column pinned via position:sticky
           so it's still reachable without scrolling all the way right. */
        #spopTable tbody td, #lspopTable tbody td {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: clip;
            max-width: 160px;
        }
        /* Numbering column (No./#) — hidden entirely per instruction */
        #spopTable .tm-hide-col, #lspopTable .tm-hide-col {
            display: none !important;
        }
        /* Designated always-visible columns ('NO SPOP', 'Luas') — no clip,
           no max-width cap, natural full-content width */
        #spopTable .tm-nocollapse, #lspopTable .tm-nocollapse {
            white-space: nowrap;
            overflow: visible !important;
            text-overflow: clip !important;
            max-width: none !important;
        }
        #spopTable td:last-child, #spopTable th:last-child,
        #lspopTable td:last-child, #lspopTable th:last-child {
            position: sticky;
            right: 0;
            z-index: 1;
            background: var(--m3-surface-2) !important;
            box-shadow: -4px 0 8px rgba(0,0,0,.3);
            text-align: center;
        }
        #spopTable, #spopTable thead th, #spopTable tbody td,
        #lspopTable, #lspopTable thead th, #lspopTable tbody td {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        #spopTable thead th, #lspopTable thead th {
            background: var(--m3-surface-2) !important;
            font-weight: 600;
        }
        #spopTable tbody tr.odd, #spopTable tbody tr.even,
        #lspopTable tbody tr.odd, #lspopTable tbody tr.even {
            background: var(--m3-surface-1) !important;
        }
        #spopTable tbody tr:hover td, #lspopTable tbody tr:hover td {
            background: var(--m3-surface-2) !important;
        }
        #spopTable tbody tr:hover td:last-child, #lspopTable tbody tr:hover td:last-child {
            background: var(--m3-surface-2) !important;
        }
        #spopTable thead th.sorting::before, #spopTable thead th.sorting::after,
        #spopTable thead th.sorting_asc::before, #spopTable thead th.sorting_asc::after,
        #lspopTable thead th.sorting::before, #lspopTable thead th.sorting::after,
        #lspopTable thead th.sorting_asc::before, #lspopTable thead th.sorting_asc::after {
            top: 50% !important;
            bottom: auto !important;
            transform: translateY(-50%) !important;
        }

        /* ─── n2n03-form specific: Leaflet map controls ─── */
        /* Leaflet's default control skin (zoom, layers picker, scale bar)
           is hard-coded white boxes with dark text — untouched, these sit
           as bright rectangles on an otherwise dark page. The map tiles
           themselves are external imagery and can't be rethemed, but the
           chrome around them can. */
        .leaflet-control-zoom a, .leaflet-control-layers,
        .leaflet-control-fullscreen a {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        .leaflet-control-zoom a:hover, .leaflet-control-fullscreen a:hover {
            background: var(--m3-surface-2) !important;
        }
        /* v1.2.5: this invert(1) was unconditional, meaning it ALSO ran
           in light mode (the default since v1.0.9) — inverting the
           layers icon to white-on-white against the light control
           background instead of the intended dark-mode fix, making it
           functionally invisible out of the box. Scope the invert to
           dark mode only; light mode keeps the icon's native dark color,
           which already reads fine against --m3-surface-1's pale bg. */
        html:not(.tm-light) .leaflet-control-layers-toggle {
            filter: invert(1) hue-rotate(180deg);
        }
        .leaflet-control-layers-expanded {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
        }
        /* Same class of bug: hardcoded dark rgba regardless of theme —
           correct-looking in dark mode, a dark smudge in light mode.
           Theme vars already resolve to the right shade either way. */
        .leaflet-control-scale-line {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-on-surface-variant) !important;
            opacity: .92;
        }
        /* Smooth slide transition must live on the BASE element (not only on
           .show-service-panel) so the panel animates both on open AND close */
        .customizer {
            transition: right .3s cubic-bezier(.4,0,.2,1) !important;
        }
        /* Style the floating toggle button */
        .customizer .service-panel-toggle {
            width: 54px;
            height: 54px;
            display: flex !important;
            align-items: center;
            justify-content: center;
            border-radius: var(--m3-radius-sm) 0 0 var(--m3-radius-sm) !important;
            font-size: 20px;
            color: #fff !important;
            text-decoration: none;
        }
        .chatting-box, .chat-box, .customizer {
            background: var(--m3-surface-1) !important;
            border-color: var(--m3-outline) !important;
            color: var(--m3-on-surface) !important;
        }
        .customizer .card-header {
            background: transparent !important;
            border-bottom: 1px solid var(--m3-outline) !important;
        }
        .customizer .text-muted {
            color: var(--m3-on-surface-variant) !important;
        }
        .customizer textarea.input-forum {
            background: var(--m3-surface) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
        }
        .chat-list .chat-item .chat-content h5 {
            color: var(--m3-on-surface) !important;
        }
        .chat-list .chat-item .chat-time {
            color: var(--m3-on-surface-variant) !important;
        }
        .chat-list .chat-item .chat-content .box {
            background: var(--m3-surface-2) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
        }
        html.tm-light .chat-list .chat-item .chat-content .box {
            background: #F0F2F4 !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
        }
        #peta { border-radius: var(--m3-radius-lg); border: 1px solid var(--m3-outline); overflow: hidden; height: 240px !important; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: var(--m3-surface); }
        ::-webkit-scrollbar-thumb { background: var(--m3-outline); border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
        .dataTables_paginate .pagination .page-item .page-link {
            background: var(--m3-surface-1);
            color: var(--m3-on-surface-variant);
            border: 1px solid var(--m3-outline);
            border-radius: var(--m3-radius-sm);
            margin: 0 4px;
            padding: 6px 14px;
            font-size: 13px;
            font-weight: 500;
        }
        .dataTables_paginate .pagination .page-item.active .page-link {
            background: var(--m3-primary-container);
            color: var(--m3-primary);
            border-color: var(--m3-primary);
        }
        .dataTables_paginate .pagination .page-item.disabled .page-link {
            background: var(--m3-surface);
            color: #484f58;
            border-color: #21262D;
        }
        .dataTables_paginate .pagination .page-item .page-link:hover {
            background: var(--m3-surface-2);
            color: var(--m3-on-surface);
        }
        .dataTables_info, .dataTables_length, .dataTables_filter {
            color: var(--m3-on-surface-variant);
            font-size: 13px;
        }
        .dataTables_length select, .dataTables_filter input {
            background: var(--m3-surface);
            color: var(--m3-on-surface);
            border-color: var(--m3-outline);
            border-radius: var(--m3-radius-sm);
        }
        .tm-m3-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 32px;
            padding: 0 16px;
            min-width: 72px;
            background: var(--m3-primary-container);
            color: var(--m3-primary);
            border-radius: var(--m3-radius-sm);
            font-family: 'Atkinson Hyperlegible', sans-serif;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: .025em;
            text-decoration: none;
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            border: none;
            box-shadow: 0 1px 2px rgba(0,0,0,.3);
            transition: all .2s cubic-bezier(.4,0,.2,1);
        }
        .tm-m3-btn:hover { background: #244b73; color: #A8D8FF; }
        .tm-shell { display: flex; flex-wrap: nowrap; gap: 16px; }
        .tm-shell > .card { flex: 1 1 50%; min-width: 0; margin-bottom: 0 !important; }
        @media (max-width: 991px) {
            .tm-shell { flex-direction: column; }
            .tm-shell > .card { margin-bottom: 16px !important; }
        }
        #lspopTable thead th:last-child { color: transparent !important; position: relative; }
        #lspopTable tbody td:last-child { text-align: right; white-space: nowrap; }
        /* Sort-arrow centering: DataTables positions its ::before/::after
           sort icons with a fixed 'bottom' offset, tuned for a single-line
           header. Any header that wraps to 2 lines (long labels) throws
           the icon off-center relative to the others. Centering via
           top:50%/translateY sidesteps content height entirely. */
        #lspopTable thead th.sorting::before,
        #lspopTable thead th.sorting::after,
        #lspopTable thead th.sorting_asc::before,
        #lspopTable thead th.sorting_asc::after,
        #lspopTable thead th.sorting_desc::before,
        #lspopTable thead th.sorting_desc::after {
            top: 50% !important;
            bottom: auto !important;
            transform: translateY(-50%) !important;
        }

        /* ─── Merged RT/RW row in Pemohon table ─── */
        .tm-rtrw-row td { padding: 8px 14px !important; }
        .tm-rtrw-flex { display: flex; gap: 20px; }
        .tm-rtrw-item { flex: 1 1 0; display: flex; align-items: baseline; gap: 8px; min-width: 0; }
        .tm-rtrw-label {
            font-weight: 600;
            color: var(--m3-on-surface-variant);
            font-size: 12px;
            flex-shrink: 0;
        }
        .tm-rtrw-value {
            font-weight: 400;
            color: var(--m3-on-surface);
            font-size: 14px;
        }
        /* Only Nama is bold — everything else in the Pemohon table (including
           RT/RW above) stays uniform/regular weight. Row tagged in JS below. */
        .tm-nama-row td:last-child {
            font-weight: 700 !important;
        }

        /* ─── Row 1: 3-column top shell (Pemohon | Riwayat | Persyaratan) ─── */
        .tm-triple-shell {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            align-items: flex-start !important;
        }
        /* Each card stretches to the tallest sibling's height */
        .tm-triple-shell > .card {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            margin-bottom: 0 !important;
            display: flex !important;
            flex-direction: column !important;
        }
        /* Collapse + card-body flex to fill remaining card height */
        .tm-triple-shell > .card > .collapse.show,
        .tm-triple-shell > .card > .show {
            flex: 1 1 auto !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        }
        .tm-triple-shell > .card > .collapse.show > .card-body,
        .tm-triple-shell > .card > .show > .card-body {
            flex: 1 1 auto !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        }
        /* Fixed height cap applied uniformly to all 3 columns (Pemohon,
           Persyaratan, and Riwayat's timeline — note #history-timeline IS
           the .card-body element itself in the real markup, not a separate
           wrapper). Deliberately NOT derived from any column's own natural
           content height: an earlier version tried matching Riwayat's
           height to Persyaratan's, but Persyaratan itself turns out to
           render very tall (1500px+) once its item text wraps across a
           narrow ⅓-width column, so 'matching' just made everything
           uniformly tall instead of compact. A flat cap sidesteps that
           entirely — each column scrolls independently if it overflows.
           Selector matched to the same depth as the flex-fill rule above,
           so this actually overrides its 'overflow: hidden' (a shallower
           selector here would silently lose that specificity fight while
           max-height still applied, clipping content instead of scrolling it). */
        .tm-triple-shell > .card > .collapse.show > .card-body,
        .tm-triple-shell > .card > .show > .card-body {
            max-height: 500px !important;
            min-height: 180px !important;
            overflow-y: auto !important;
        }
        /* #history-timeline needs its OWN override: there's an existing
           '#history-timeline { height: 320px !important; ... }' rule
           elsewhere (for contexts outside the triple-shell). An ID selector
           always outranks any number of class selectors in CSS specificity,
           so the class-only rule above — however many classes it chains —
           would be silently defeated here. This selector includes the ID
           itself to actually win. */
        .tm-triple-shell #history-timeline {
            height: auto !important;
            max-height: 500px !important;
            min-height: 180px !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
        }
        /* ─── Medium/tablet tier (768px–1199px): Riwayat gets its own
           full-width row up top (history is the most useful thing to see
           first on a cramped screen), Pemohon + Persyaratan wrap onto the
           next line and share it 50/50. Achieved with flex-wrap + order,
           no DOM reordering needed — flex 'order' is purely visual.
           Lower bound moved from 992px → 768px (iOS iPad portrait) so this
           tier covers tablets without falling through to the mobile stack. */
        @media (min-width: 768px) and (max-width: 1199px) {
            .tm-triple-shell { flex-wrap: wrap !important; }
            /* flex:0 0 100% forces Riwayat onto its own row unconditionally —
               margin:auto on a flex item only centers it when it is alone on
               its row, so the previous flex:0 0 auto approach left a gap on
               the right at widths where siblings still tried to fit alongside.
               Full-width basis + max-width cap + margin:auto is the reliable
               pattern for a centered-but-capped item in a wrapping flex row. */
            /* flex:0 0 100% sets grow=0 shrink=0 basis=100%.
               width:100% reinforces the basis so max-width:520px
               only affects the rendered visual size, not the space
               reserved on the flex row — without this, a browser
               that resolves flex-basis through max-width can shrink
               the reserved space to 520px and let a sibling squeeze
               onto the same row. */
            .tm-triple-shell > [data-tm-nav-id="riwayat"] {
                order: 1;
                flex-grow: 0 !important;
                flex-shrink: 0 !important;
                flex-basis: 100% !important;
                width: 100% !important;
                max-width: 520px !important;
                margin-left: auto !important;
                margin-right: auto !important;
                margin-bottom: 16px !important;
            }
            .tm-triple-shell > [data-tm-nav-id="pemohon"] {
                order: 2;
                flex: 0 0 calc(50% - 8px) !important;
                max-width: calc(50% - 8px) !important;
            }
            .tm-triple-shell > [data-tm-nav-id="persyaratan"] {
                order: 3;
                flex: 0 0 calc(50% - 8px) !important;
                max-width: calc(50% - 8px) !important;
            }
        }
        /* Single unified mobile breakpoint at 767px: stack to 1 column AND
           drop the height cap in the same query, so there's no dead zone
           where columns are stacked but still height-capped (or vice versa).
           Riwayat still leads visually via 'order', same as the tablet tier
           above — only the layout mechanics differ. Cutoff aligned to iOS
           portrait (768px boundary) — anything below that is a phone.
           IMPORTANT: the height-cap-removal selectors must repeat the same
           full selector chain used for the 500px cap above — a shorter
           selector here would lose the specificity fight against that
           !important rule, silently leaving 500px in effect. Each mobile
           card is centered with max-width:520px + margin:auto; only the
           card wrapper is centered, card-body content is untouched. */
        @media (max-width: 767px) {
            .tm-triple-shell { flex-direction: column !important; }
            .tm-triple-shell > [data-tm-nav-id="riwayat"] {
                order: 1;
                width: 100% !important;
                max-width: 520px !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
            /* Pemohon + Persyaratan also centered at 520px on mobile —
               consistent card width across the full stacked column. Only
               the outer card wrapper is constrained; form fields inside
               remain full-width within that wrapper. */
            .tm-triple-shell > [data-tm-nav-id="pemohon"] {
                order: 2;
                width: 100% !important;
                max-width: 520px !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
            .tm-triple-shell > [data-tm-nav-id="persyaratan"] {
                order: 3;
                width: 100% !important;
                max-width: 520px !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
            .tm-triple-shell > .card {
                margin-bottom: 16px !important;
                flex: none !important;
                overflow: visible !important;
            }
            .tm-triple-shell > .card > .collapse.show,
            .tm-triple-shell > .card > .show {
                overflow: visible !important;
                flex: none !important;
                height: auto !important;
                display: block !important;
            }
            .tm-triple-shell > .card > .collapse.show > .card-body,
            .tm-triple-shell > .card > .show > .card-body {
                max-height: none !important;
                overflow-y: visible !important;
            }
            .tm-triple-shell #history-timeline {
                max-height: none !important;
                height: auto !important;
            }
        }

        /* ─── LSPOP + Konfirmasi: 65/35 on spacious screens ─── */
        .tm-lspop-konfirmasi-shell {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            align-items: flex-start !important;
        }
        .tm-lspop-col {
            flex: 65 1 0 !important;
            min-width: 0 !important;
        }
        .tm-konfirmasi-col {
            flex: 35 1 0 !important;
            min-width: 0 !important;
        }
        .tm-lspop-col > .card,
        .tm-konfirmasi-col > .card { margin-bottom: 0 !important; }
        /* DataTable inside constrained LSPOP column needs explicit full width */
        .tm-lspop-col table.dataTable,
        .tm-lspop-col #lspopTable_wrapper { width: 100% !important; }
        .tm-lspop-col .dataTables_wrapper { overflow-x: auto !important; }
        /* Catatan Revisi: proper typing space — tall, fills its column width */
        .tm-konfirmasi-col textarea.form-control {
            min-height: 220px !important;
            width: 100% !important;
        }
        @media (max-width: 1399px) {
            .tm-lspop-konfirmasi-shell { flex-direction: column !important; }
            .tm-lspop-col, .tm-konfirmasi-col { flex: none !important; width: 100% !important; }
            .tm-lspop-col > .card, .tm-konfirmasi-col > .card { margin-bottom: 16px !important; }
            .tm-konfirmasi-col textarea.form-control { min-height: 160px !important; }
        }

        /* ─── SPOP form: outer 2-col (left=Data Letak, right=Data Tanah) ───
        /* min-width:0 override on all THREE grid children of
           .tm-spop-sections-outer. Grid/flex items default to
           min-width:auto (= their content's min-content size), not 0 —
           without this, a grid item can never shrink narrower than its
           widest unbreakable descendant. .tm-spop-sections-left/right had
           this from the start; .sertifikat-section was added later (the
           "tuck under Tanah" feature) and never got it, so its nested
           .tm-sertifikat-row (min-width:700px) was propagating that floor
           all the way up through .tm-spop-sections-outer into .mx-2,
           forcing the ENTIRE form to refuse shrinking below ~700-744px
           regardless of actual window width — the table's own
           overflow-x:auto never got a chance to activate locally, because
           the whole page grew to fit it instead. */
        .tm-spop-sections-left, .tm-spop-sections-right, .sertifikat-section { min-width: 0; }
        /* Inner letak row: No. Persil/NIB and Alamat side by side (2 cols),
           RT/RW/Blok spans the full width below as its own row. Was
           flex-direction:column stacking every field full-width, which
           wasted the available width in this half-modal column — the
           Bootstrap col-lg-3 classes on these two fields were designed
           for a full 12-col-wide context, but at 25% of a HALF-width
           column they wrapped instead of sitting side by side. */
        .tm-letak-inner-stack {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            column-gap: 16px !important;
            row-gap: 0 !important;
        }
        .tm-letak-inner-stack > [class*="col-"] {
            flex: none !important;
            max-width: 100% !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
        }
        .tm-letak-inner-stack > .tm-rtrw-field-row {
            grid-column: 1 / -1 !important;
        }
        /* NOP Induk: label + input on one row instead of stacked (see
           flattenNopIndukRow in JS, which merges the two originally-
           separate centered sibling blocks into this wrapper). */
        .tm-nop-induk-row {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
        }
        .tm-nop-induk-row > .w-100.text-center.mb-4 {
            width: auto !important;
            margin-bottom: 0 !important;
        }
        .tm-nop-induk-row > center {
            display: block !important;
        }
        .tm-nop-induk-row > center .form-group.w-50 {
            width: auto !important;
            min-width: 240px;
            margin: 0 !important;
        }
        /* RT + RW paired side by side (placed after the rule above so it
           wins on equal specificity — source order is the tie-break) */
        .tm-rtrw-field-row {
            display: flex !important;
            gap: 16px !important;
        }
        .tm-rtrw-field-row > [class*="col-"] {
            flex: 1 1 0 !important;
            max-width: 100% !important;
            width: auto !important;
        }
        /* Data Tanah: 2 columns within right side */
        .tm-spop-sections-right .data-tanah-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0 !important;
        }
        .tm-spop-sections-right .data-tanah-grid > [class*="col-"] {
            max-width: 100% !important;
        }
        /* Only override the outer shell columns, NOT inner form-field cols.
           col-lg-4 / col-lg-8 are intentionally omitted to avoid overriding
           .data-tanah-grid and .data-letak-op-wrapper inner grids. */
        .tm-reorganized > .row,
        .tm-reorganized > .tm-spop-row {
            display: flex;
            flex-wrap: wrap;
        }
        .tm-reorganized > .row > .col-lg-12 {
            flex: 0 0 100% !important;
            max-width: 100% !important;
            padding: 0 15px !important;
        }
        /* SPOP: wider than the 1600px shell, but not edge-to-edge */
        .tm-reorganized > .tm-spop-row {
            width: 100vw;
            max-width: 100vw;
            margin-left: calc(50% - 50vw);
            margin-right: calc(50% - 50vw);
            justify-content: center;
            padding: 0 max(24px, 3vw);
            box-sizing: border-box;
        }
        .tm-reorganized > .tm-spop-row > .tm-spop-stage {
            flex: 0 0 auto !important;
            width: min(1760px, 100%) !important;
            max-width: min(1760px, 100%) !important;
            padding: 0 15px !important;
        }
        @media (max-width: 991px) {
            .tm-reorganized > .tm-spop-row {
                width: 100%;
                max-width: 100%;
                margin-left: 0;
                margin-right: 0;
                padding: 0;
            }
            .tm-reorganized > .tm-spop-row > .tm-spop-stage {
                width: 100% !important;
                max-width: 100% !important;
            }
        }
        /* ─── Riwayat timeline: fixed footprint, scroll all entries ─── */
        #collapse-riwayat {
            overflow: hidden;
        }
        #history-timeline {
            height: 320px !important;
            max-height: 320px !important;
            min-height: 320px !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            padding: 4px 6px 8px !important;
            border-radius: var(--m3-radius-sm);
            box-sizing: border-box;
        }
        #history-timeline .timeline { margin-bottom: 0; padding-top: 4px; }
        #history-timeline .timeline-title {
            color: var(--m3-on-surface) !important;
            font-size: 14px;
            line-height: 1.45;
            font-weight: 600;
        }
        #history-timeline .timeline-title b { font-weight: 700; }
        #history-timeline .timeline-body {
            color: var(--m3-on-surface-variant);
            font-size: 13px;
            line-height: 1.5;
            margin-top: 4px;
        }
        #history-timeline .timeline-body i { font-style: italic; }
        #history-timeline .timeline-footer {
            margin-top: 6px;
        }
        #history-timeline .timeline-footer .text-muted {
            color: var(--m3-on-surface-variant) !important;
            font-size: 12px;
        }
        #history-timeline .timeline-body .tm-m3-btn {
            margin-top: 6px;
            height: 28px;
            padding: 0 12px;
            font-size: 11px;
        }
        /* Connector line moves from center to left */
        #history-timeline .timeline.timeline-center::before {
            left: 18px !important;
            right: auto !important;
            background: var(--m3-outline) !important;
        }
        /* All items left — remove float/alternating-padding */
        #history-timeline .timeline-item,
        #history-timeline .timeline-item.timeline-inverted {
            float: none !important;
            clear: both !important;
            width: 100% !important;
            padding-left: 52px !important;
            padding-right: 0 !important;
            text-align: left !important;
            margin-bottom: 8px !important;
            position: relative !important;
        }
        /* Badge pinned to left */
        #history-timeline .timeline-badge {
            position: absolute !important;
            left: 0 !important;
            right: auto !important;
            top: 4px !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
        }
        /* Panel fills remaining width */
        #history-timeline .timeline-panel {
            float: none !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: var(--m3-radius-sm) !important;
            padding: 7px 10px !important;
        }
        /* Kill the directional arrow (wrong direction after layout change) */
        #history-timeline .timeline-panel::before,
        #history-timeline .timeline-panel::after { display: none !important; }
        /* Pemohon (no .timeline-inverted) = pastel orange */
        #history-timeline .timeline-item:not(.timeline-inverted):not(.tm-timeline-done) .timeline-badge {
            background-color: #FFCCAA !important;
        }
        #history-timeline .timeline-item:not(.timeline-inverted):not(.tm-timeline-done) .timeline-badge i {
            color: #C85000 !important;
        }
        #history-timeline .timeline-item:not(.timeline-inverted):not(.tm-timeline-done) .timeline-panel {
            background: rgba(255, 130, 30, 0.08) !important;
            border: 1px solid rgba(255, 130, 30, 0.28) !important;
        }
        /* Permohonan Selesai = pastel green */
        #history-timeline .timeline-item.tm-timeline-done .timeline-badge {
            background-color: #A8E6B8 !important;
        }
        #history-timeline .timeline-item.tm-timeline-done .timeline-badge i {
            color: #116329 !important;
        }
        #history-timeline .timeline-item.tm-timeline-done .timeline-panel {
            background: rgba(30, 180, 80, 0.10) !important;
            border: 1px solid rgba(30, 180, 80, 0.30) !important;
        }
        /* Petugas (.timeline-inverted) = pastel purple */
        #history-timeline .timeline-item.timeline-inverted .timeline-badge {
            background-color: #D4AAFF !important;
        }
        #history-timeline .timeline-item.timeline-inverted .timeline-badge i {
            color: #6600CC !important;
        }
        #history-timeline .timeline-item.timeline-inverted .timeline-panel {
            background: rgba(140, 60, 255, 0.08) !important;
            border: 1px solid rgba(140, 60, 255, 0.25) !important;
        }
        /* ─── Light mode (v1.0.9: now the default — retuned to match the
           GovTech reference mockup: soft gray page, white cards, green
           accent instead of the previous generic GitHub-light blue) ─── */
        html.tm-light {
            --m3-surface: #F3F5F7;
            --m3-surface-1: #FFFFFF;
            --m3-surface-2: #F8FAFB;
            --m3-outline: #E3E8EE;
            --m3-on-surface: #1F2937;
            --m3-on-surface-variant: #6B7280;
            --m3-primary: #16A34A;
            --m3-primary-container: #E7F6ED;
            --m3-secondary-container: #E7F6ED;
            --m3-error: #DC2626;
            --m3-tertiary: #C2410C;
        }
        html.tm-light .table-striped tbody tr:nth-of-type(odd) { background: #F6F8FA !important; }
        html.tm-light .table-bordered td,
        html.tm-light .table-bordered th { border-color: #D0D7DE !important; }
        html.tm-light .input-group-text.bg-danger, html.tm-light .bg-danger:not(.card-header),
        html.tm-light .badge-danger, html.tm-light .text-white.bg-danger:not(.card-header),
        html.tm-light span[class*="bg-danger"]:not(.card-header), html.tm-light .input-group-append span.bg-danger {
            background-color: #FFEBE9 !important;
            color: #CF222E !important;
            border-color: #FFCECB !important;
        }
        html.tm-light .btn-success { color: #1A7F37 !important; }
        html.tm-light .btn-danger  { background: #FFEBE9 !important; color: #CF222E !important; }
        html.tm-light .btn-warning { background: #FFF8E5 !important; color: #7D4E00 !important; }
        html.tm-light .left-sidebar.tm-visible { box-shadow: 2px 0 12px rgba(0,0,0,.12); }
        html.tm-light .select2-dropdown { box-shadow: 0 8px 24px rgba(0,0,0,.12); }
        html.tm-light .modal-content  { box-shadow: 0 16px 48px rgba(0,0,0,.15); }
        html.tm-light .card { box-shadow: 0 1px 3px rgba(0,0,0,.08) !important; }
        html.tm-light .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.14) !important; }
        html.tm-light #history-timeline .timeline-item:not(.timeline-inverted):not(.tm-timeline-done) .timeline-panel {
            background: rgba(255, 130, 30, 0.06) !important;
            border-color: rgba(255, 130, 30, 0.35) !important;
        }
        html.tm-light #history-timeline .timeline-item.timeline-inverted .timeline-panel {
            background: rgba(140, 60, 255, 0.05) !important;
            border-color: rgba(140, 60, 255, 0.30) !important;
        }
        html.tm-light #history-timeline .timeline-item.tm-timeline-done .timeline-panel {
            background: rgba(30, 180, 80, 0.06) !important;
            border-color: rgba(30, 180, 80, 0.35) !important;
        }
        /* ─── Theme toggle button ─── */
        #tm-theme-toggle {
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 99999;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid var(--m3-outline);
            background: var(--m3-surface-1);
            color: var(--m3-on-surface);
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform .15s, box-shadow .15s;
        }
        #tm-theme-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(0,0,0,.4);
        }

        /* ─── v1.0.9: Data Sertifikat compact row-table ─────────────────
           Source markup keeps every certificate's fields (Jenis Sertifikat,
           No. Sertifikat, Jenis Hak, Tanggal, Nama) stacked as separate
           Bootstrap .row blocks — fine for 1 certificate, brutal for 10+.
           We don't touch the field markup itself (names/ids/required attrs
           untouched, same as the rest of this script's philosophy) — we
           just grid-ify each existing .row via CSS and tag it in JS
           (see enhanceSertifikatSection below) so AJAX-appended rows get
           the same treatment as the ones present on load. */
        .tm-sertifikat-table {
            border: 1px solid var(--m3-outline);
            border-radius: var(--m3-radius-lg);
            overflow: hidden;
            background: var(--m3-surface-1);
            margin-top: 4px;
            /* Sertifikat now tucks under Data Tanah at desktop widths (half
               the page width, not full width) — a plain fr-based grid
               shrinks every column proportionally with no floor, which is
               what squeezed everything unreadable. Columns below get real
               minimum widths instead; if the tucked column is narrower
               than the row's min-width, this scrolls horizontally rather
               than wrapping a single certificate's fields onto 2 lines. */
            overflow-x: auto;
            /* v1.0.38: this container is now the actual grid; each
               .tm-sertifikat-row below uses subgrid to inherit these exact
               tracks instead of computing its own. Previously every row was
               an independent grid with identical grid-template-columns
               text — but independent grids don't share resolved track
               widths, so any per-row difference in content (a longer
               select2 label, native date-input rendering) could make one
               row's "140px" column resolve a few px wider or narrower than
               another row's supposedly-identical "140px" column. That's
               what caused the No./No. Sertifikat/Jenis Hak/etc. columns to
               drift out of alignment between certificate rows. Subgrid
               forces every row onto the SAME resolved tracks — alignment
               becomes structurally guaranteed instead of coincidental. */
            display: grid;
            grid-template-columns:
                32px
                minmax(140px, 1.3fr)
                minmax(130px, 1fr)
                minmax(130px, 1fr)
                minmax(140px, 1.2fr)
                44px;
        }
        /* #sertifikat_index is a real DOM wrapper div (direct child of
           .tm-sertifikat-table) that add_sertifikat_fields() inserts new
           certificate rows INTO — meaning AJAX-added rows (2nd cert
           onward) are actually grandchildren of .tm-sertifikat-table, one
           level deeper than the static #sertifikat1 row. CSS Subgrid only
           inherits column tracks from its immediate parent grid, so those
           nested rows never receive the same tracks as row 1 — they
           compute their own independently, which is what caused the
           column misalignment between certificate rows. display:contents
           removes this wrapper from the layout tree entirely, so its
           children behave as true direct children of .tm-sertifikat-table
           for grid/subgrid purposes.
           #sertifikat1 (the static first-row wrapper) has the SAME
           problem in its own right: it's also a direct child of the grid
           table, so without display:contents it gets auto-placed into
           just the first column cell (32px, the '#' track) as a single
           grid item — collapsing its own child .tm-sertifikat-row (which
           tries to subgrid across all columns) down into that one narrow
           32px cell instead of the full row width. Same fix, same reason. */
        .tm-sertifikat-table [id^="sertifikat"],
        .tm-sertifikat-table [class*="rmSertifikat"]:not(.tm-sertifikat-row) {
            display: contents !important;
        }
        /* ─── Data Sertifikat Header Bar ─── */
        .tm-sertifikat-header-bar {
            background: var(--m3-surface-2);
            border-bottom: 1px solid var(--m3-outline);
            border-radius: var(--m3-radius-lg) var(--m3-radius-lg) 0 0;
            padding: 8px 14px;
        }

        /* n2n01: Single-row layout (Title left, Pill center/right, Button right) */
        .tm-sertifikat-header-bar.tm-n2n01-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: nowrap;
            min-height: 44px;
        }
        .tm-n2n01-header > span {
            font-size: 14px !important;
            font-weight: 700 !important;
            color: var(--m3-primary) !important;
            white-space: nowrap;
            flex-shrink: 0;
            background: transparent !important;
            padding: 0 !important;
        }
        .tm-n2n01-header .tm-sertifikat-inline-jenis {
            flex: 1 1 auto;
            display: flex;
            justify-content: flex-end;
            margin: 0 8px;
            min-width: 0;
        }
        .tm-n2n01-header .tm-sertifikat-add-btn {
            flex-shrink: 0;
        }

        /* n2n02 / n2n03: 2-row stacked layout */
        .tm-sertifikat-header-bar.tm-n2n0203-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .tm-n2n0203-header .tm-sertifikat-header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }
        .tm-n2n0203-header .tm-sertifikat-header-top > span {
            font-size: 14px !important;
            font-weight: 700 !important;
            color: var(--m3-primary) !important;
            white-space: nowrap;
            background: transparent !important;
            padding: 0 !important;
        }
        .tm-n2n0203-header .tm-sertifikat-inline-jenis {
            width: 100%;
        }

        /* ─── Inline Jenis Sertifikat pill inside header bar ─── */
        .tm-sertifikat-inline-jenis .form-group {
            display: flex;
            align-items: center;
            gap: 0;
            margin-bottom: 0 !important;
            overflow: visible;
            background: var(--m3-surface-1);
            border: 1px solid var(--m3-outline);
            border-radius: var(--m3-radius-sm);
            padding: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,.06);
            width: 100%;
            height: 34px;
        }
        .tm-sertifikat-inline-jenis .form-group label {
            margin: 0;
            padding: 0 10px 0 12px;
            white-space: nowrap;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--m3-on-surface-variant);
            flex-shrink: 0;
            border-right: 1px solid var(--m3-outline);
            height: 100%;
            display: flex;
            align-items: center;
        }
        /* Strip select decoration & align select2 */
        .tm-sertifikat-inline-jenis .select2-container {
            flex: 1 1 auto;
            width: 100% !important;
            height: 34px !important;
        }
        .tm-sertifikat-inline-jenis .select2-container--bootstrap4 .select2-selection--single {
            position: relative !important;
            height: 34px !important;
            min-height: 34px !important;
            display: flex !important;
            align-items: center !important;
            padding-left: 10px !important;
            padding-right: 28px !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
        }
        .tm-sertifikat-inline-jenis .select2-selection__rendered {
            color: var(--m3-on-surface) !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            line-height: 34px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            padding: 0 !important;
        }
        .tm-sertifikat-inline-jenis .select2-selection__arrow {
            position: absolute !important;
            right: 8px !important;
            top: 0 !important;
            bottom: 0 !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
        }
        /* Error message floats below the pill */
        .tm-sertifikat-inline-jenis .text-danger.text-error {
            display: block;
            font-size: 11px;
            margin-top: 2px;
        }
        .tm-hidden-duplicate-btn { display: none !important; }

        .tm-sertifikat-row {
            display: grid !important;
            grid-column: 1 / -1 !important;
            grid-template-columns:
                32px
                minmax(140px, 1.3fr)
                minmax(130px, 1fr)
                minmax(130px, 1fr)
                minmax(140px, 1.2fr)
                44px !important;
            gap: 8px;
            align-items: center;
            padding: 7px 12px;
            flex-wrap: nowrap !important;
        }
        /* These cells are still real Bootstrap .col-sm-2/.col-sm-3 divs
           (untouched classes, by design — see comments elsewhere in this
           file about not renaming things). Under Bootstrap's own flexbox
           .row, that's fine. But now that their parent is display:grid,
           Bootstrap's max-width:16.666667% / flex-basis rules are STILL
           active CSS, and under Grid a child's percentage max-width
           resolves against its own already-sized grid track — so e.g. a
           130px-wide track gets re-clamped down to 16.667% of itself,
           ~21.67px. The row/track sizing was always correct; the content
           inside specific cells was being strangled by leftover Bootstrap
           column rules I never neutralized. Stripping them here lets each
           cell's content actually fill the track grid-template-columns
           already allocated for it. */
        .tm-sertifikat-row > [class*="col-sm-"],
        .tm-sertifikat-row > [class*="col-lg-"] {
            max-width: none !important;
            flex: none !important;
            flex-basis: auto !important;
            width: auto !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            min-width: 0 !important;
        }
        .tm-sertifikat-row.tm-sertifikat-head {
            background: var(--m3-surface-2);
            font-size: 11px;
            font-weight: 700;
            color: var(--m3-on-surface-variant);
            text-transform: uppercase;
            letter-spacing: .04em;
            border-bottom: 1px solid var(--m3-outline);
            position: sticky;
            top: 0;
            z-index: 1;
        }
        .tm-sertifikat-row.tm-cert-row {
            border-top: 1px solid var(--m3-outline);
        }
        .tm-sertifikat-row.tm-cert-row:first-of-type { border-top: none; }
        .tm-sertifikat-row.tm-cert-row.tm-row-alt { background: var(--m3-surface-2); }
        .tm-sertifikat-row.tm-cert-row .form-group { margin-bottom: 0 !important; }
        .tm-sertifikat-row.tm-cert-row .form-control { min-height: 32px; font-size: 12.5px; }
        .tm-sertifikat-row.tm-cert-row .select2-container--bootstrap4 .select2-selection { min-height: 32px; }
        .tm-col-no {
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            color: var(--m3-on-surface-variant);
        }
        .tm-col-aksi {
            display: flex;
            justify-content: center;
        }
        .tm-col-aksi .btn, .tm-col-aksi a {
            width: 28px;
            height: 28px;
            padding: 0 !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        /* Old stacked column-label row + legacy per-field <label> tags inside
           each cert row become redundant once the sticky grid header exists —
           hidden rather than removed, in case any page JS reads them. */
        .tm-sertifikat-legacy-label-row { display: none !important; }
        /* v1.0.11: removed the previous @media(max-width:991px) fallback
           that collapsed each row into an unlabeled 2-column stack. Two
           problems with it: (1) 991px was copy-pasted from the OUTER
           Letak/Tanah grid's breakpoint without checking it made sense
           here — Bootstrap's own col-sm-* only stacks below 576px, so this
           was forcibly breaking rows at widths (576–991px) where the
           original page would've displayed fine. (2) it was never
           finished — the "labels come from placeholders" comment
           describes a feature that was never built, so it just showed
           blank unlabeled fields. The grid's own min-width (700px, set
           above) + .tm-sertifikat-table's overflow-x:auto already handle
           any width narrower than that by scrolling horizontally instead
           of wrapping — which is both correct and complete, so a separate
           breakpoint override isn't needed at all right now. */

        /* ─── v1.0.9b: mockup-match section cards ───────────────────────
           The reference mockup shows Data Wajib Pajak / Data Letak Objek
           Pajak / Data Tanah / Data Sertifikat as four visually distinct
           white cards (not one long form with divider lines). Applied via
           JS to: the Data Wajib Pajak wrapper, tm-spop-sections-left
           (Letak), tm-spop-sections-right (Tanah), and .sertifikat-section. */
        .tm-section-card {
            background: var(--m3-surface-1);
            border: 1px solid var(--m3-outline);
            border-radius: var(--m3-radius-lg);
            padding: 16px 16px 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,.05);
        }
        /* Bootstrap's .row carries a negative left/right margin (its
           standard gutter-cancellation trick), meant to be absorbed by a
           parent's padding. Rows sitting directly in .mx-2 (e.g. the
           "Data PBB" / NOP row — it never got wrapped in a card) only have
           .mx-2's small default Bootstrap margin to work with, not real
           padding, so the row's edges can bleed past .mx-2's own box.
           With the ancestor .card clipping via overflow:hidden, that bleed
           becomes a silent horizontal cut instead of harmless negative
           space. Zeroing it here trades a few px of extra inset for
           guaranteed containment — applied to .tm-section-card rows too
           as a defensive measure even though card padding should already
           absorb Bootstrap's -15px there.

           v1.0.18: same exact bug, third location — the certificate rows
           carry BOTH Bootstrap's "row" class AND "tm-sertifikat-row" at
           once (<div class="row tm-sertifikat-row tm-cert-row">), so
           Bootstrap's -15px/-15px margin was bleeding the row past
           .tm-sertifikat-table's edge (measured: row 945.85px vs table
           925.85px = 20px overflow, matching this exact mechanism), which
           is what was forcing the "persistent scrollbar even though it
           looks roomy" — the row wasn't actually too wide for its
           content, it was too wide because of a margin trick meant for a
           different layout system than the grid it's actually in now. */
        .mx-2 > .row,
        .tm-section-card > .row,
        .tm-sertifikat-table .row {
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        /* Section header inside a card: left-aligned bold green label, no
           centered pill/line (that treatment stays for headers OUTSIDE
           tm-section-card, e.g. "Data PBB" at the very top of the form). */
        .tm-section-card > .w-100.text-center:first-child,
        .tm-section-card > .tm-sertifikat-header-bar:first-child {
            text-align: left !important;
            height: auto !important;
            border-bottom: none !important;
            margin: 0 0 14px !important;
            cursor: pointer;
            user-select: none;
        }
        .tm-section-card > .w-100.text-center:first-child span {
            background: transparent !important;
            padding: 0 !important;
            color: var(--m3-primary) !important;
            font-size: 15px !important;
            font-weight: 700 !important;
        }
        .tm-section-card.tm-card-collapsed {
            padding-bottom: 16px;
        }
        .tm-section-card.tm-card-collapsed > *:not(:first-child) {
            display: none !important;
        }
        /* v1.2.5: dedicated collapse chevron — previously the header was
           cursor:pointer with NO visual indicator at all, so clicking it
           felt like nothing happened until the body vanished/reappeared.
           injectCardToggles() (added below) inserts this button once per
           header; the rotation on .tm-card-collapsed is the actual
           feedback (▾ resting, rotates to ▸ when collapsed). */
        .tm-card-toggle-btn {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            margin-left: auto;
            flex-shrink: 0;
            border: none;
            background: transparent;
            color: var(--m3-primary);
            cursor: pointer;
            border-radius: 50%;
            transition: transform .25s cubic-bezier(.4,0,.2,1), background .15s ease;
        }
        .tm-card-toggle-btn:hover { background: rgba(121,192,255,.12); }
        .tm-card-toggle-btn svg { width: 16px; height: 16px; pointer-events: none; }
        .tm-section-card.tm-card-collapsed .tm-card-toggle-btn {
            transform: rotate(-90deg);
        }
        /* v1.0.22: reverted the v1.0.21 change that made Data Sertifikat's
           header strip gray. That was implemented exactly as asked at the
           time, but seeing it live made a problem visible that wasn't
           obvious from a static screenshot: it merged the header and the
           Jenis Sertifikat pill into one continuous gray zone, erasing the
           visual distinction between "section title bar" and "nested
           input control" — the header goes back to the plain white card
           background; only the Jenis Sertifikat control keeps its own
           distinct gray/nested styling below it. */
        /* 50/50 grid replaces the previous 36%/64% split — Letak Objek
           Pajak and Data Tanah now render as two equal-width cards with a
           real gap between them (gap does the separating job the old
           border-left divider used to do; with two genuinely separate
           card boxes now, a divider line on top of that would be visual
           noise, so it's not carried over).

           v1.0.10b: Sertifikat is now a THIRD grid child (moved into
           'outer' in JS, not left as a sibling below it) placed via
           grid-template-areas. At desktop widths Data Letak's column is
           taller than Data Tanah's (the Leaflet map does that), leaving
           dead space to the right of the map — Sertifikat fills that by
           sitting in the same column as Tanah, second row, with Letak's
           area spanning both rows so its height matches Tanah+Sertifikat
           stacked. Below the breakpoint, the areas collapse to a single
           column so Sertifikat becomes its own full-width row again —
           a 2-column layout stops making sense once there's no width left
           to compact Sertifikat's table into anyway. */
        .tm-spop-sections-outer {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
            grid-template-areas:
                "letak tanah"
                "letak sertifikat" !important;
            gap: 16px !important;
            align-items: start !important;
            margin-bottom: 16px;
        }
        .tm-spop-sections-left    { grid-area: letak; }
        .tm-spop-sections-right   { grid-area: tanah; }
        .sertifikat-section       { grid-area: sertifikat; }
        /* Raised from 991px to 1200px: at anything less than genuinely
           spacious full-width, a 2-column tuck starts squeezing both
           columns uncomfortably before actually reaching the old
           breakpoint — there was a real 'intermediate' squished zone
           between full-width-comfortable and 991px. Jump straight to
           full-width single-column stacking instead of lingering there. */
        @media (max-width: 1200px) {
            .tm-spop-sections-outer {
                grid-template-columns: 1fr !important;
                grid-template-rows: auto auto auto !important;
                grid-template-areas:
                    "letak"
                    "tanah"
                    "sertifikat" !important;
            }
        }
        /* n2n02/n2n03 "Lihat SPOP" modal: NEVER tuck Sertifikat under Tanah,
           at any width — always its own full-width row below both columns.
           The tuck layout only makes sense on the free-flowing n2n01 page;
           inside the modal's constrained/scrolling body it should just
           stack predictably. Unconditional (no media query) so it
           overrides the desktop 2-column tuck above regardless of the
           modal's width. */
        #formSpop .tm-spop-sections-outer {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
            grid-template-areas:
                "letak tanah"
                "sertifikat sertifikat" !important;
        }
        @media (max-width: 1200px) {
            #formSpop .tm-spop-sections-outer {
                grid-template-columns: 1fr !important;
                grid-template-rows: auto auto auto !important;
                grid-template-areas:
                    "letak"
                    "tanah"
                    "sertifikat" !important;
            }
        }
        /* Data Sertifikat: card chrome + spacing. No longer assumes
           full-width — at desktop widths it's exactly as wide as the
           Tanah column above it (see grid-template-areas above). */
        .sertifikat-section.tm-section-card {
            margin-top: 0;
        }
        .tm-sertifikat-table {
            margin-top: 0;
            border: none;
            box-shadow: none;
        }

        /* ─── v1.0.23: HARD COMPLIANCE — near-zero header spacing ───────
           The earlier ".tm-section-card > .w-100.text-center:first-child"
           rule was meant to override Bootstrap's mt-4/mb-4 utility margins
           (1.5rem/24px each) on every section header, but wasn't reliably
           winning in every card — confirmed live via devtools margin
           overlay on "Data Letak Objek Pajak" still showing the full 24px
           bands. Rather than debug the exact specificity conflict, this
           matches Bootstrap's own class combination directly (same
           technique it uses internally for its utilities) and is placed
           last in the stylesheet so it also wins any remaining
           source-order tie. Applies to every section header in every
           card — Data Wajib Pajak, Letak, Tanah, Sertifikat — not just
           the first one. */
        .w-100.text-center,
        .w-100.text-center.mt-4.mb-4,
        .w-100.text-center.mb-4,
        .w-100.text-center.mt-4,
        .tm-section-card .w-100.text-center,
        div.w-100.text-center {
            margin-top: 2px !important;
            margin-bottom: 4px !important;
            height: auto !important;
        }

        /* ─── v1.0.39: Approval form — full width, no spacers, fix Select2 ───
           The Konfirmasi card's approval form uses a .row.justify-content-md-center
           with two EMPTY .col-md-4 columns as spacers, plus the textarea in its own
           .col-md-4 — wasting 8 of 12 grid columns. The two selects (Tinjau Lapang,
           Petugas) are .col-md-2 each, but the row totals 16 columns (4+4+4+2+2),
           so they wrap. On top of that, #collapse-approval was never in the global
           Select2 width-fix list, so the container collapses to ~1px and the
           white-space:normal rule on .select2-selection__rendered stacks the text
           vertically letter-by-letter inside the 82px-wide column. */
        #collapse-approval .row {
            justify-content: flex-start !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        /* Kill empty spacer columns */
        #collapse-approval .row > [class*="col-"]:empty,
        #collapse-approval .row > [class*="col-"]:not(:has(*)) {
            display: none !important;
        }
        /* Textarea wrapper becomes full width (100%) */
        #collapse-approval [class*="col-"]:has(textarea),
        #collapse-approval .form-group:has(textarea) {
            flex: 0 0 100% !important;
            max-width: 100% !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
        }
        /* Tinjau Lapang + Petugas: 50/50 side by side */
        #collapse-approval .tinjau_lapang_frm,
        #collapse-approval .petugas-survei {
            flex: 0 0 50% !important;
            max-width: 50% !important;
            width: 50% !important;
        }
        /* v1.2.5: the 50/50 split above had no lower bound — on phone
           widths (~360-400px) each half is only ~150-180px, and the
           ellipsis rule below (necessary to stop letter-by-letter
           stacking) then truncates the selected option down to 2-3
           visible characters. Technically not broken, but unreadable —
           user can't tell what they actually selected without opening
           the dropdown again. Stack to full width below 480px so the
           full option text fits; 50/50 stays intact everywhere wider. */
        @media (max-width: 480px) {
            #collapse-approval .tinjau_lapang_frm,
            #collapse-approval .petugas-survei {
                flex: 0 0 100% !important;
                max-width: 100% !important;
                width: 100% !important;
            }
        }
        /* Select2 width fix — this container was missing from the global list */
        #collapse-approval .select2-container {
            width: 100% !important;
            max-width: 100% !important;
            display: block;
        }
        /* Stop "Silahkan Pilih" from stacking vertically */
        #collapse-approval .select2-selection__rendered {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            word-break: normal !important;
        }
        /* Left-align checkbox + buttons instead of <center> */
        #collapse-approval center {
            text-align: left !important;
        }

        /* ===============================================================
           v1.2.9 - UI/UX pass
           =============================================================== */

        /* --- 1. Keyboard focus visibility ------------------------------
           The base theme set outline:none on .form-control:focus and gave
           it only a 3px rgba(...,.15) glow. Against the light-mode #FFFFFF
           card that glow is ~1.1:1 - effectively invisible, so a keyboard
           user tabbing through this form had NO idea where they were. The
           glow stays (it is good design), but :focus-visible now adds a
           real, high-contrast ring on top of it.

           :focus-visible (not :focus) is deliberate: it only matches for
           keyboard/AT interaction, so mouse users clicking into a field
           still get the subtle glow without a heavy ring. */
        .form-control:focus-visible,
        .custom-select:focus-visible {
            outline: 2px solid var(--m3-primary) !important;
            outline-offset: 1px !important;
            box-shadow: 0 0 0 4px rgba(22, 163, 74, .18) !important;
        }
        /* Buttons, links, and the injected collapse chevron all need a ring
           too - the browser default was being suppressed by the theme's
           broad outline:none rules. */
        .btn:focus-visible,
        a:focus-visible,
        button:focus-visible,
        .tm-card-toggle-btn:focus-visible,
        .page-link:focus-visible,
        select:focus-visible,
        input[type="checkbox"]:focus-visible,
        input[type="radio"]:focus-visible,
        textarea:focus-visible {
            outline: 2px solid var(--m3-primary) !important;
            outline-offset: 2px !important;
        }
        /* Dark mode's primary is a light blue, so the green-tinted glow
           above would clash - retint it there. */
        html:not(.tm-light) .form-control:focus-visible,
        html:not(.tm-light) .custom-select:focus-visible {
            box-shadow: 0 0 0 4px rgba(121, 192, 255, .22) !important;
        }
        /* Select2 renders a div, not a native control, so it never receives
           :focus-visible itself - the ring has to be driven off the real
           select's focus state via the container class Select2 toggles. */
        .select2-container--focus .select2-selection,
        .select2-container--open .select2-selection {
            border-color: var(--m3-primary) !important;
            box-shadow: 0 0 0 3px rgba(22, 163, 74, .18) !important;
        }
        html:not(.tm-light) .select2-container--focus .select2-selection,
        html:not(.tm-light) .select2-container--open .select2-selection {
            box-shadow: 0 0 0 3px rgba(121, 192, 255, .22) !important;
        }

        /* --- 2. Reduced motion -----------------------------------------
           The theme animates cards, the collapse chevron, sidebar slides
           and dropdowns. For users who set "reduce motion" at the OS level
           (vestibular disorders, motion sensitivity) these are exactly the
           transitions to suppress. Durations are dropped to ~0 rather than
           set to transition:none so transitionend-driven code still fires
           and nothing that waits on an animation event hangs. */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: .001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: .001ms !important;
                scroll-behavior: auto !important;
            }
            .card:hover { transform: none !important; }
            #tm-theme-toggle:hover { transform: none !important; }
            .tm-card-toggle-btn { transition: none !important; }
        }

        /* --- 3. Collapse chevron: hit area + state affordance ----------
           The button was 22x22 - below the 24x24 WCAG 2.2 "Target Size
           (Minimum)" floor and well below the 44x44 touch guideline, on a
           control that sits in the most-tapped region of the page on a
           phone. The visual dot stays small; the hit area grows to 34px. */
        .tm-card-toggle-btn {
            width: 34px !important;
            height: 34px !important;
            margin-right: -6px;
        }
        .tm-card-toggle-btn svg { width: 18px; height: 18px; }
        /* The header is the real click target, so give it the affordance
           too - previously it was cursor:pointer with no hover feedback. */
        .card-header > a:hover .tm-card-toggle-btn,
        .card-header:hover .tm-card-toggle-btn {
            background: rgba(22, 163, 74, .12);
        }

        /* --- 4. Theme-aware section headers ----------------------------
           The six section headers had fixed hex backgrounds (#3B82F6,
           #F5A623, #E11D48, #10B981, #06B6D4, #6366F1) chosen for the dark
           theme, applied in BOTH themes. In light mode #F5A623 with
           #3D2A00 text and #06B6D4 with #fff text sat right at the edge of
           legibility, and the palette read as neon against the soft
           #F3F5F7 GovTech surface.

           Rather than re-hardcode a second palette, each header now
           exposes two custom properties (a background and a foreground)
           that the light/dark blocks below override, so a future change
           touches one pair of values per section.

           Contrast audit (WCAG 2.1, computed against the real foreground):
             v1.2.8 dark palette had FOUR of six headers below the 4.5:1
             AA floor for normal text - Pemohon 3.68:1, Permohonan 2.54:1,
             lspop 2.43:1, Approval 4.47:1 - all white-on-saturated-hue.
             Fixed by keeping the exact background hues (so each section
             stays instantly recognisable, which was the original design
             intent) and flipping the four failing ones to dark text:
             Pemohon 5.15:1, Permohonan 7.46:1, lspop 7.79:1.
             Approval is the one hue where neither polarity clears AA at
             the original saturation (white 4.47:1, dark 4.02:1), so its
             background is deepened one step instead: #4F46E5 = 6.29:1
             with white.
           All twelve pairings across both themes now clear AA. */
        #headingPemohon, #headingSyarat, #headingRiwayat,
        #headingPermohonan, #headinglspop, #headingApproval {
            background: var(--tm-hdr-bg) !important;
            transition: background .2s ease;
        }
        #headingPemohon h4, #headingSyarat h4, #headingRiwayat h4,
        #headingPermohonan h4, #headinglspop h4, #headingApproval h4 {
            color: var(--tm-hdr-fg) !important;
        }
        #headingPemohon    { --tm-hdr-bg: #3B82F6; --tm-hdr-fg: #0D1117; }
        #headingSyarat     { --tm-hdr-bg: #F5A623; --tm-hdr-fg: #3D2A00; }
        #headingRiwayat    { --tm-hdr-bg: #E11D48; --tm-hdr-fg: #fff; }
        #headingPermohonan { --tm-hdr-bg: #10B981; --tm-hdr-fg: #0D1117; }
        #headinglspop      { --tm-hdr-bg: #06B6D4; --tm-hdr-fg: #0D1117; }
        #headingApproval   { --tm-hdr-bg: #4F46E5; --tm-hdr-fg: #fff; }

        /* Light mode: deepened hues so white text clears AA comfortably and
           the set reads as one family against the white cards. */
        html.tm-light #headingPemohon    { --tm-hdr-bg: #1D4ED8; --tm-hdr-fg: #FFFFFF; }
        html.tm-light #headingSyarat     { --tm-hdr-bg: #B45309; --tm-hdr-fg: #FFFFFF; }
        html.tm-light #headingRiwayat    { --tm-hdr-bg: #BE123C; --tm-hdr-fg: #FFFFFF; }
        html.tm-light #headingPermohonan { --tm-hdr-bg: #047857; --tm-hdr-fg: #FFFFFF; }
        html.tm-light #headinglspop      { --tm-hdr-bg: #0E7490; --tm-hdr-fg: #FFFFFF; }
        html.tm-light #headingApproval   { --tm-hdr-bg: #4338CA; --tm-hdr-fg: #FFFFFF; }

        /* --- 5. Map height ---------------------------------------------
           #peta was pinned to height:240px !important, overriding the
           page's own 400px. 240px is too short to place a coordinate
           accurately, which is the entire purpose of this widget. It now
           scales with the viewport (clamped) so it stays usable in a short
           window without dominating a tall one. */
        #peta {
            height: clamp(280px, 42vh, 460px) !important;
            min-height: 280px;
        }

        /* --- 6. Mobile DataTables --------------------------------------
           On a phone the SPOP/LSPOP tables were a horizontal-scroll trap:
           the header row scrolls out of view, so by the time you reach the
           Aksi column you can no longer tell which column you are reading.
           Below 768px each row becomes a stacked block with its column
           name printed from the data-label attribute that JS now writes
           (see addResponsiveTableLabels). */
        @media (max-width: 767px) {
            .tm-responsive-stack table.dataTable thead { display: none !important; }
            .tm-responsive-stack table.dataTable,
            .tm-responsive-stack table.dataTable tbody,
            .tm-responsive-stack table.dataTable tr,
            .tm-responsive-stack table.dataTable td {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            .tm-responsive-stack table.dataTable tr {
                border: 1px solid var(--m3-outline) !important;
                border-radius: var(--m3-radius-sm) !important;
                margin-bottom: 10px !important;
                background: var(--m3-surface-1) !important;
                overflow: hidden;
            }
            .tm-responsive-stack table.dataTable td {
                border: none !important;
                border-bottom: 1px solid var(--m3-outline) !important;
                padding: 7px 10px 7px 44% !important;
                position: relative;
                min-height: 34px;
                text-align: left !important;
                white-space: normal !important;
                word-break: break-word;
            }
            .tm-responsive-stack table.dataTable td:last-child { border-bottom: none !important; }
            /* The label is absolutely positioned in the left 40% gutter so
               long values wrap naturally instead of being pushed out. */
            .tm-responsive-stack table.dataTable td::before {
                content: attr(data-label);
                position: absolute;
                left: 10px;
                top: 7px;
                width: 38%;
                padding-right: 8px;
                font-weight: 700;
                font-size: 11px;
                letter-spacing: .03em;
                text-transform: uppercase;
                color: var(--m3-on-surface-variant);
                white-space: normal;
                line-height: 1.4;
            }
            /* The serial-number / index columns carry no information once
               stacked (the card order already conveys it) and their label
               gutter just wastes a line. */
            .tm-responsive-stack table.dataTable td.tm-hide-col { display: none !important; }
            .tm-responsive-stack .dataTables_wrapper { overflow-x: visible !important; }
            .tm-responsive-stack .dataTables_filter,
            .tm-responsive-stack .dataTables_length { text-align: left !important; }
            .tm-responsive-stack .dataTables_filter input { width: 100% !important; }
        }

        /* --- 7. Windowed / short-viewport scaling ----------------------
           The layout was tuned for a maximised window. Restored to a
           smaller window it kept its desktop two-column geometry, so the
           SPOP grid (min-width ~700px) forced the whole page to scroll
           sideways and the fixed header ate a disproportionate share of
           the viewport.

           These queries key off BOTH width and height, so a wide-but-short
           window (the common "snapped to half screen" case) gets the
           compact treatment even though its width alone would say
           "desktop". */
        @media (max-height: 800px) {
            /* Reclaim vertical space from the chrome when the window is
               short: the topbar and page padding are pure overhead here. */
            .container-fluid { padding-top: 8px !important; padding-bottom: 8px !important; }
            .card-body { padding: 10px 12px !important; }
            .card-header { min-height: 46px !important; padding: 8px 14px !important; }
            .card { margin-bottom: 10px !important; }
            #peta { height: clamp(240px, 38vh, 340px) !important; min-height: 240px; }
        }
        @media (max-height: 620px) {
            /* Very short (e.g. a laptop in split-screen landscape): drop the
               non-essential chrome entirely and tighten to the minimum. */
            .topbar { display: none !important; }
            .container-fluid { padding: 6px 12px !important; }
            .card-header { min-height: 40px !important; padding: 6px 12px !important; }
            .card-header h4 { font-size: 14px !important; }
            .card-body { padding: 8px 10px !important; }
            #peta { height: 220px !important; min-height: 220px; }
            .footer { display: none !important; }
        }
        /* Narrow-but-tall windows between the tablet and phone tiers:
           without this, 768-991px kept a cramped two-column split. */
        @media (min-width: 768px) and (max-width: 991px) {
            .tm-lspop-konfirmasi-shell { flex-direction: column !important; }
            .tm-lspop-col, .tm-konfirmasi-col { flex: none !important; width: 100% !important; }
        }
        /* Guard the whole form against ever forcing a horizontal scrollbar
           on the page itself. Individual tables still scroll internally
           where they must, but the page body should not. */
        html, body { max-width: 100%; overflow-x: hidden; }
        .page-wrapper { min-width: 0 !important; }
        .container-fluid { min-width: 0 !important; }
    `;
    document.head.appendChild(styleEl);

    /* ─── Sidebar toggle ─── */
    const sidebar = document.querySelector('.left-sidebar');
    if (sidebar) {
        // v1.2.5: previously the sidebar just silently closed on any
        // outside click with zero visual affordance beforehand — nothing
        // told the user that clicking elsewhere would dismiss it, so an
        // accidental tap felt like the panel randomly vanished. A dimmed
        // backdrop makes the "this is modal-ish, click away to close"
        // relationship visible while it's open, same pattern as the
        // existing modal/customizer overlays elsewhere in this script.
        const backdrop = document.createElement('div');
        backdrop.className = 'tm-sidebar-backdrop';
        document.body.appendChild(backdrop);

        const setVisible = show => {
            sidebar.classList.toggle('tm-visible', show);
            backdrop.classList.toggle('tm-visible', show);
        };
        const onToggle = () => setVisible(!sidebar.classList.contains('tm-visible'));
        const onOutside = e => {
            if (sidebar.classList.contains('tm-visible') &&
                !sidebar.contains(e.target) &&
                !e.target.closest('.sidebartoggler, .nav-toggler'))
                setVisible(false);
        };
        backdrop.addEventListener('click', () => setVisible(false));
        document.querySelectorAll('.sidebartoggler, .nav-toggler')
            .forEach(b => b.addEventListener('click', onToggle));
        document.addEventListener('click', onOutside);
        // Clean up the document-level listener on page exit
        onUnload(() => {
            document.querySelectorAll('.sidebartoggler, .nav-toggler')
                .forEach(b => b.removeEventListener('click', onToggle));
            document.removeEventListener('click', onOutside);
            backdrop.remove();
        });
    }

    /* ─── Customizer (discussion panel) toggle ─── */
    // Uses capture phase to intercept the toggle click before the site's own
    // jQuery scripts or delegated event handlers can run and double-toggle the class.
    (function wireCustomizerToggle() {
        const onCaptureClick = e => {
            const toggleBtn = e.target.closest('.service-panel-toggle');
            const customizer = document.querySelector('.customizer');
            if (!customizer) return;

            if (toggleBtn && customizer.contains(toggleBtn)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                customizer.classList.toggle('show-service-panel');
            }
        };

        const onBubbleClick = e => {
            const customizer = document.querySelector('.customizer');
            if (!customizer) return;

            if (customizer.classList.contains('show-service-panel') &&
                !customizer.contains(e.target)) {
                customizer.classList.remove('show-service-panel');
            }
        };

        // Intercept during capture phase to prevent page script conflicts
        document.body.addEventListener('click', onCaptureClick, true);
        // Handle outside click dismissal in the bubble phase
        document.body.addEventListener('click', onBubbleClick);

        onUnload(() => {
            document.body.removeEventListener('click', onCaptureClick, true);
            document.body.removeEventListener('click', onBubbleClick);
        });
    })();


    /* ─── Fix broken links ─── */
    // WeakSet: elements are GC'd naturally when removed from DOM
    const processed = new WeakSet();
    function fixButton(a) {
        if (processed.has(a)) return;
        const m = (a.getAttribute('onclick') || '').match(/window\.open\(['"]([^'"]+)['"]/);
        if (!m) return;
        processed.add(a);
        const url = m[1];
        const open = e => { e.preventDefault(); e.stopPropagation(); window.open(url, '_blank'); };
        a.removeAttribute('onclick');
        a.className = 'tm-m3-btn';
        a.href = url;
        a.title = 'Buka di tab baru';
        a.textContent = 'Lihat ↗';
        a.addEventListener('click', open);  // left click
        a.addEventListener('auxclick', open); // middle click
        // No unload cleanup needed: listeners die with the element
    }
    /* ─── LSPOP table: shorten headers ('Luas Bangunan' → 'Luas', 'Jenis
       Bangunan' → 'Jenis', etc.) — 'Bangunan' is redundant since the whole
       table is already about bangunan (buildings). Also fixes 2-line header
       wrapping, which was throwing off DataTables' sort-arrow vertical
       position (it assumes a single-line header height). Idempotent: only
       touches th's that still contain the word, so repeated scan() calls
       are safe. */
    function shortenLspopHeaders() {
        document.querySelectorAll('#lspopTable thead th').forEach(th => {
            if (/\bBangunan\b/.test(th.textContent)) {
                th.textContent = th.textContent.replace(/\s*\bBangunan\b\s*/g, ' ').trim();
            }
        });
        /* 'Tahun Bangun' doesn't match \bBangunan\b above (different word —
           'Bangun', not 'Bangunan'), so it needs its own explicit rename. */
        document.querySelectorAll('#lspopTable thead th').forEach(th => {
            if (th.textContent.trim() === 'Tahun Bangun') th.textContent = 'Tahun';
        });
    }
    /* ─── spopTable/lspopTable: hide numbering column, clip long text,
       keep specific columns ('NO SPOP', 'Luas') always fully visible ─── */
    /* Tagged by header TEXT rather than position — column order isn't
       guaranteed identical across every page these tables might appear on,
       same reasoning as the permitList/globalTable header-tagging fixes. */
    function tagSpopLspopColumns() {
        [
            { id: 'spopTable', rename: { 'No. Formulir SPOP': 'NO SPOP' }, stripWord: 'Tanah', neverClip: ['NO SPOP', 'Luas'] },
            { id: 'lspopTable', rename: {}, stripWord: null, neverClip: ['No. SPOP', 'Luas'] },
        ].forEach(cfg => {
            const table = document.getElementById(cfg.id);
            if (!table) return;
            [...table.querySelectorAll('thead th')].forEach((th, i) => {
                let text = th.textContent.trim();
                if (cfg.rename[text]) {
                    th.textContent = cfg.rename[text];
                    text = cfg.rename[text];
                }
                if (cfg.stripWord) {
                    const re = new RegExp('\\s*\\b' + cfg.stripWord + '\\b\\s*', 'g');
                    const stripped = text.replace(re, ' ').trim();
                    if (stripped !== text) {
                        th.textContent = stripped;
                        text = stripped;
                    }
                }
                const isFirst = i === 0;
                const isNeverClip = cfg.neverClip.includes(text);
                th.classList.toggle('tm-hide-col', isFirst);
                th.classList.toggle('tm-nocollapse', !isFirst && isNeverClip);
                table.querySelectorAll('tbody tr').forEach(tr => {
                    const td = tr.children[i];
                    if (!td) return;
                    td.classList.toggle('tm-hide-col', isFirst);
                    td.classList.toggle('tm-nocollapse', !isFirst && isNeverClip);
                });
            });
        });
    }

    /* ─── DataTables AJAX Auto-Retry & In-Table Reload Button ──────────
       v1.2.0: Replaces default DataTables alert() popups (e.g. Tech Note 7 AJAX errors)
       with an in-table retry UI. When an AJAX call fails on spopTable or lspopTable,
       this suppresses the browser alert and renders a clean "Gagal memuat data — [Coba Lagi]"
       button inside the table body. Clicking [Coba Lagi] re-triggers dt.ajax.reload(). */
    (function wireDataTableAutoRetry() {
        const suppressAlert = () => {
            if (window.jQuery?.fn?.dataTable) {
                window.jQuery.fn.dataTable.ext.errMode = 'none';
            }
        };

        const handleDtError = (e, settings, techNote, message) => {
            const tableId = settings?.sTableId;
            if (!tableId || (tableId !== 'spopTable' && tableId !== 'lspopTable')) return;

            console.warn(`[tm][DataTables] AJAX load error on #${tableId} (TechNote ${techNote}):`, message);

            const tbody = document.querySelector(`#${tableId} tbody`);
            if (tbody) {
                const label = tableId === 'spopTable' ? 'SPOP' : 'LSPOP';
                tbody.innerHTML = `
                    <tr class="tm-dt-error-row">
                        <td colspan="100%" style="text-align:center; padding:16px 12px; background:var(--m3-surface-2, #1C2128);">
                            <span style="font-weight:600; color:var(--m3-error, #FF7B72); margin-right:12px; font-size:13px;">
                                ⚠️ Gagal memuat data ${label} (AJAX Error)
                            </span>
                            <button type="button" class="tm-m3-btn tm-dt-retry-btn" data-table-id="${tableId}" style="cursor:pointer; font-size:12px; padding:4px 12px;">
                                ↻ Coba Lagi
                            </button>
                        </td>
                    </tr>
                `;
            }
        };

        if (window.jQuery) {
            window.jQuery(document).on('error.dt', handleDtError);
            suppressAlert();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                if (window.jQuery) {
                    window.jQuery(document).on('error.dt', handleDtError);
                    suppressAlert();
                }
            });
        }

        document.addEventListener('click', e => {
            const btn = e.target.closest('.tm-dt-retry-btn');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            const tableId = btn.dataset.tableId;
            if (!tableId || !window.jQuery) return;

            const dt = window.jQuery(`#${tableId}`).DataTable();
            if (dt && typeof dt.ajax?.reload === 'function') {
                btn.disabled = true;
                btn.textContent = 'Memuat...';
                dt.ajax.reload(null, false);

                // v1.2.5: on a normal success, DataTables' own draw()
                // replaces this <tbody> wholesale — including this button
                // — so it's naturally gone and there's nothing to reset.
                // On a normal repeat failure, handleDtError above rebuilds
                // a fresh (non-disabled) button. The gap was a REQUEST
                // THAT NEVER RESOLVES (dropped connection, server hang) —
                // neither event fires, and this exact button node just
                // sits there disabled/'Memuat...' forever with no way to
                // retry again short of a full page reload. 8s safety net:
                // if this specific button is still in the DOM and still
                // disabled after that, something never came back — hand
                // control back to the user instead of leaving it dead.
                setTimeout(() => {
                    if (btn.isConnected && btn.disabled) {
                        btn.disabled = false;
                        btn.textContent = '↻ Coba Lagi';
                    }
                }, 8000);
            }
        });
    })();
    /* ─── Konfirmasi "centang" note: line-break + wording fix ──────────
       Server markup renders this as one run-on line: "Jika berkas sudah
       lengkap silahkan centang. ( Revisi tidak perlu dicentang, Cukup
       isi catatan revisi!)" — requested as two lines, with "dicentang"
       corrected to "centang".

       v1.0.35b: previous version found the smallest ELEMENT whose
       textContent included the phrase and overwrote its innerHTML —
       but in this panel's actual markup the phrase is a bare text node
       sitting directly inside #collapse-approval alongside the
       checkbox/textarea/buttons, with no dedicated wrapper of its own.
       That made #collapse-approval itself the "smallest matching
       element", and innerHTML = wiped the entire card (checkbox, form,
       buttons — everything). Fixed by never touching an element's
       innerHTML at all: walk TEXT NODES only, split just the one
       node that starts the sentence to insert a <br>, and leave every
       sibling/child element (including whatever red-colored element the
       site already uses for the second half) completely untouched. */
    function enhanceKonfirmasiCentangNote() {
        const konfirmasi = document.getElementById('headingApproval')?.closest('.card');
        if (!konfirmasi || konfirmasi.dataset.tmCentangNote === '1') return;

        const walker = document.createTreeWalker(konfirmasi, NodeFilter.SHOW_TEXT);
        let node, found = false;
        while ((node = walker.nextNode())) {
            const norm = node.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
            if (!norm.startsWith('jika berkas sudah lengkap')) continue;

            const raw = node.textContent;
            const parenIdx = raw.indexOf('(');
            if (parenIdx === -1) {
                // Rest of the sentence lives in a later sibling (e.g. a
                // separately-colored <span>) — just break the line right
                // after this node, nothing else to split here.
                node.after(document.createElement('br'));
            } else {
                // "(" is inside this same text node — split it there so
                // "Jika berkas...centang" and "( Revisi..." land on
                // separate lines, keeping both halves as plain text
                // (no element rebuilt, no styling touched).
                const before = raw.slice(0, parenIdx).replace(/[.\s]+$/, '');
                const after = raw.slice(parenIdx);
                node.replaceWith(
                    document.createTextNode(before),
                    document.createElement('br'),
                    document.createTextNode(after)
                );
            }
            found = true;
            break;
        }

        // Wording fix: "dicentang" -> "centang", wherever it lives (own
        // text node, possibly inside the site's red-colored element) —
        // matched by content only, so it doesn't matter which element
        // holds it or how it's styled.
        const walker2 = document.createTreeWalker(konfirmasi, NodeFilter.SHOW_TEXT);
        let n2;
        while ((n2 = walker2.nextNode())) {
            if (/dicentang/i.test(n2.textContent)) {
                n2.textContent = n2.textContent.replace(/dicentang/i, 'centang');
            }
        }

        if (found) konfirmasi.dataset.tmCentangNote = '1';
    }

    /* ─── Approval form: strip empty spacers, full-width textarea,
           widen Select2 columns so text never stacks vertically ─── */
    function enhanceApprovalForm() {
        const approval = document.getElementById('collapse-approval');
        if (!approval || approval.dataset.tmApprovalEnhanced === '1') return;

        const row = approval.querySelector('.row');
        if (!row) return;

        // 1. Remove empty spacer columns
        row.querySelectorAll('[class*="col-"]').forEach(col => {
            const hasContent = col.querySelector('textarea, input, select, button, .alert, [class*="alert"]');
            const hasText = col.textContent.trim().length > 0;
            if (!hasContent && !hasText) col.remove();
        });

        // 2. Make the column containing textarea full width (100%)
        row.querySelectorAll('[class*="col-"]').forEach(col => {
            if (col.querySelector('textarea')) {
                col.classList.remove('col-md-4', 'col-md-6', 'col-sm-6');
                col.classList.add('col-12');
                col.style.setProperty('flex', '0 0 100%', 'important');
                col.style.setProperty('max-width', '100%', 'important');
                col.style.setProperty('width', '100%', 'important');
                col.style.paddingLeft = '0';
                col.style.paddingRight = '0';
            }
        });

        // 3. Upgrade the select columns from .col-md-2 → .col-md-6
        row.querySelectorAll('.col-md-2').forEach(col => {
            col.classList.remove('col-md-2');
            col.classList.add('col-md-6');
        });

        // 4. Force Select2 containers to 100% (global fix misses this block)
        approval.querySelectorAll('.select2-container').forEach(el => {
            el.style.setProperty('width', '100%', 'important');
            el.style.removeProperty('max-width');
        });

        // 5. Safety net: force nowrap on already-rendered Select2 text
        approval.querySelectorAll('.select2-selection__rendered').forEach(el => {
            el.style.setProperty('white-space', 'nowrap', 'important');
        });

        approval.dataset.tmApprovalEnhanced = '1';
    }

    /* ─── v1.2.5: inject the actual chevron toggle button ───────────────
       Referenced in comments since v1.1.2 but never implemented — the
       collapse/expand click handler existed, but nothing ever showed the
       user whether a header was expandable or which state it was in.
       Idempotent via dataset.tmToggleAdded so repeated scan() passes are
       a cheap no-op once a header already has its button.

       v1.2.9 — the ARIA was wrong, not just missing. The button shipped a
       static English label ("Toggle section") on an Indonesian UI, and
       never reported its state, so a screen-reader user heard identical
       words whether the section was open or closed. It now:
         - derives its label from the section's own visible title,
         - mirrors the collapsed state into aria-expanded,
         - points aria-controls at the panel it actually governs.
       The visible header <a> already carries aria-expanded from
       Bootstrap's collapse plugin, so we sync to that rather than
       tracking a second copy of the same state — two independent copies
       of one truth is exactly how they drift apart. */
    function injectCardToggles() {
        document.querySelectorAll(
            '.tm-section-card > .w-100.text-center:first-child, ' +
            '.tm-section-card > .tm-sertifikat-header-bar:first-child'
        ).forEach(header => {
            if (header.dataset.tmToggleAdded === '1') return;
            header.dataset.tmToggleAdded = '1';

            const card = header.closest('.tm-section-card');

            // Pull a human title off the header for the accessible name.
            // Falls back to the generic phrasing only when there is
            // genuinely no text to read, so the label is specific in every
            // real case instead of repeating on all six sections.
            const titleEl = header.querySelector('span, h1, h2, h3, h4, h5, h6');
            const sectionTitle = (titleEl?.textContent || '').trim().replace(/\s+/g, ' ');

            // The element whose visibility this button controls. Prefer the
            // real collapse panel; the fallback never runs on this app's
            // markup but keeps the attribute honest if markup shifts.
            const panel = card?.querySelector('.collapse') || null;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tm-card-toggle-btn';
            btn.title = sectionTitle
                ? `Perkecil / perbesar bagian ${sectionTitle}`
                : 'Perkecil / perbesar bagian ini';
            btn.setAttribute(
                'aria-label',
                sectionTitle
                    ? `Perkecil atau perbesar bagian ${sectionTitle}`
                    : 'Perkecil atau perbesar bagian ini'
            );
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

            // Stable id so aria-controls has something to point at.
            if (panel && !panel.id) {
                panel.id = 'tm-panel-' + Math.random().toString(36).slice(2, 9);
            }
            if (panel && panel.id) btn.setAttribute('aria-controls', panel.id);

            // The header <a> is what Bootstrap's collapse plugin drives;
            // mirror its aria-expanded onto our button, now and on change.
            const anchor = header.querySelector('a[data-toggle="collapse"], a[aria-expanded]');
            const syncState = () => {
                const expanded = anchor
                    ? anchor.getAttribute('aria-expanded') !== 'false'
                    : !card?.classList.contains('tm-card-collapsed');
                btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            };
            syncState();

            if (anchor) {
                // The attribute changes during the collapse transition, so
                // observe it rather than guessing at timing.
                const mo = new MutationObserver(syncState);
                mo.observe(anchor, { attributes: true, attributeFilter: ['aria-expanded'] });
                onUnload(() => mo.disconnect());
            }

            // n2n01-style headers (.w-100.text-center) render as a plain
            // block with a centered <span>; n2n0203-style sertifikat
            // headers already use flex (.tm-n2n01-header / .tm-n2n0203-header).
            // Only force flex display on the plain-block variant so we
            // don't fight the sertifikat header's own layout rules.
            if (!header.classList.contains('tm-sertifikat-header-bar')) {
                header.style.display = 'flex';
                header.style.alignItems = 'center';
            }
            header.appendChild(btn);
        });
    }

    /* ─── v1.2.9: responsive table labels ─────────────────────────────
       The mobile CSS turns each DataTables row into a stacked block and
       prints the column name from a data-label attribute. Nothing in the
       source markup provides that attribute, so it is derived here from
       the matching <th> — which means the labels follow the server's own
       column names (including the Indonesian ones) instead of a
       hardcoded map that would silently rot if a column is renamed.

       Idempotent per cell via the attribute check, and cheap to re-run:
       the MutationObserver-driven scan() calls this on every debounced
       mutation, and DataTables redraws replace tbody contents wholesale. */
    function addResponsiveTableLabels() {
        document.querySelectorAll('table.dataTable').forEach(table => {
            const wrapper = table.closest('.table-responsive') || table.parentElement;
            if (!wrapper) return;

            // Mark the wrapper so the mobile CSS block applies to this
            // table and its DataTables chrome (filter/length/pagination).
            wrapper.classList.add('tm-responsive-stack');

            const headers = Array.from(table.querySelectorAll('thead th')).map(
                th => (th.textContent || '').trim().replace(/\s+/g, ' ')
            );
            if (!headers.length) return;

            table.querySelectorAll('tbody tr').forEach(row => {
                Array.from(row.children).forEach((cell, i) => {
                    if (cell.tagName !== 'TD') return;
                    // Skip the index/serial columns — they carry no meaning
                    // once stacked, and the CSS hides them anyway.
                    if (cell.classList.contains('tm-hide-col')) {
                        cell.removeAttribute('data-label');
                        return;
                    }
                    const label = headers[i] || '';
                    if (label && cell.getAttribute('data-label') !== label) {
                        cell.setAttribute('data-label', label);
                    }
                });
            });
        });
    }

    function scan() {
        if (window.jQuery?.fn?.dataTable) {
            window.jQuery.fn.dataTable.ext.errMode = 'none';
        }
        document.querySelectorAll('a[href="javascript:void()"]').forEach(fixButton);
        enhanceTimeline();
        enhanceAjaxModals();
        fixPageSelect2();
        shortenLspopHeaders();
        tagSpopLspopColumns();
        relocateChatCompose();
        injectCardToggles();
        // v1.2.9: re-derive the stacked-mobile data-label attributes. Must
        // run after tagSpopLspopColumns() (which assigns .tm-hide-col to
        // the index columns we deliberately skip) and after any DataTables
        // redraw, which is why it lives in scan() rather than the one-shot
        // reorganize().
        addResponsiveTableLabels();
        // v1.0.33: self-healing retry for SPOP/LSPOP header content that
        // can arrive/refresh via AJAX after reorganize()'s one-shot run
        // — see enhanceSpopLspopHeaders()'s own comment for the full
        // reasoning. Cheap no-op when nothing's changed since last call.
        enhanceSpopLspopHeaders();
        enhanceKonfirmasiCentangNote();
        enhanceApprovalForm();
        // Safety net: reorganizeSpopSections() already calls this once the
        // inline form's sections are restructured, but scan() runs on every
        // debounced DOM mutation regardless — cheap no-op via the dataset
        // flag in enhanceSertifikatSection if it already ran.
        const activeForm = document.querySelector('#n2n01Form, #n2n02Form, #n2n03Form, [id^="n2n0"]');
        if (activeForm) enhanceSertifikatSection(activeForm);
    }

    /* ─── Ajax modals (Lihat SPOP, Form LSPOP, Tambah bangunan, …) ─── */
    function polishModalSectionHeaders(form) {
        form.querySelectorAll('.w-100.text-center').forEach(el => {
            el.style.removeProperty('border-bottom');
            el.style.removeProperty('border-bottom-color');
            el.style.height = '';
            const span = el.querySelector('span');
            if (span) {
                span.style.removeProperty('background');
                span.style.padding = '';
            }
        });
    }

    function fixSelect2Widths(root) {
        root?.querySelectorAll('.select2-container').forEach(el => {
            el.style.setProperty('width', '100%', 'important');
        });
    }

    function fixPageSelect2() {
        ['n2n01Form', 'n2n02Form', 'n2n03Form', 'collapse-permohonan', 'collapse-pemohon'].forEach(id => {
            const el = document.getElementById(id);
            if (el) fixSelect2Widths(el);
        });
    }

    function fixModalSelect2Widths(form) {
        fixSelect2Widths(form);
    }

    function enhanceAjaxModals() {
        const forms = new Set();
        ['formSpop', 'lspopForm'].forEach(id => {
            const el = document.getElementById(id);
            if (el) forms.add(el);
        });

        forms.forEach(form => {
            const dialog = form.closest('.modal-dialog');
            if (!dialog) return;
            dialog.classList.add('tm-ajax-modal-dialog');
            if (form.id === 'formSpop') dialog.classList.add('tm-spop-modal-dialog');
            polishModalSectionHeaders(form);
            fixModalSelect2Widths(form);

            // v1.0.25: removed the Simpan-into-header relocation feature
            // entirely. Across v1.0.23/1.0.24 this went through two
            // separate bug classes (premature guard blocking the first
            // run, then permanent guard blocking every run after the
            // first) and the live result after both fixes still showed
            // TWO stacked '.tm-header-simpan-btn' buttons in the header at
            // once — a third failure mode. Rather than chase a fourth
            // theory on a feature whose only benefit was reclaiming one
            // row of vertical space, it's gone. .modal-header is back to
            // just the title + close button; .modal-footer (Tutup +
            // Simpan) is untouched and no longer force-hidden.

            // Restructure SPOP modal sections the same way as the inline form.
            if (form.id === 'formSpop') {
                reorganizeSpopSections(form);
                setTimeout(() => reorganizeSpopSections(form), 150);
                setTimeout(() => reorganizeSpopSections(form), 500);
            }
            // LSPOP: site inits Select2 after inject; re-apply once width is calculated
            if (form.id === 'lspopForm' && !form.dataset.tmSelect2Fix) {
                form.dataset.tmSelect2Fix = '1';
                setTimeout(() => fixModalSelect2Widths(form), 0);
                setTimeout(() => fixModalSelect2Widths(form), 300);
            }
        });
    }

    /* ─── Pemohon table: hide empty fields, merge RT+RW into one row ─── */
    function enhancePemohonTable(pemohonCard) {
        if (!pemohonCard || pemohonCard.dataset.tmPemohonEnhanced === '1') return;
        const table = pemohonCard.querySelector('table');
        if (!table) return;

        const rows = [...table.querySelectorAll('tr')];

        // Only Nama should be bold — everything else in this table (NIK,
        // RT/RW, Alamat, NPWP, Telepon, Email, etc.) stays regular weight.
        const namaRow = rows.find(r => r.children[0]?.textContent.trim() === 'Nama');
        namaRow?.classList.add('tm-nama-row');

        // Merge RT + RW into a single 2-column row (done first, so the
        // empty-row check below doesn't need special-casing them).
        const rtRow = rows.find(r => r.children[0]?.textContent.trim() === 'RT');
        const rwRow = rows.find(r => r.children[0]?.textContent.trim() === 'RW');
        if (rtRow && rwRow) {
            const rtVal = rtRow.children[1]?.textContent.trim() || '';
            const rwVal = rwRow.children[1]?.textContent.trim() || '';

            const makeItem = (label, value) => {
                const item = document.createElement('div');
                item.className = 'tm-rtrw-item';
                const l = document.createElement('span');
                l.className = 'tm-rtrw-label';
                l.textContent = label;
                const v = document.createElement('span');
                v.className = 'tm-rtrw-value';
                v.textContent = value;
                item.append(l, v);
                return item;
            };

            const mergedRow = document.createElement('tr');
            mergedRow.className = 'tm-rtrw-row';
            const td = document.createElement('td');
            td.colSpan = 2;
            const flex = document.createElement('div');
            flex.className = 'tm-rtrw-flex';
            flex.append(makeItem('RT', rtVal), makeItem('RW', rwVal));
            td.appendChild(flex);
            mergedRow.appendChild(td);

            rtRow.parentNode.insertBefore(mergedRow, rtRow);
            rtRow.remove();
            rwRow.remove();
        }

        // Auto-hide any remaining row whose value cell is empty — these are
        // fields "not really needed" when the applicant simply didn't have
        // data for them (Pekerjaan, Status WP, NPWP, Kode Pos, etc.).
        table.querySelectorAll('tr').forEach(row => {
            if (row.classList.contains('tm-rtrw-row')) return; // already handled
            const valueCell = row.children[1];
            if (valueCell && valueCell.textContent.trim() === '') {
                row.style.display = 'none';
            }
        });

        pemohonCard.dataset.tmPemohonEnhanced = '1';
    }

    /* ─── Riwayat timeline polish ─── */
    function enhanceTimeline() {
        const root = document.getElementById('history-timeline');
        if (!root) return;

        // When inside the 3-col top shell, CSS flex handles the height —
        // don't force a fixed inline style or it overrides the flex fill.
        const inTripleShell = !!root.closest('.tm-triple-shell');
        if (!inTripleShell) {
            root.style.setProperty('height', '320px', 'important');
            root.style.setProperty('max-height', '320px', 'important');
            root.style.setProperty('min-height', '320px', 'important');
        } else {
            root.style.removeProperty('height');
            root.style.removeProperty('max-height');
            root.style.removeProperty('min-height');
        }
        root.style.setProperty('overflow-y', 'auto', 'important');
        root.style.setProperty('overflow-x', 'hidden', 'important');

        // The work below (walking every timeline item/badge/button) is
        // idempotent and the timeline's content doesn't change after initial
        // render, so it only needs to run once — scan() calls this on every
        // debounced page mutation, which would otherwise re-walk the whole
        // timeline subtree repeatedly for no benefit. If the site ever
        // replaces #history-timeline with a fresh element (e.g. an ajax
        // refresh), getElementById above naturally picks up the new node,
        // which won't have this flag yet, so it still gets processed correctly.
        if (root.dataset.tmTimelineEnhanced === '1') return;

        root.querySelectorAll('.timeline-badge').forEach(b =>
            b.style.removeProperty('background-color'));

        root.querySelectorAll('.timeline-item').forEach(li => {
            const title = li.querySelector('.timeline-title');
            if (title?.textContent.includes('Permohonan Selesai'))
                li.classList.add('tm-timeline-done');
        });

        root.querySelectorAll('.timeline-body a.btn-success[href]').forEach(a => {
            if (a.classList.contains('tm-m3-btn')) return;
            a.classList.remove('btn-success', 'btn-sm');
            a.classList.add('tm-m3-btn');
        });

        root.dataset.tmTimelineEnhanced = '1';
    }

    /* ─── Discussion panel: keep compose box out of the scrolling area ─── */
    /* .customizer-body is a PerfectScrollbar container (transform-based
       fake scrolling, not native overflow) — CSS position:sticky doesn't
       reliably work against that, so the compose form (textarea + send
       button) gets physically moved to be a direct sibling of
       .customizer-body instead, outside the scrolled region entirely. */
    function relocateChatCompose() {
        const customizer = document.querySelector('.customizer');
        if (!customizer) return;
        const footer = customizer.querySelector('.chat-send-message-footer');
        if (!footer || footer.dataset.tmRelocated === '1') return;
        customizer.appendChild(footer);
        footer.dataset.tmRelocated = '1';
    }
    /* Was also used to build a floating quick-nav UI; that UI was removed
       (it overlapped the discussion panel and other floating elements with
       no good way to reconcile the two). The tagging itself stays: the
       responsive layout CSS (medium/small breakpoints) selects cards via
       [data-tm-nav-id="..."] to reorder Riwayat/Pemohon/Persyaratan. */
    function tagSections(sections) {
        sections.filter(s => s.el).forEach(s => { s.el.dataset.tmNavId = s.id; });
    }

    /* ─── SPOP sections restructure (injected) ─── */
    /* Groups RT, RW, and Blok/Kav/No into one shared row */
    function groupRtRwFields(letakRow) {
        if (!letakRow || letakRow.dataset.tmRtrwGrouped === '1') return;
        const cols = [...letakRow.children].filter(el => /col-/.test(el.className));
        const findColByLabelPrefix = text => cols.find(col => {
            const label = col.querySelector('label');
            if (!label) return false;
            return label.textContent.replace('*', '').trim().toUpperCase().startsWith(text);
        });
        const rtCol = findColByLabelPrefix('RT');
        const rwCol = findColByLabelPrefix('RW');
        const blokCol = findColByLabelPrefix('BLOK');
        if (!rtCol || !rwCol) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'tm-rtrw-field-row';
        rtCol.parentNode.insertBefore(wrapper, rtCol);
        wrapper.appendChild(rtCol);
        wrapper.appendChild(rwCol);
        if (blokCol) wrapper.appendChild(blokCol);

        letakRow.dataset.tmRtrwGrouped = '1';
    }

    /* ─── v1.0.9: Data Sertifikat compact row-table ───────────────────
       Tags one certificate .row with grid + zebra classes. Idempotent via
       dataset.tmCertStyled so re-running restyleSertifikatRows() after an
       AJAX append doesn't re-process rows that are already done. */
    function styleSertifikatRow(row, index) {
        if (!row || row.dataset.tmCertStyled === '1') return;
        row.classList.add('tm-sertifikat-row', 'tm-cert-row');
        row.classList.toggle('tm-row-alt', index % 2 === 1);

        const noCell = document.createElement('div');
        noCell.className = 'tm-col-no';
        noCell.textContent = index + 1;
        row.prepend(noCell);

        // Every certificate row (including the static #sertifikat1 — it
        // does ship with its own delete button in the live markup, unlike
        // what I assumed from the static HTML sample earlier) has its
        // delete action wired as a plain button.btn-danger with an
        // onclick="remove_sertifikat_fields(...)" — there is no
        // '.delete-row' class anywhere in the real DOM, which is what the
        // previous selector incorrectly assumed. Matching on the actual
        // onclick handler + btn-danger class instead.
        const existingAksiCol = row.querySelector('button[onclick*="remove_sertifikat_fields"], .btn-danger')
            ?.closest('[class*="col-sm-"], [class*="col-lg-"]');
        if (existingAksiCol) {
            existingAksiCol.classList.add('tm-col-aksi');
        } else {
            row.appendChild(Object.assign(document.createElement('div'), { className: 'tm-col-aksi' }));
        }

        row.dataset.tmCertStyled = '1';
    }

    /* Re-scans every certificate row currently in the DOM and styles any
       that haven't been touched yet. Safe to call repeatedly — cheap
       idempotency check per row via styleSertifikatRow's dataset flag. */
    function restyleSertifikatRows(section) {
        if (!section) return;
        [...section.querySelectorAll('[id^="sertifikat"] > .row, [class*="rmSertifikat"] > .row')]
            .filter(row => row.querySelector('[name^="no_sertifikat"]'))
            .forEach((row, i) => styleSertifikatRow(row, i));
    }

    /* Builds the table shell (sticky header + body wrapper) once per
       section, moves the existing certificate rows into it (appendChild —
       no cloning, so inputmask/select2 bindings on #sertifikat1's fields
       and any AJAX-loaded fields survive untouched), and wires the
       "+ Tambah Sertifikat" header button to the page's own
       add_sertifikat_fields() rather than reimplementing its AJAX call. */
    function enhanceSertifikatSection(root) {
        const section = root?.querySelector('.sertifikat-section');
        if (!section || section.dataset.tmSertifikatEnhanced === '1') return;

        const header = [...section.querySelectorAll('.w-100.text-center span, .w-100.text-center')]
            .find(s => s.textContent.trim().toLowerCase().includes('data sertifikat'))
            ?.closest('.w-100.text-center');
        if (!header) return;

        const rows = [...section.querySelectorAll(':scope > .row')];

        // Locate Jenis Sertifikat select & form group
        const jenisRow = rows.find(r => r.querySelector('[name="kd_jns_sin"]'));
        const jenisSelect = jenisRow?.querySelector('[name="kd_jns_sin"]');
        const jenisFg = jenisSelect?.closest('.form-group') || jenisRow?.querySelector('.form-group');

        // Old label-only row (No. Sertifikat / Jenis Hak / Tanggal / Nama
        // headers with no inputs) — hidden, not removed, in case any page
        // JS reads it; the sticky grid header below replaces it visually.
        const labelRow = rows.find(r =>
            r.querySelector('label.control-label') && !r.querySelector('input, select'));
        labelRow?.classList.add('tm-sertifikat-legacy-label-row');

        // "+ Tambah Sertifikat" in the section header, same proxy-button
        // pattern already used for LSPOP's "+ Tambah" in reorganize().
        const span = header.querySelector('span');
        if (span && !header.querySelector('.tm-sertifikat-add-btn')) {
            const bar = document.createElement('div');
            const isN2n01 = root.id === 'n2n01Form' || !!document.getElementById('n2n01Form');
            bar.className = 'tm-sertifikat-header-bar tm-n2n01-header';
            header.insertBefore(bar, span);

            let inlineBox = null;
            if (jenisFg || jenisSelect) {
                inlineBox = document.createElement('div');
                inlineBox.className = 'tm-sertifikat-inline-jenis';
                inlineBox.appendChild(jenisFg || jenisSelect);

                const fixJenisSelect2Width = () => {
                    inlineBox.querySelectorAll('.select2-container').forEach(el => {
                        el.style.setProperty('width', '100%', 'important');
                        el.style.removeProperty('max-width');
                    });
                };
                fixJenisSelect2Width();
                setTimeout(fixJenisSelect2Width, 0);
                setTimeout(fixJenisSelect2Width, 300);
            }

            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'tm-m3-btn tm-sertifikat-add-btn';
            addBtn.textContent = '+ Tambah Sertifikat';
            addBtn.addEventListener('click', () => {
                if (typeof window.add_sertifikat_fields === 'function') {
                    window.add_sertifikat_fields();
                } else {
                    console.warn('[tm] add_sertifikat_fields() not found — page script may not be loaded yet.');
                }
            });

            // Single-row header everywhere: title + Jenis pill + button
            // inline. The previous 2-row stack for n2n02/n2n03 (title+
            // button on row 1, Jenis pill on row 2) added an entire extra
            // row of height specifically inside the modal — exactly
            // backwards, since the modal is where vertical space is
            // actually constrained (fixed max-height, scrolls once
            // exceeded) and n2n01's free-flowing page isn't. Same compact
            // layout for both now.
            bar.appendChild(span);
            if (inlineBox) bar.appendChild(inlineBox);
            bar.appendChild(addBtn);

            // Remove the old outer row container
            if (jenisRow && jenisRow.parentElement) {
                jenisRow.remove();
            }
        }

        // The live page ships its own "Tambah Sertifikat" trigger somewhere
        // in this section too (not present in the static HTML sample I
        // originally worked from, so its exact markup/origin is unknown to
        // me) — it's not something this script creates twice, it's a real
        // second button. Hide any button/anchor matching that text other
        // than the one this function just built, so only ours shows.
        section.querySelectorAll('a, button').forEach(el => {
            if (el.classList.contains('tm-sertifikat-add-btn')) return;
            if (el.textContent.trim().toLowerCase() === 'tambah sertifikat') {
                el.classList.add('tm-hidden-duplicate-btn');
            }
        });

        // Table shell: sticky header row + body host
        const table = document.createElement('div');
        table.className = 'tm-sertifikat-table';
        const head = document.createElement('div');
        head.className = 'tm-sertifikat-row tm-sertifikat-head';
        head.innerHTML = `<div>#</div><div>No. Sertifikat</div><div>Jenis Hak</div>
                           <div>Tanggal</div><div>Nama</div><div>Aksi</div>`;
        table.appendChild(head);

        // Move the static first certificate + the AJAX host div into the
        // table body. Both keep their original id/class — nothing here
        // relies on cloning, so add_sertifikat_fields()'s own DOM lookups
        // (getElementById('sertifikat_index'), etc.) keep working.
        const first = section.querySelector('#sertifikat1');
        const dynamicIndex = section.querySelector('#sertifikat_index');
        if (first) table.appendChild(first);
        if (dynamicIndex) table.appendChild(dynamicIndex);

        header.insertAdjacentElement('afterend', table);

        section.dataset.tmSertifikatEnhanced = '1';
        restyleSertifikatRows(section);

        // AJAX-appended certificates land inside #sertifikat_index on a
        // ~100ms delay (page's own add_sertifikat_fields). Observe and
        // restyle whenever that happens, rather than relying on a single
        // pass at page load.
        if (dynamicIndex && dynamicIndex.dataset.tmObserved !== '1') {
            const obs = new MutationObserver(() => {
                setTimeout(() => restyleSertifikatRows(section), 150);
            });
            obs.observe(dynamicIndex, { childList: true, subtree: true });
            dynamicIndex.dataset.tmObserved = '1';
            onUnload(() => obs.disconnect());
        }
    }

    /* ─── NOP Induk: label + input onto one row ─── */
    /* Site markup renders these as two independent sibling blocks — a
       .w-100.text-center label div, then a separate <center> wrapping the
       input — each centered on its own, which is why the label sits
       stacked above the input instead of beside it. Only the NOP Induk
       header has this exact <center>-sibling pattern (the other section
       headers — Data Wajib Pajak, Data Letak Objek Pajak, Data Tanah — are
       followed by a .row field grid instead), so that's used to identify
       it rather than relying on a class unique to this one instance. */
    function flattenNopIndukRow(root) {
        const labelDiv = [...root.querySelectorAll('.w-100.text-center.mb-4')]
            .find(div => div.textContent.trim() === 'NOP Induk' && !div.dataset.tmNopFlattened);
        if (!labelDiv) return;
        const centerEl = labelDiv.nextElementSibling;
        if (!centerEl || centerEl.tagName !== 'CENTER') return;
        const wrapper = document.createElement('div');
        wrapper.className = 'tm-nop-induk-row';
        labelDiv.parentNode.insertBefore(wrapper, labelDiv);
        wrapper.appendChild(labelDiv);
        wrapper.appendChild(centerEl);
        labelDiv.dataset.tmNopFlattened = '1';
    }

    function reorganizeSpopSections(root) {
        if (!root || root.dataset.tmSpopSections === "1") return;
        flattenNopIndukRow(root);
        // Broadened from '.w-100.text-center span' to also catch header text
        // that isn't wrapped in a <span> — some ajax-loaded views may markup
        // section dividers slightly differently than the inline n2n01 form.
        const candidates = [...root.querySelectorAll(".w-100.text-center span, .w-100.text-center")];
        const findSec = txt => candidates.find(s =>
            s.textContent.trim().toLowerCase().includes(txt.toLowerCase())
        )?.closest(".w-100.text-center");
        const nextSibRow = el => { let sib = el?.nextElementSibling; while (sib && !sib.classList.contains("row")) sib = sib.nextElementSibling; return sib; };
        const letakHeader = findSec("Data Letak Objek Pajak");
        const tanahHeader = findSec("Data Tanah");
        if (!letakHeader || !tanahHeader) return;
        const letakRow = nextSibRow(letakHeader);
        if (!letakRow) return;
        const parent = letakHeader.parentElement;
        // Data Sertifikat is its own wrapper div.sertifikat-section — grab a
        // reference before moving anything, so the loop below knows where
        // to stop (it no longer gets folded into the right column's node
        // stream the way v1.0.9 did).
        const sertifikatSection = root.querySelector(".sertifikat-section");

        const outer = document.createElement("div"); outer.className = "tm-spop-sections-outer";
        const leftCol = document.createElement("div"); leftCol.className = "tm-spop-sections-left tm-section-card";
        const rightCol = document.createElement("div"); rightCol.className = "tm-spop-sections-right tm-section-card";
        parent.insertBefore(outer, letakHeader);
        leftCol.appendChild(letakHeader);
        groupRtRwFields(letakRow); // pair RT+RW before the full-stack treatment below
        letakRow.classList.add("tm-letak-inner-stack");
        leftCol.appendChild(letakRow);

        // Move everything from "Data Tanah" up to (but NOT including) the
        // sertifikat-section into the right column.
        let sib = tanahHeader;
        while (sib && sib !== sertifikatSection) {
            if (sib.id === 'headingApproval' || sib.querySelector('#headingApproval')) break;
            const next = sib.nextElementSibling;
            rightCol.appendChild(sib);
            sib = next;
        }
        rightCol.querySelectorAll(".row").forEach(row => { const prev = row.previousElementSibling; if (prev?.textContent.trim().toLowerCase().includes("data tanah")) row.classList.add("data-tanah-grid"); });
        outer.appendChild(leftCol);
        outer.appendChild(rightCol);

        // v1.0.10b: Sertifikat becomes a THIRD grid child of `outer` itself
        // (not a sibling below it), placed via grid-template-areas in CSS:
        // at desktop widths it tucks under Data Tanah in the right column
        // (filling the dead space the taller map-containing left column
        // leaves behind), collapsing to its own full-width row once the
        // viewport is too narrow for the 2-column layout to make sense.
        // grid-template-areas only place DIRECT children of the grid
        // container, so this appendChild is required — leaving it as a
        // sibling (previous version) would render it outside the grid
        // entirely and the area names in CSS would silently do nothing.
        if (sertifikatSection) outer.appendChild(sertifikatSection);
        sertifikatSection?.classList.add("tm-section-card");

        root.dataset.tmSpopSections = "1";

        // Enhance Data Sertifikat's internal table layout, and give Data
        // Wajib Pajak the same card treatment as the other three sections
        // — both run here so inline form + ajax modal (enhanceAjaxModals
        // calls this same function) get it.
        enhanceSertifikatSection(root);
        wrapWajibPajakAsCard(root);
    }

    /* ─── v1.0.9b: Data Wajib Pajak as its own card ───────────────────
       Source markup has a ".w-100.text-center" header ("Data Wajib
       Pajak") immediately followed by ".row.data-wp" holding all its
       fields, as a direct sibling of the "Data PBB" and "Data Letak
       Objek Pajak" section headers — none of them wrapped in a
       container. We wrap just this header+row pair so it renders as
       its own white card, matching the mockup, without touching the
       fields inside (same nodes, just re-parented). */
    function wrapWajibPajakAsCard(root) {
        const header = [...root.querySelectorAll(".w-100.text-center span, .w-100.text-center")]
            .find(s => s.textContent.trim().toLowerCase().includes("data wajib pajak"))
            ?.closest(".w-100.text-center");
        if (!header || header.dataset.tmWrapped === "1") return;
        const row = header.nextElementSibling;
        if (!row || !row.classList.contains("row")) return;

        const card = document.createElement("div");
        card.className = "tm-section-card";
        header.parentElement.insertBefore(card, header);
        card.appendChild(header);
        card.appendChild(row);
        header.dataset.tmWrapped = "1";
    }

    /* ─── SPOP/LSPOP card-header enhancements (self-healing) ───────────
       v1.0.33: extracted out of reorganize(), which only ever runs ONCE
       (gated by container.classList.contains('tm-reorganized'), plus the
       initObs MutationObserver at the bottom of this file disconnecting
       the moment reorganize() first returns true). That one-shot design
       is fine for the page's big-picture structural layout, but the SPOP
       card's OWN inner content — its "Jenis Transaksi" label, its Tambah
       link, LSPOP's Tambah link — can arrive or get refreshed via AJAX
       well after that first pass, e.g. switching between records in a
       multi-entry "Mutasi Pecah" list view. Confirmed via live DOM on
       exactly that page: header text was correct (proving this logic DID
       run once, successfully) but the "Jenis Transaksi" label was still
       visible and the Tambah button still un-moved — signs of fresh,
       unprocessed content arriving after the one-shot run, with nothing
       left to catch it.
       Called once from reorganize() (first pass, unchanged behavior) AND
       from scan() on every debounced pass afterward. Every piece here is
       naturally idempotent — a removed label won't match again unless a
       genuinely new one appears; an already-tagged '.tm-tambah-proxy'
       button won't match the "find an untagged proxy" checks again — so
       repeated calls are cheap no-ops once nothing has actually changed. */
    function enhanceSpopLspopHeaders() {
        const spop  = document.getElementById('headingPermohonan')?.closest('.card');
        const lspop = document.getElementById('headinglspop')?.closest('.card');

        // Inline Jenis Transaksi into SPOP header. Searching by label text
        // content (not a specific wrapper class — that varies between
        // n2n01/n2n02/n2n03 form variants) and requiring
        // offsetParent!==null so a hidden duplicate/template label can't
        // get matched instead of the one actually visible on screen.
        if (spop) {
            const jenisTx = [...spop.querySelectorAll('label')]
                .find(l =>
                    l.textContent.trim().toLowerCase().startsWith('jenis transaksi') &&
                    l.offsetParent !== null
                );
            const spopHeader = spop.querySelector('.card-header h4');
            if (jenisTx && spopHeader) {
                const text = jenisTx.textContent.replace(/jenis transaksi:?/i, '').trim();
                // rgba white, not var(--m3-on-surface-variant) — that's a
                // gray token meant for white card backgrounds, poor
                // contrast sitting directly on the green header bar.
                spopHeader.innerHTML = `SPOP <span style="font-size:13px;font-weight:500;color:rgba(255,255,255,.92);margin-left:12px;">${text}</span>`;
                // Remove whatever column/wrapper actually holds the label
                // — broadened from '.col-12' specifically to any
                // Bootstrap column class, falling back to just the label
                // itself if there's no such wrapper (confirmed: n2n02's
                // "Mutasi Pecah" list view has no wrapper at all here,
                // it's a bare <label> sitting directly in .card-body).
                //
                // v1.0.35 ROOT CAUSE FIX for the SPOP-card-vanishing bug:
                // .closest() is unbounded — it climbs ALL the way to
                // <html> if nothing matches sooner, not just "up to the
                // card". The very first time this function runs (called
                // from reorganize() before `spop` has been moved), there
                // really is no col- wrapper near the label on n2n02, so
                // this returned null and fell back to `jenisTx` safely.
                // But this function ALSO runs from scan() on every later
                // pass (needed because DataTable record switches deliver
                // a fresh, unprocessed label). By then `spop` is sitting
                // inside reorganize()'s own `col2` wrapper — which has
                // className "col-lg-12 tm-spop-stage" and therefore
                // itself matches [class*="col-"]. With no closer match
                // inside the card, .closest() walked straight past
                // .card-body/.card and grabbed col2 — removing the
                // ENTIRE card's stage wrapper (card and all) from
                // row2/DOM in one shot. That's why .tm-spop-row was
                // observed with zero children (not just spop missing)
                // and #headingPermohonan was gone from the whole
                // document with nothing left to reference it. Fix: only
                // treat the closest() match as the removal target if
                // it's actually inside `spop` (and isn't `spop` itself);
                // otherwise fall back to removing just the label.
                const jenisWrap = jenisTx.closest('[class*="col-"]');
                const jenisRemoveTarget =
                    (jenisWrap && jenisWrap !== spop && spop.contains(jenisWrap))
                        ? jenisWrap
                        : jenisTx;
                jenisRemoveTarget.remove();
            }
        }

        function injectTambahProxy(card, tambahBtn) {
            const headerLink = card?.querySelector('.card-header a');
            if (!card || card.querySelector('.tm-tambah-proxy') || !tambahBtn || !headerLink) return;
            tambahBtn.style.display = 'none'; // keep in DOM for its modal handler
            const proxy = document.createElement('span');
            proxy.setAttribute('role', 'button');
            proxy.className = 'tm-m3-btn tm-tambah-proxy';
            proxy.textContent = '+ Tambah';
            proxy.style.cssText = 'margin-left:auto;flex-shrink:0;font-size:12px;cursor:pointer;';
            proxy.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation(); // prevent accordion collapse from parent <a>
                tambahBtn.click();
            });
            headerLink.style.cssText = 'display:flex;align-items:center;width:100%;gap:12px;';
            headerLink.appendChild(proxy);
        }

        // LSPOP: DataTable never rewrites the header, so this survives
        // both DT initialization and ajax.reload() calls.
        injectTambahProxy(lspop, lspop?.querySelector('a[href*="bangunan/create"]'));

        // SPOP: real "Tambah SPOP" link can live either inside the card's
        // own .card-body (confirmed via live DOM on the n2n02 "Mutasi
        // Pecah" list view: <div class="w-100 mb-3 text-right"><a
        // class="showModal" data-title="Tambah SPOP">...) or in the
        // page's top toolbar for other form variants — search document-
        // wide rather than scoping to `spop`, so both locations are
        // covered. data-title match is the primary strategy; href
        // fallback covers all three known variants (n2n01/n2n02/n2n03),
        // since each has its own field-naming differences elsewhere in
        // this file's history and their "create" links don't share one
        // URL pattern either.
        injectTambahProxy(spop, document.querySelector(
            'a.showModal[data-title="Tambah SPOP"], a[href*="n2n01/create"], a[href*="n2n02/create"], a[href*="n2n03/create"]'
        ));
    }

    /* ─── Layout reorganizer ─── */
    function reorganize() {
        const container = document.querySelector('.container-fluid');
        const oldRow = container?.querySelector(':scope > .row');
        if (!oldRow) return false;

        const byHeading = id => document.querySelector(`#${id}`)?.closest('.card');
        const pemohon     = byHeading('headingPemohon');
        const spop        = byHeading('headingPermohonan');
        const lspop       = byHeading('headinglspop');
        const riwayat     = byHeading('headingRiwayat');
        const persyaratan = byHeading('headingSyarat');
        const konfirmasi  = byHeading('headingApproval');
        if (!pemohon || !spop || !riwayat || !persyaratan) return false;
        if (container.classList.contains('tm-reorganized')) return true;

        container.classList.add('tm-reorganized');

        // SPOP/LSPOP header enhancements (Jenis Transaksi inline, Tambah
        // proxy buttons) — extracted into enhanceSpopLspopHeaders(),
        // called here for the first pass AND from scan() on every
        // debounced pass afterward. See that function's comment for why:
        // reorganize() itself only ever runs once (this whole function is
        // gated by the tm-reorganized flag + the initObs MutationObserver
        // disconnecting the moment it first succeeds), but this specific
        // content (the SPOP card's "Jenis Transaksi" label, its Tambah
        // link, LSPOP's Tambah link) can arrive or refresh via AJAX well
        // after that first pass — confirmed via live DOM on an n2n02
        // "Mutasi Pecah" record where the header text was correct but the
        // label and button were both un-processed, fresh content that
        // reorganize()'s one-shot run never got a chance to see.
        enhanceSpopLspopHeaders();

        // Riwayat now gets its own column in the 3-column top row —
        // no longer moved into Persyaratan's card body.
        // (enhanceTimeline() is called after DOM insertion below so it can
        //  detect the .tm-triple-shell context for height decisions)

        // Apply grid helpers to section rows in SPOP
        const allSpans = [...spop.querySelectorAll('.w-100.text-center span')];
        // Helper: find the first .row sibling after a section header
        const nextRow = sectionEl => {
            let el = sectionEl?.nextElementSibling;
            while (el && !el.classList.contains('row')) el = el.nextElementSibling;
            return el;
        };
        const findSectionHeader = needle =>
            allSpans.find(s => s.textContent.includes(needle))?.closest('.w-100.text-center');
        nextRow(findSectionHeader('Data PBB'))?.classList.add('data-pbb-placeholder'); // keep locator working
        // Restructure SPOP sections: A+B left, Data Tanah+Sertifikat right
        reorganizeSpopSections(spop);

        // Remove exact-match "Data PBB" header only
        allSpans.find(s => s.textContent.trim() === 'Data PBB')
            ?.closest('.w-100.text-center')?.remove();

        // Build new DOM layout
        const div = (cls) => Object.assign(document.createElement('div'), { className: cls });

        // Row 1: 3 equal columns — Pemohon | Riwayat | Persyaratan
        enhancePemohonTable(pemohon); // hide empty fields, merge RT+RW
        const row1   = div('row');
        const shell1 = div('col-lg-12 tm-triple-shell');
        shell1.append(pemohon, riwayat, persyaratan);
        row1.appendChild(shell1);

        const row2 = div('row mt-2 tm-spop-row');
        const col2 = div('col-lg-12 tm-spop-stage');
        col2.appendChild(spop);
        row2.appendChild(col2);

        container.insertBefore(row1, oldRow);
        enhanceTimeline(); // called here so root.closest('.tm-triple-shell') resolves correctly
        container.insertBefore(row2, oldRow);

        // v1.0.34: SAFETY NET — a report came in of the entire SPOP card
        // vanishing from the page (live DOM showed .tm-spop-row present
        // but completely empty, #headingPermohonan absent everywhere).
        // The code above reads correctly on inspection — spop is appended
        // into col2, col2 into row2, row2 inserted before oldRow removes
        // anything — so whatever's causing this couldn't be conclusively
        // traced from static reading alone. Rather than ship another
        // guess, this verifies the move actually landed right after
        // insertion and self-heals if it didn't: re-finds spop by its
        // known ID and re-inserts it directly into row2 (unwrapped from
        // col2's grid styling, but visible and functional) rather than
        // letting it disappear silently. Also logs to console so a
        // browser devtools screenshot at the moment of failure can
        // pinpoint the actual mechanism if this fires.
        if (!document.body.contains(spop) || !row2.contains(spop)) {
            console.warn('[tm] SPOP card did not land in .tm-spop-row after insertion — attempting recovery.');
            const recovered = document.getElementById('headingPermohonan')?.closest('.card');
            if (recovered && !row2.contains(recovered)) {
                row2.appendChild(recovered);
            } else if (!recovered) {
                console.error('[tm] SPOP card recovery failed — #headingPermohonan not found anywhere in the document.');
            }
        }

        if (lspop || konfirmasi) {
            const rowLK = div('row mt-2');
            const shellLK = div('col-lg-12 tm-lspop-konfirmasi-shell');
            if (lspop) {
                const colL = div('tm-lspop-col');
                colL.appendChild(lspop);
                shellLK.appendChild(colL);
            }
            if (konfirmasi) {
                const colK = div('tm-konfirmasi-col');
                colK.appendChild(konfirmasi);
                shellLK.appendChild(colK);
            }
            rowLK.appendChild(shellLK);
            container.insertBefore(rowLK, oldRow);
        }

        // Shared LSPOP/Tambah modal lives in #accordion-left, not inside a moved card.
        // oldRow.remove() would delete it — keep on body for .showModal / data-target=".modals".
        const sharedModal = document.querySelector('.modal.modals');
        if (sharedModal && !sharedModal.dataset.tmModalRoot) {
            document.body.appendChild(sharedModal);
            sharedModal.dataset.tmModalRoot = '1';
        }

        // Preserve the customizer (discussion room) so it doesn't get removed with oldRow
        const customizer = document.querySelector('.customizer');
        if (customizer && !customizer.dataset.tmCustomizerRoot) {
            document.body.appendChild(customizer);
            customizer.dataset.tmCustomizerRoot = '1';
        }

        // v1.1.8: Rescue BOTH #accordion-left AND #accordion-right wrapper divs
        // before oldRow.remove() deletes them. Accordion headers carry
        // data-parent="#accordion-left" (Pemohon, SPOP, LSPOP) or
        // data-parent="#accordion-right" (Riwayat, Persyaratan, Konfirmasi);
        // Bootstrap's collapse plugin looks up data-parent live on every click.
        // If either ID stops resolving in the DOM, _getParent() returns null and
        // crashes on null.querySelectorAll(), breaking accordion toggling.
        // In addition, strip data-parent from card header links so cards can
        // expand/collapse independently without forcing siblings closed.
        document.querySelectorAll('a[data-parent]').forEach(a => a.removeAttribute('data-parent'));
        ['accordion-left', 'accordion-right'].forEach(id => {
            const acc = document.getElementById(id);
            if (acc && !acc.dataset.tmAccordionRoot) {
                acc.style.display = 'none';
                document.body.appendChild(acc);
                acc.dataset.tmAccordionRoot = '1';
            }
        });

        oldRow.remove();

        // Force Pemohon open — server renders it without Bootstrap's `show` class
        // while every other card (Persyaratan, SPOP, LSPOP, Konfirmasi) has it.
        const pemohonCollapse = document.getElementById('collapse-pemohon');
        if (pemohonCollapse && !pemohonCollapse.classList.contains('show')) {
            pemohonCollapse.classList.add('show');
            document.querySelector('[href="#collapse-pemohon"]')
                ?.setAttribute('aria-expanded', 'true');
        }

        // Default map to Google Hybrid — site initialises with Google Street,
        // so we swap after a short delay once Leaflet has fully rendered.
        // We click the hidden "Google Hybrid" radio inside the layer control.
        const switchMapToHybrid = () => {
            const inputs = document.querySelectorAll('.leaflet-control-layers-base input[type="radio"]');
            inputs.forEach(input => {
                const label = input.closest('label');
                if (label && label.textContent.includes('Hybrid') && !input.checked) {
                    input.click();
                }
            });
        };
        setTimeout(switchMapToHybrid, 800);
        setTimeout(switchMapToHybrid, 2000); // retry in case Leaflet loads slowly
        setTimeout(fixPageSelect2, 0);
        setTimeout(fixPageSelect2, 300);

        tagSections([
            { id: 'pemohon',     label: 'Pemohon',    el: pemohon },
            { id: 'persyaratan', label: 'Syarat',      el: persyaratan },
            { id: 'riwayat',     label: 'Riwayat',     el: riwayat },
            { id: 'spop',        label: 'SPOP',        el: spop },
            { id: 'lspop',       label: 'LSPOP',       el: lspop },
            { id: 'konfirmasi',  label: 'Konfirmasi',  el: konfirmasi },
        ]);

        return true;
    }

    /* ─── Init with observer + timeout safety ─── */
    let initTimer = null;
    const initObs = new MutationObserver((_, obs) => {
        if (reorganize()) {
            obs.disconnect();
            clearTimeout(initTimer);
        }
    });
    if (!reorganize()) {
        initObs.observe(document.body, { childList: true, subtree: true });
        initTimer = setTimeout(() => initObs.disconnect(), 10_000);
        onUnload(() => { initObs.disconnect(); clearTimeout(initTimer); });
    }

/* ─── Scan observer with debounce ─── */
    let scanTimer = null;
    const scanObs = new MutationObserver(() => {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(() => {
            if (typeof scan === 'function') scan();
        }, 150);
    });

    if (document.body) {
        scanObs.observe(document.body, { childList: true, subtree: true });
        if (typeof scan === 'function') scan();
    }
    onUnload(() => {
        scanObs.disconnect();
        if (scanTimer) clearTimeout(scanTimer);
    });

    /* ─── v1.1.2: click a .tm-section-card's title bar to collapse it
           down to just the header, click again to expand. A dedicated
           .tm-card-toggle-btn is injected into each header (not "click
           anywhere on the header") so title text stays clickable/
           selectable and only the actual button toggles the card.
           injectCardToggles() is called from scan() so it also catches
           cards added/rebuilt later by reorganize()/AJAX; the
           dataset.tmToggleAdded flag makes re-running it a cheap no-op
           per header. Diagnostics logged to console so a silent failure
           (e.g. selector no longer matching after a page markup change)
           is visible instead of just "nothing happens". */
    document.addEventListener('click', (e) => {
        const header = e.target.closest(
            '.tm-section-card > .w-100.text-center, ' +
            '.tm-section-card > .tm-sertifikat-header-bar'
        );
        if (!header) return;
        // Don't toggle if clicking form fields, links, select2 dropdowns, or
        // any OTHER button — but the injected .tm-card-toggle-btn itself
        // must still fire (v1.2.5: it's a <button>, so the blanket
        // 'button' exclusion below would otherwise swallow its own click).
        if (!e.target.closest('.tm-card-toggle-btn') &&
            e.target.closest('input, select, button, a, .select2-container')) return;

        const card = header.parentElement;
        if (card && card.classList.contains('tm-section-card')) {
            e.preventDefault();
            const nowCollapsed = card.classList.toggle('tm-card-collapsed');
            console.log(`[tm][collapse] toggled — collapsed=${nowCollapsed}`, card);
        }
    });

    /* ─── Light/dark theme toggle ─── */
    function createThemeToggle() {
        // v1.0.9: light is now the DEFAULT (matches the GovTech mockup),
        // dark is the opt-in alternative — inverse of the previous default.
        // Existing users who explicitly picked 'light' before this change
        // still get light either way; only 'dark' now requires an explicit
        // stored preference or a click on the toggle.
        const stored = safeGetStorage('tm-theme');
        if (stored !== 'dark') document.documentElement.classList.add('tm-light');

        const isLight = () => document.documentElement.classList.contains('tm-light');
        const btn = document.createElement('button');
        btn.id = 'tm-theme-toggle';
        btn.title = 'Toggle light / dark mode';
        btn.textContent = isLight() ? '🌙' : '☀️';
        btn.addEventListener('click', () => {
            const nowLight = document.documentElement.classList.toggle('tm-light');
            btn.textContent = nowLight ? '🌙' : '☀️';
            try {
                localStorage.setItem('tm-theme', nowLight ? 'light' : 'dark');
            } catch (e) {
                console.warn('LocalStorage write blocked by browser privacy policies:', e);
            }
        });

        if (document.body) {
            document.body.appendChild(btn);
        }
    }

    if (document.body) {
        createThemeToggle();
    }

})();
