// ==UserScript==
// @name         Sidoarjo SIE - Material 3 Expressive
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  Material 3 dark theme across the SIE app: permit list, summary count pages, main dashboard, target/realisasi tables, Download Filtered Entry, NOP regional & kecamatan filter, Status Peta filter, and responsive DataTables.
// @author       You
// @downloadURL  https://raw.githubusercontent.com/PinkThor/DARJO_PBB/main/Sidoarjo%20SIE%20-%20Material%203%20Expressive.user.js
// @updateURL    https://raw.githubusercontent.com/PinkThor/DARJO_PBB/main/Sidoarjo%20SIE%20-%20Material%203%20Expressive.user.js
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n01-list*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n02-list*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n03-list*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n01-list*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n02-list*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n03-list*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/count*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/count*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/sie
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/sie/
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/sie
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/sie/
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/sie/target-realisasi*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/sie/target-realisasi*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/vektor*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/vektor*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/arsip-mutasi-penuh*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/arsip-mutasi-pecah*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/arsip-mutasi-gabung*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/arsip-mutasi-penuh*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/arsip-mutasi-pecah*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/pbb_/arsip-mutasi-gabung*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

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
        }
        html, body, .page-wrapper, .container-fluid {
            background: var(--m3-surface) !important;
            color: var(--m3-on-surface) !important;
            font-family: 'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }

        /* ─── Topbar / sidebar: dark theme, matches the form-page script ─── */
        .topbar, .navbar.top-navbar { background: var(--m3-surface-1) !important; border-bottom: 1px solid var(--m3-outline) !important; }
        .left-sidebar, .scroll-sidebar, #sidebarnav, .sidebar-nav,
        .left-sidebar .ps-container, li.sidebar-item, ul.sidebar-nav,
        .mini-sidebar .left-sidebar, .mini-sidebar .scroll-sidebar,
        .left-sidebar[data-sidebarbg], .left-sidebar[data-sidebarbg] .scroll-sidebar,
        .left-sidebar[data-sidebarbg] #sidebarnav, .left-sidebar[data-sidebarbg] .ps-container {
            background: var(--m3-surface-1) !important;
        }
        .sidebar-link, .sidebar-link i { color: var(--m3-on-surface-variant) !important; }
        .sidebar-link:hover, .sidebar-item.selected > .sidebar-link,
        .sidebar-item.active > .sidebar-link, .sidebar-link.active {
            background: var(--m3-surface-2) !important;
            color: var(--m3-primary) !important;
        }
        .sidebar-nav ul.collapse { background: var(--m3-surface) !important; }
        .mini-sidebar .sidebar-link i {
            color: var(--m3-on-surface-variant) !important;
            font-size: 20px !important;
            line-height: 1 !important;
            opacity: 1 !important;
        }
        .mini-sidebar .sidebar-item:hover .sidebar-link i { color: var(--m3-primary) !important; }

        .page-breadcrumb {
            background: var(--m3-surface-1) !important;
            border-bottom: 1px solid var(--m3-outline) !important;
            padding: 10px 24px !important;
            margin-bottom: 16px !important;
        }
        .page-breadcrumb .page-title { color: var(--m3-on-surface) !important; font-size: 18px; margin: 0 0 2px; }
        .page-breadcrumb .breadcrumb { background: transparent !important; padding: 0 !important; margin: 0 !important; }
        .page-breadcrumb .breadcrumb-item, .page-breadcrumb .breadcrumb-item a { color: var(--m3-on-surface-variant) !important; font-size: 13px; }
        .page-breadcrumb .breadcrumb-item.active { color: var(--m3-on-surface) !important; }

        .container-fluid {
            max-width: 1800px !important;
            margin: 0 auto !important;
            padding: 0 20px !important;
        }
        body.tm-summary-page .container-fluid {
            max-width: 900px !important;
        }
        .card:not(.card-hover) {
            background: var(--m3-surface-1) !important;
            border: 1px solid var(--m3-outline) !important;
            border-radius: 12px !important;
        }
        .card-body { padding: 16px !important; }

        .tm-controls-row {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px 20px !important;
            margin-bottom: 12px !important;
        }
        .tm-controls-row > div:not([id^="tm-toolbar"]):not(.tm-info-row) {
            flex: 0 0 auto !important;
            width: auto !important;
            max-width: 100% !important;
            padding: 0 !important;
        }
        .tm-controls-row .dataTables_info { margin: 0 !important; white-space: nowrap; }
        .tm-controls-row .dataTables_paginate { margin: 0 !important; }
        .tm-controls-row .dt-buttons { margin: 0 !important; }
        @media (max-width: 700px) {
            .tm-controls-row { justify-content: center !important; }
            .tm-controls-row > div { width: 100% !important; text-align: center; }
            .tm-controls-row .dataTables_paginate .pagination { justify-content: center !important; }
        }

        .dataTables_wrapper, .dataTables_length label, .dataTables_filter label,
        .dataTables_info { color: var(--m3-on-surface-variant) !important; }
        .dataTables_length select, .dataTables_filter input {
            background: var(--m3-surface-2) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
        }
        [id^="tm-region-filter"], [id^="tm-status-peta-filter"] {
            background-color: var(--m3-surface-2) !important;
            color: var(--m3-on-surface) !important;
        }
        [id^="tm-region-filter"] option, [id^="tm-status-peta-filter"] option {
            background: var(--m3-surface-2) !important;
            color: var(--m3-on-surface) !important;
        }
        [id^="tm-region-filter"] optgroup, [id^="tm-status-peta-filter"] optgroup {
            background: var(--m3-surface-1) !important;
            color: var(--m3-primary) !important;
            font-weight: 700 !important;
        }
        .dt-buttons .btn, .buttons-excel {
            background: var(--m3-secondary-container) !important;
            border: 1px solid var(--m3-outline) !important;
            color: var(--m3-on-surface) !important;
        }
        .pagination .page-link {
            background: var(--m3-surface-2) !important;
            border: 1px solid var(--m3-outline) !important;
            color: var(--m3-on-surface) !important;
        }
        .pagination .page-item.active .page-link {
            background: var(--m3-primary-container) !important;
            color: var(--m3-primary) !important;
            border-color: var(--m3-primary) !important;
        }
        .pagination .page-item.disabled .page-link {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface-variant) !important;
            opacity: .5;
        }

        #permitList, #permitList thead th, #permitList tbody td {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        #permitList thead th { background: var(--m3-surface-2) !important; font-weight: 600; white-space: nowrap; }
        #permitList tbody tr.odd, #permitList tbody tr.even { background: var(--m3-surface-1) !important; }
        #permitList tbody tr:hover td { background: var(--m3-surface-2) !important; }
        #permitList .badge-info { background: var(--m3-primary-container) !important; color: var(--m3-primary) !important; }

        #permitList thead th.sorting::before, #permitList thead th.sorting::after,
        #permitList thead th.sorting_asc::before, #permitList thead th.sorting_asc::after,
        #permitList thead th.sorting_desc::before, #permitList thead th.sorting_desc::after {
            top: 50% !important;
            bottom: auto !important;
            transform: translateY(-50%) !important;
        }

        .table-responsive { overflow-x: auto; }
        #permitList td:last-child, #permitList th:last-child {
            position: sticky;
            right: 0;
            z-index: 1;
            background: var(--m3-surface-2) !important;
            box-shadow: -4px 0 8px rgba(0,0,0,.3);
        }
        #permitList tbody tr:hover td:last-child { background: var(--m3-surface-2) !important; }

        @media (max-width: 1500px) {
            #permitList .tm-col-registrasi { display: none !important; }
        }
        @media (max-width: 1300px) {
            #permitList .tm-col-tanggal { display: none !important; }
        }
        @media (max-width: 1100px) {
            #permitList .tm-col-jenis { display: none !important; }
        }

        .card-hover { transition: transform .15s, box-shadow .15s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.4); }

        .highcharts-container {
            --highcharts-background-color: var(--m3-surface-1) !important;
            --highcharts-neutral-color-80: #C9D1D9 !important;
            --highcharts-neutral-color-60: #A8B0B8 !important;
            --highcharts-neutral-color-40: #6E7681 !important;
            --highcharts-neutral-color-20: #30363D !important;
            --highcharts-neutral-color-10: #21262D !important;
            --highcharts-neutral-color-3: #161B22 !important;
        }
        body.tm-light-theme .highcharts-container {
            --highcharts-background-color: #FFFFFF !important;
            --highcharts-neutral-color-80: #333333 !important;
            --highcharts-neutral-color-60: #666666 !important;
            --highcharts-neutral-color-40: #999999 !important;
            --highcharts-neutral-color-20: #CCCCCC !important;
            --highcharts-neutral-color-10: #E6E6E6 !important;
            --highcharts-neutral-color-3: #F7F7F7 !important;
        }
        .highcharts-text-outline {
            display: none !important;
        }

        .modal-content {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
        }
        .modal-content table, .modal-content table th, .modal-content table td {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        .modal-content .table-info, .modal-content .table-success,
        .modal-content .table-danger, .modal-content .table-warning {
            background: var(--m3-surface-2) !important;
        }
        .modal-content .btn-outline-info {
            color: var(--m3-primary) !important;
            border-color: var(--m3-primary) !important;
        }
        .modal-content .btn-outline-info:hover {
            background: var(--m3-primary-container) !important;
        }
        .modal .dataTables_wrapper, .modal .dataTables_length label,
        .modal .dataTables_filter label, .modal .dataTables_info {
            color: var(--m3-on-surface-variant) !important;
        }
        .modal .dataTables_length select, .modal .dataTables_filter input {
            background: var(--m3-surface-2) !important;
            color: var(--m3-on-surface) !important;
            border: 1px solid var(--m3-outline) !important;
        }
        .modal .pagination .page-link {
            background: var(--m3-surface-2) !important;
            border: 1px solid var(--m3-outline) !important;
            color: var(--m3-on-surface) !important;
        }

        body:has(#example) .container-fluid {
            max-width: 1400px !important;
        }
        body:has(#example) .container-fluid h3 {
            color: var(--m3-on-surface) !important;
            font-size: 20px !important;
            margin-bottom: 16px !important;
        }
        #example {
            table-layout: fixed !important;
            width: 100% !important;
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        #example th, #example td {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        #example thead th { background: var(--m3-surface-2) !important; font-weight: 600; text-align: center; }
        #example tbody tr:hover td { background: var(--m3-surface-2) !important; }
        #example td:nth-child(3), #example td:nth-child(4),
        #example td:nth-child(5), #example td:nth-child(6) { text-align: right; }
        #example td:nth-child(7) { text-align: center; }
        #example th:nth-child(1) { width: 50px !important; }
        #example th:nth-child(7) { width: 90px !important; }
        #example tbody tr:last-child td {
            background: var(--m3-surface-2) !important;
            border-top: 2px solid var(--m3-outline) !important;
        }
        @media (max-width: 900px) {
            #example th:nth-child(4), #example td:nth-child(4),
            #example th:nth-child(5), #example td:nth-child(5) {
                display: none !important;
            }
        }

        #globalTable, #globalTable thead th, #globalTable tbody td {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        #globalTable thead th { background: var(--m3-surface-2) !important; font-weight: 600; white-space: nowrap; }
        #globalTable tbody tr.odd, #globalTable tbody tr.even { background: var(--m3-surface-1) !important; }
        #globalTable tbody tr:hover td { background: var(--m3-surface-2) !important; }
        #globalTable thead th.sorting::before, #globalTable thead th.sorting::after,
        #globalTable thead th.sorting_asc::before, #globalTable thead th.sorting_asc::after,
        #globalTable thead th.sorting_desc::before, #globalTable thead th.sorting_desc::after {
            top: 50% !important;
            bottom: auto !important;
            transform: translateY(-50%) !important;
        }
        #globalTable td:last-child, #globalTable th:last-child {
            position: sticky;
            right: 0;
            z-index: 1;
            background: var(--m3-surface-2) !important;
            box-shadow: -4px 0 8px rgba(0,0,0,.3);
        }
        #globalTable tbody tr:hover td:last-child { background: var(--m3-surface-2) !important; }
        @media (max-width: 1300px) {
            #globalTable .tm-col-tanggal { display: none !important; }
        }
        .card-header {
            background: var(--m3-surface-2) !important;
            border-bottom: 1px solid var(--m3-outline) !important;
        }
        .card-header .card-title { color: var(--m3-on-surface) !important; }
        #globalTable input.editor-active {
            width: 18px;
            height: 18px;
            accent-color: var(--m3-primary);
            cursor: pointer;
        }
        #globalTable .tm-col-clip {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 160px;
        }

        @media (max-width: 991px) {
            .container-fluid { padding: 0 12px !important; }
            .card-body { padding: 10px !important; }
            .page-breadcrumb { padding: 10px 12px !important; }
        }

        #supplicationCount {
            table-layout: fixed !important;
            width: 100% !important;
        }
        #supplicationCount, #supplicationCount thead th, #supplicationCount tbody td {
            background: var(--m3-surface-1) !important;
            color: var(--m3-on-surface) !important;
            border-color: var(--m3-outline) !important;
        }
        #supplicationCount thead th { background: var(--m3-surface-2) !important; font-weight: 600; }
        #supplicationCount tbody tr.odd, #supplicationCount tbody tr.even { background: var(--m3-surface-1) !important; }
        #supplicationCount tbody tr:hover td { background: var(--m3-surface-2) !important; }
        #supplicationCount thead th:nth-child(1) { width: 50px !important; }
        #supplicationCount thead th:nth-child(2) { width: auto !important; }
        #supplicationCount thead th:nth-child(3) { width: 90px !important; }
        #supplicationCount thead th:nth-child(4) { width: 80px !important; text-align: center; }
        #supplicationCount tbody td:nth-child(4) { text-align: center; }
        #supplicationCount thead th.sorting::before, #supplicationCount thead th.sorting::after {
            top: 50% !important;
            bottom: auto !important;
            transform: translateY(-50%) !important;
        }
        #supplicationCount tbody td:nth-child(2) {
            overflow-wrap: break-word !important;
            word-break: break-word !important;
        }
        @media (max-width: 480px) {
            #supplicationCount thead th:nth-child(1) { width: 28px !important; }
            #supplicationCount thead th:nth-child(3) { width: 60px !important; }
            #supplicationCount thead th:nth-child(4) { width: 50px !important; }
        }

        #tm-theme-toggle {
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 99999;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid var(--m3-outline);
            background: var(--m3-surface-2);
            color: var(--m3-tertiary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            box-shadow: 0 2px 10px rgba(0,0,0,.3);
            transition: transform .15s, box-shadow .15s;
        }
        #tm-theme-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(0,0,0,.4);
        }
        body.tm-light-theme {
            --m3-surface: #F6F8FA;
            --m3-surface-1: #FFFFFF;
            --m3-surface-2: #EEF1F4;
            --m3-outline: #D0D7DE;
            --m3-on-surface: #1F2328;
            --m3-on-surface-variant: #57606A;
            --m3-primary: #0969DA;
            --m3-primary-container: #DDF4FF;
            --m3-secondary-container: #DAFBE1;
            --m3-error: #CF222E;
            --m3-tertiary: #9A6700;
        }
    `;
    document.head.appendChild(styleEl);

    if (document.getElementById('supplicationCount')) {
        document.body.classList.add('tm-summary-page');
    }

    const THEME_KEY = 'tm-pbb-list-theme';
    function applyTheme(theme) {
        document.body.classList.toggle('tm-light-theme', theme === 'light');
        const btn = document.getElementById('tm-theme-toggle');
        if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
    }
    function initThemeToggle() {
        if (document.getElementById('tm-theme-toggle')) return;
        const saved = localStorage.getItem(THEME_KEY) || 'dark';
        const btn = document.createElement('button');
        btn.id = 'tm-theme-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Ganti tema terang/gelap');
        btn.addEventListener('click', () => {
            const next = document.body.classList.contains('tm-light-theme') ? 'dark' : 'light';
            localStorage.setItem(THEME_KEY, next);
            applyTheme(next);
        });
        document.body.appendChild(btn);
        applyTheme(saved);
    }
    initThemeToggle();

    function setDefaultPageLength(tableId, length) {
        if (typeof jQuery === 'undefined' || !jQuery.fn || !jQuery.fn.DataTable) return;
        const $table = jQuery('#' + tableId);
        if (!$table.length || !jQuery.fn.DataTable.isDataTable($table)) return;
        const dt = $table.DataTable();
        if (dt.page.len() !== length) {
            dt.page.len(length).draw();
        }
    }
    function initDefaultPageLengths() {
        setDefaultPageLength('permitList', 100);
        setDefaultPageLength('globalTable', 100);
    }
    let pageLengthAttempts = 0;
    const pageLengthInterval = setInterval(() => {
        initDefaultPageLengths();
        pageLengthAttempts++;
        if (pageLengthAttempts >= 20) clearInterval(pageLengthInterval);
    }, 500);

    document.querySelectorAll('.page-breadcrumb .breadcrumb-item a').forEach(a => {
        const text = a.textContent.trim();
        if (text === 'Permohonan Baru') {
            a.href = 'https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/count?type=new';
        } else if (text === 'Permohonan Dalam Proses') {
            a.href = 'https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/count?type=process';
        }
    });

    function moveTableControlsUp(tableId) {
        const wrapper = document.getElementById(tableId + '_wrapper');
        if (!wrapper || wrapper.dataset.tmControlsMoved) return;
        const info = document.getElementById(tableId + '_info');
        const paginate = document.getElementById(tableId + '_paginate');
        if (!info || !paginate) return;
        // Anchor row: prefer the Excel/Buttons row if present (permitList,
        // globalTable), otherwise fall back to whichever length/search
        // control row exists — supplicationCount has no Buttons extension
        // but still has length+search, so this keeps the merge working
        // there instead of silently no-opping.
        const anchorEl = wrapper.querySelector('.dt-buttons')
            || wrapper.querySelector('.dataTables_length')
            || wrapper.querySelector('.dataTables_filter');
        if (!anchorEl) return;
        const buttonsRow = anchorEl.closest('.row');
        const infoCol = info.parentElement;
        const paginateCol = paginate.parentElement;
        const bottomRow = infoCol.parentElement;
        if (!buttonsRow || buttonsRow === bottomRow) return;
        buttonsRow.classList.add('tm-controls-row');
        buttonsRow.appendChild(infoCol);
        buttonsRow.appendChild(paginateCol);
        if (bottomRow && bottomRow.children.length === 0) bottomRow.remove();
        wrapper.dataset.tmControlsMoved = 'true';
    }

    function tagPermitListColumns() {
        const table = document.getElementById('permitList');
        if (!table) return;
        const headerMap = {
            'No. Registrasi': 'registrasi',
            'Tanggal': 'tanggal',
            'Jenis Transaksi': 'jenis',
        };
        const colIndexByKey = {};
        [...table.querySelectorAll('thead th')].forEach((th, i) => {
            const key = headerMap[th.textContent.trim()];
            if (!key) return;
            th.classList.add('tm-col-' + key);
            colIndexByKey[key] = i;
        });
        table.querySelectorAll('tbody tr').forEach(tr => {
            Object.entries(colIndexByKey).forEach(([key, i]) => {
                const td = tr.children[i];
                if (td) td.classList.add('tm-col-' + key);
            });
        });
    }
    tagPermitListColumns();
    moveTableControlsUp('permitList');
    const permitListTable = document.getElementById('permitList');
    if (permitListTable) {
        new MutationObserver(() => {
            tagPermitListColumns();
            moveTableControlsUp('permitList');
        }).observe(permitListTable, { childList: true, subtree: true });
    }

    function tagGlobalTableColumns() {
        const table = document.getElementById('globalTable');
        if (!table) return;
        const headerMap = {
            '#': ['clip'],
            'Tanggal': ['tanggal', 'clip'],
            'Tanggal Terbit': ['tanggal', 'clip'],
            'Pemohon': ['clip'],
            'Pemohon/WP': ['clip'],
            'Tgl Validasi Peta': ['clip'],
        };
        const colsByIndex = {};
        [...table.querySelectorAll('thead th')].forEach((th, i) => {
            const keys = headerMap[th.textContent.trim()];
            if (!keys) return;
            keys.forEach(key => th.classList.add('tm-col-' + key));
            colsByIndex[i] = keys;
        });
        table.querySelectorAll('tbody tr').forEach(tr => {
            Object.entries(colsByIndex).forEach(([i, keys]) => {
                const td = tr.children[i];
                if (td) keys.forEach(key => td.classList.add('tm-col-' + key));
            });
        });
    }
    tagGlobalTableColumns();
    moveTableControlsUp('globalTable');
    const globalTable = document.getElementById('globalTable');
    if (globalTable) {
        new MutationObserver(() => {
            tagGlobalTableColumns();
            moveTableControlsUp('globalTable');
        }).observe(globalTable, { childList: true, subtree: true });
    }

    function downloadAllEntries(tableId, triggerBtn) {
        if (typeof jQuery === 'undefined' || !jQuery.fn || !jQuery.fn.DataTable) {
            alert('DataTables belum siap.');
            return;
        }
        const $tbl = jQuery('#' + tableId);
        if (!$tbl.length || !jQuery.fn.DataTable.isDataTable($tbl)) {
            alert('Tabel belum siap.');
            return;
        }
        const dt = $tbl.DataTable();

        const cardTitle = document.querySelector('.card-title');
        const pageTitle = cardTitle ? cardTitle.textContent.trim() : document.title.trim();
        const cleanTitle = (pageTitle || 'Data_Export').replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${cleanTitle}_Export_${timestamp}`;

        const filteredCount = dt.rows({ search: 'applied' }).count();
        if (filteredCount === 0) {
            if (typeof toastr !== 'undefined' && toastr.warning) {
                toastr.warning('Tidak ada data yang sesuai filter saat ini.', 'Download');
            } else {
                alert('Tidak ada data yang sesuai filter saat ini.');
            }
            return;
        }

        if (typeof toastr !== 'undefined' && toastr.info) {
            toastr.info(`Mempersiapkan ${filteredCount} data terfilter untuk diunduh...`, 'Download');
        }

        // 1. Coba menggunakan DataTables excelHtml5 jika JSZip tersedia
        const hasExcelHtml5 = jQuery.fn.dataTable.ext && jQuery.fn.dataTable.ext.buttons && jQuery.fn.dataTable.ext.buttons.excelHtml5;
        if (hasExcelHtml5 && typeof window.JSZip !== 'undefined') {
            try {
                const btnConfig = {
                    extend: 'excelHtml5',
                    title: filename,
                    filename: filename,
                    exportOptions: {
                        modifier: {
                            page: 'all',
                            search: 'applied'
                        },
                        columns: ':not(:last-child)',
                        format: {
                            body: function (data, row, column, node) {
                                let text = jQuery('<div>').html(String(data == null ? '' : data)).text().trim();
                                if (/^\d{10,}$/.test(text) || /^0\d+$/.test(text)) {
                                    return "'" + text;
                                }
                                return text;
                            }
                        }
                    }
                };
                jQuery.fn.dataTable.ext.buttons.excelHtml5.action.call(
                    { c: btnConfig },
                    null,
                    dt,
                    jQuery(triggerBtn || document.body),
                    btnConfig
                );
                if (typeof toastr !== 'undefined' && toastr.success) {
                    toastr.success('File Excel berhasil diunduh.', 'Download Selesai');
                }
                return;
            } catch (err) {
                console.warn('excelHtml5 action error, falling back to CSV:', err);
            }
        }

        // 2. Fallback: Ekspor langsung ke CSV UTF-8 dengan BOM
        try {
            let headers = [];
            let exportRows = [];

            if (dt.buttons && typeof dt.buttons.exportData === 'function') {
                const exp = dt.buttons.exportData({
                    modifier: { page: 'all', search: 'applied' },
                    columns: ':not(:last-child)'
                });
                headers = exp.header;
                exportRows = exp.body;
            } else {
                $tbl.find('thead th').each(function (i) {
                    if (i < $tbl.find('thead th').length - 1) {
                        headers.push(jQuery(this).text().trim());
                    }
                });

                dt.rows({ search: 'applied' }).every(function () {
                    const rowNode = this.node();
                    const rowData = [];
                    if (rowNode) {
                        jQuery(rowNode).find('td').each(function (i) {
                            if (i < jQuery(rowNode).find('td').length - 1) {
                                rowData.push(jQuery(this).text().trim());
                            }
                        });
                    } else {
                        const d = this.data();
                        if (Array.isArray(d)) {
                            rowData.push(...d.slice(0, -1).map(x => String(x == null ? '' : x).replace(/<[^>]*>/g, '').trim()));
                        } else if (typeof d === 'object') {
                            dt.columns().every(function (colIdx) {
                                if (colIdx < dt.columns().count() - 1) {
                                    let cData = dt.cell(this.index(), colIdx).render('display');
                                    rowData.push(String(cData == null ? '' : cData).replace(/<[^>]*>/g, '').trim());
                                }
                            });
                        }
                    }
                    exportRows.push(rowData);
                });
            }

            const escapeCsv = (val) => {
                let str = String(val == null ? '' : val).replace(/<[^>]*>/g, '').trim();
                if (/^\d{10,}$/.test(str) || /^0\d+$/.test(str)) {
                    str = "'" + str;
                }
                if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            };

            let csv = '\uFEFF';
            csv += headers.map(escapeCsv).join(',') + '\r\n';
            exportRows.forEach(row => {
                csv += row.map(escapeCsv).join(',') + '\r\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof toastr !== 'undefined' && toastr.success) {
                toastr.success('File CSV berhasil diunduh.', 'Download Selesai');
            }
        } catch (csvErr) {
            console.error('Gagal download all:', csvErr);
            if (typeof toastr !== 'undefined' && toastr.error) {
                toastr.error('Gagal mengunduh seluruh data.');
            } else {
                alert('Gagal mengunduh seluruh data: ' + csvErr.message);
            }
        }
    }

    const REGIONS = [
        {
            id: 'Barat',
            name: 'Wilayah Barat',
            icon: '📍',
            kecamatan: [
                { code: '010', name: 'Tarik' },
                { code: '020', name: 'Prambon' },
                { code: '030', name: 'Krembung' },
                { code: '080', name: 'Tulangan' },
                { code: '090', name: 'Wonoayu' },
                { code: '100', name: 'Sukodono' },
                { code: '160', name: 'Taman' },
                { code: '170', name: 'Krian' },
                { code: '180', name: 'Balongbendo' }
            ]
        },
        {
            id: 'Selatan',
            name: 'Wilayah Selatan',
            icon: '📍',
            kecamatan: [
                { code: '040', name: 'Porong' },
                { code: '050', name: 'Jabon' },
                { code: '060', name: 'Tanggulangin' },
                { code: '070', name: 'Candi' },
                { code: '110', name: 'Sidoarjo' }
            ]
        },
        {
            id: 'Utara',
            name: 'Wilayah Utara',
            icon: '📍',
            kecamatan: [
                { code: '120', name: 'Buduran' },
                { code: '130', name: 'Sedati' },
                { code: '140', name: 'Waru' },
                { code: '150', name: 'Gedangan' }
            ]
        }
    ];

    const KECAMATAN_LIST = [];
    REGIONS.forEach(reg => {
        reg.kecamatan.forEach(k => {
            KECAMATAN_LIST.push({ code: k.code, name: k.name, wilayah: reg.id });
        });
    });

    function getKecamatanCodeFromNop(nop) {
        if (!nop) return '';
        const clean = String(nop).replace(/<[^>]*>/g, '');
        const digits = clean.replace(/\D/g, '');
        if (digits.length < 7) return '';
        return digits.substring(4, 7);
    }

    function getWilayahFromNop(nop) {
        const code = getKecamatanCodeFromNop(nop);
        if (!code) return '';
        const found = KECAMATAN_LIST.find(k => k.code === code);
        if (found) return found.wilayah;
        const kec = parseInt(code, 10);
        if (isNaN(kec)) return '';

        // Barat: 010-030 (Tarik, Prambon, Krembung), 080-100 (Tulangan, Wonoayu, Sukodono), 160-180 (Taman, Krian, Balongbendo)
        if ((kec >= 10 && kec <= 30) || (kec >= 80 && kec <= 100) || (kec >= 160 && kec <= 180)) {
            return 'Barat';
        }
        // Selatan: 040-070 (Porong, Jabon, Tanggulangin, Candi), 110 (Sidoarjo)
        if ((kec >= 40 && kec <= 70) || kec === 110) {
            return 'Selatan';
        }
        // Utara: 120-150 (Buduran, Sedati, Waru, Gedangan)
        if (kec >= 120 && kec <= 150) {
            return 'Utara';
        }
        return '';
    }

    function initStatusFilter(tableId, showFilter, enableDownloadAll, enableRegionFilter, enableStatusPetaFilter) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const statusGroups = [
            {
                label: 'Sudah direvisi',
                badgeColor: 'rgba(255, 152, 0, 0.7)',
                fillColor: 'rgba(255, 152, 0, 0.1)',
                borderColor: 'rgba(255, 152, 0, 0.3)',
                statuses: [
                    { label: 'CS/Front Office', value: 'Sudah direvisi, menunggu disetujui - CS/Front Office' },
                    { label: 'BO Kasi',         value: 'Sudah direvisi, menunggu disetujui - BO Kasi' },
                    { label: 'BO Kabid',        value: 'Sudah direvisi, menunggu disetujui - BO Kabid' },
                ]
            },
            {
                label: 'Menunggu disetujui',
                badgeColor: 'rgba(33, 150, 243, 0.7)',
                fillColor: 'rgba(33, 150, 243, 0.1)',
                borderColor: 'rgba(33, 150, 243, 0.3)',
                statuses: [
                    { label: 'CS/Front Office', value: 'Menunggu disetujui - CS/Front Office' },
                    { label: 'BO Kasi',         value: 'Menunggu disetujui - BO Kasi' },
                    { label: 'BO Kabid',        value: 'Menunggu disetujui - BO Kabid' },
                ]
            },
            {
                label: 'Lainnya',
                badgeColor: 'rgba(244, 67, 54, 0.7)',
                fillColor: 'rgba(244, 67, 54, 0.1)',
                borderColor: 'rgba(244, 67, 54, 0.3)',
                statuses: [
                    { label: 'Belum direvisi pemohon', value: 'Belum direvisi pemohon' },
                ]
            }
        ];

        function findStatusColumnIndex() {
            const ths = [...table.querySelectorAll('thead th')];
            const idx = ths.findIndex(th => th.textContent.trim() === 'Status');
            return idx !== -1 ? idx : 7;
        }

        function findStatusPetaColumnIndex() {
            if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
                const $t = jQuery('#' + tableId);
                if ($t.length && jQuery.fn.DataTable.isDataTable($t)) {
                    const dt = $t.DataTable();
                    let foundIdx = -1;
                    dt.columns().every(function (idx) {
                        const header = this.header();
                        if (!header) return;
                        const text = header.textContent.trim();
                        const aria = header.getAttribute('aria-label') || '';
                        if (/status\s*peta/i.test(text) || /status\s*peta/i.test(aria)) {
                            foundIdx = idx;
                        }
                    });
                    if (foundIdx !== -1) return foundIdx;
                }
            }
            const ths = [...table.querySelectorAll('thead th')];
            const idx = ths.findIndex(th => {
                const text = th.textContent.trim();
                const aria = th.getAttribute('aria-label') || '';
                return /status\s*peta/i.test(text) || /status\s*peta/i.test(aria);
            });
            return idx;
        }

        function isRowPetaChecked(dt, rowIdx, colIdx, rowData, searchData) {
            // 1. Direct check on raw row object if available (fastest and most accurate for AJAX DataTables)
            if (rowData && typeof rowData === 'object') {
                if ('status_peta' in rowData) {
                    const sp = rowData.status_peta;
                    return sp == 1 || sp === true || sp === '1';
                }
                if ('is_peta' in rowData) {
                    const sp = rowData.is_peta;
                    return sp == 1 || sp === true || sp === '1';
                }
            }

            // 2. Fallback to dt.row().data()
            if (dt && rowIdx !== undefined) {
                try {
                    const rData = dt.row(rowIdx).data();
                    if (rData && typeof rData === 'object') {
                        if ('status_peta' in rData) {
                            const sp = rData.status_peta;
                            return sp == 1 || sp === true || sp === '1';
                        }
                        if ('is_peta' in rData) {
                            const sp = rData.is_peta;
                            return sp == 1 || sp === true || sp === '1';
                        }
                    }
                } catch (e) {}
            }

            // 3. Fallback to live DOM cell node if rendered
            if (dt && rowIdx !== undefined && colIdx !== undefined) {
                try {
                    const cellNode = dt.cell(rowIdx, colIdx).node();
                    if (cellNode) {
                        const cb = cellNode.querySelector('input[type="checkbox"]');
                        if (cb) return cb.checked;
                    }
                } catch (e) {}
            }

            // 4. Fallback to searchData or string value
            let val = null;
            if (Array.isArray(rowData) && colIdx !== undefined) {
                val = rowData[colIdx];
            } else if (searchData && colIdx !== undefined && searchData[colIdx] !== undefined) {
                val = searchData[colIdx];
            }

            if (val != null) {
                if (typeof val === 'boolean') return val;
                if (typeof val === 'number') return val === 1;
                const s = String(val);
                if (/checked/i.test(s)) return true;
                const clean = s.replace(/<[^>]*>/g, '').trim().toLowerCase();
                return clean === '1' || clean === 'true' || clean === 'y' || clean === 'ya' || clean === 'sudah' || clean === 'valid';
            }

            return false;
        }

        function findNopColumnIndex() {
            const ths = [...table.querySelectorAll('thead th')];
            const idx = ths.findIndex(th => /nop/i.test(th.textContent.trim()));
            return idx !== -1 ? idx : 3;
        }

        function escapeRegex(s) {
            return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        function statusToPattern(status) {
            return `^\\s*${escapeRegex(status.trim())}\\s*$`;
        }

        let filterBtn, filterPanel, applyBtn, clearBtn;

        if (showFilter) {
            filterBtn = document.createElement('button');
            filterBtn.id = 'tm-status-filter-btn';
            filterBtn.type = 'button';
            filterBtn.innerHTML = '🔍 Filter Status (0)';

            filterPanel = document.createElement('div');
            filterPanel.id = 'tm-status-filter-panel';
            filterPanel.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--m3-surface-2);
                border: 0.5px solid var(--m3-outline);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                width: 480px;
                display: none;
                z-index: 10000;
                flex-direction: row;
            `;
        }

        if (showFilter) {
            const leftCol = document.createElement('div');
            leftCol.style.cssText = 'display:flex; flex-direction:column; width:60px; flex-shrink:0;';

            applyBtn = document.createElement('button');
            applyBtn.id = 'tm-status-filter-apply';
            applyBtn.type = 'button';
            applyBtn.style.cssText = `
                flex: 1;
                background: #2196F3;
                color: #fff;
                border: none;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
                transition: background 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                writing-mode: vertical-rl;
                transform: rotate(180deg);
            `;
            applyBtn.textContent = 'Apply';
            applyBtn.addEventListener('mouseenter', () => applyBtn.style.background = '#1976D2');
            applyBtn.addEventListener('mouseleave', () => applyBtn.style.background = '#2196F3');

            clearBtn = document.createElement('button');
            clearBtn.id = 'tm-status-filter-clear';
            clearBtn.type = 'button';
            clearBtn.style.cssText = `
                width: 100%;
                height: 44px;
                background: #f44336;
                color: #fff;
                border: none;
                border-top: 0.5px solid rgba(255,255,255,0.2);
                cursor: pointer;
                font-size: 24px;
                font-weight: 300;
                transition: background 0.2s ease;
                flex-shrink: 0;
            `;
            clearBtn.textContent = '✕';
            clearBtn.addEventListener('mouseenter', () => clearBtn.style.background = '#c62828');
            clearBtn.addEventListener('mouseleave', () => clearBtn.style.background = '#f44336');

            leftCol.appendChild(applyBtn);
            leftCol.appendChild(clearBtn);

            const rightCol = document.createElement('div');
            rightCol.style.cssText = 'flex:1; padding:16px; border-left:0.5px solid var(--m3-outline);';

            statusGroups.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.style.marginBottom = '20px';

                const badge = document.createElement('div');
                badge.style.cssText = `
                    font-size: 11px; font-weight: 600; color: #fff;
                    background: ${group.badgeColor}; padding: 6px 12px;
                    border-radius: 6px; margin-bottom: 10px;
                    text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;
                `;
                badge.textContent = group.label;
                groupDiv.appendChild(badge);

                group.statuses.forEach(statusObj => {
                    const id = 'tm-status-' + statusObj.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'tm-status-item';
                    itemDiv.style.cssText = `
                        display:flex; align-items:center; gap:12px; padding:10px 12px;
                        margin-bottom:6px; border-radius:8px;
                        background:${group.fillColor}; border:0.5px solid ${group.borderColor};
                        cursor:pointer; user-select:none; transition:all 0.15s ease;
                    `;
                    itemDiv.style.cssText += 'align-items:stretch;';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = id;
                    checkbox.dataset.status = statusObj.value;
                    checkbox.style.cssText = 'width:18px; height:18px; cursor:pointer; accent-color:#2196F3; flex-shrink:0; align-self:center;';
                    const lbl = document.createElement('label');
                    lbl.style.cssText = 'flex:1; cursor:pointer; font-size:13px; color:var(--m3-on-surface); margin:0; align-self:center;';
                    lbl.textContent = statusObj.label;
                    const divider = document.createElement('div');
                    divider.style.cssText = 'width:0.5px; background:rgba(255,255,255,0.15); align-self:stretch;';
                    const countSpan = document.createElement('span');
                    countSpan.className = 'tm-status-count';
                    countSpan.dataset.status = statusObj.value;
                    countSpan.style.cssText = 'font-size:13px; font-weight:500; color:var(--m3-on-surface-variant); min-width:28px; text-align:center; align-self:center; padding-left:12px;';
                    countSpan.textContent = '\u2013';
                    itemDiv.addEventListener('click', (e) => {
                        if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    itemDiv.appendChild(checkbox);
                    itemDiv.appendChild(lbl);
                    itemDiv.appendChild(divider);
                    itemDiv.appendChild(countSpan);
                    groupDiv.appendChild(itemDiv);
                });

                rightCol.appendChild(groupDiv);
            });

            filterPanel.appendChild(leftCol);
            filterPanel.appendChild(rightCol);
            document.body.appendChild(filterPanel);
        }

        const wrapper = document.getElementById(tableId + '_wrapper');
        if (!wrapper) return;

        moveTableControlsUp(tableId);

        const controlsRow = wrapper.querySelector('.tm-controls-row');
        if (!controlsRow) return;

        const excelBtn = wrapper.querySelector('.buttons-excel');
        const lengthSelect = wrapper.querySelector(`select[name="${tableId}_length"]`);
        const searchInput = wrapper.querySelector(`#${tableId}_filter input[type="search"]`);
        const infoDiv = document.getElementById(tableId + '_info');
        const paginateDiv = document.getElementById(tableId + '_paginate');

        const secondRow = lengthSelect ? lengthSelect.closest('.row') :
                           (searchInput ? searchInput.closest('.row') : null);

        const toolbar = document.createElement('div');
        toolbar.id = 'tm-toolbar-' + tableId;
        toolbar.style.cssText = 'display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:0.75rem 0; width:100%; justify-content:space-between;';

        if (searchInput) {
            searchInput.placeholder = 'Cari...';
            searchInput.style.cssText = `
                padding: 10px 12px;
                font-size: 13px;
                border-radius: 8px;
                border: 0.5px solid var(--border, var(--m3-outline));
                background: var(--surface-2, var(--m3-surface-1));
                color: var(--text-primary, var(--m3-on-surface));
                width: 180px;
                flex-shrink: 0;
                height: 44px;
                box-sizing: border-box;
                margin: 0;
            `;
        }

        const compressedInfo = document.createElement('div');
        compressedInfo.id = 'tm-compressed-info-' + tableId;
        compressedInfo.style.cssText = 'font-size:11px; color:var(--text-secondary,var(--m3-on-surface-variant)); white-space:nowrap; flex-shrink:0; margin:0; line-height:1; height:44px; display:flex; align-items:center;';
        compressedInfo.textContent = '…';

        if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
            const $tbl = jQuery('#' + tableId);
            if ($tbl.length && jQuery.fn.DataTable.isDataTable($tbl)) {
                $tbl.DataTable().off('draw.tmInfo').on('draw.tmInfo', () => {
                    const txt = infoDiv ? infoDiv.textContent.trim() : '';
                    const m = txt.match(/(\d[\d,.'’]*)\s+(?:sampai|to)\s+(\d[\d,.'’]*)\s+(?:dari|of)\s+(\d[\d,.'’]*)/i);
                    compressedInfo.textContent = m ? `${m[1]}\u2013${m[2]} / ${m[3]}` : txt;
                });
            }
        }

        let statusPetaSelect = null;
        let selectedStatusPeta = 'ALL';

        if (enableStatusPetaFilter) {
            statusPetaSelect = document.createElement('select');
            statusPetaSelect.id = 'tm-status-peta-filter-' + tableId;
            statusPetaSelect.className = 'custom-select custom-select-sm form-control form-control-sm';
            statusPetaSelect.style.cssText = `
                padding: 8px 26px 8px 12px;
                font-size: 13px;
                border: 0.5px solid var(--border, var(--m3-outline));
                background-color: var(--surface-2, var(--m3-surface-2));
                color: var(--text-primary, var(--m3-on-surface));
                border-radius: 8px;
                appearance: none;
                cursor: pointer;
                min-width: 160px;
                margin: 0;
                height: 44px;
                font-weight: 600;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 16 16%22><path fill=%22%2379C0FF%22 d=%22M4 6l4 4 4-4%22/></svg>');
                background-repeat: no-repeat;
                background-position: right 8px center;
                box-sizing: border-box;
            `;

            const optAllP = document.createElement('option');
            optAllP.value = 'ALL';
            optAllP.textContent = '🗺️ Status Peta: Semua';
            statusPetaSelect.appendChild(optAllP);

            const optC = document.createElement('option');
            optC.value = 'CHECKED';
            optC.textContent = '✅ Sudah Dipetakan';
            statusPetaSelect.appendChild(optC);

            const optU = document.createElement('option');
            optU.value = 'UNCHECKED';
            optU.textContent = '⬜ Belum Dipetakan';
            statusPetaSelect.appendChild(optU);

            statusPetaSelect.addEventListener('change', () => {
                selectedStatusPeta = statusPetaSelect.value;
                if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
                    const $t = jQuery('#' + tableId);
                    if ($t.length && jQuery.fn.DataTable.isDataTable($t)) {
                        $t.DataTable().draw();
                    }
                }
            });
        }

        let regionSelect = null;
        let selectedWilayah = 'ALL';

        if (enableRegionFilter) {
            regionSelect = document.createElement('select');
            regionSelect.id = 'tm-region-filter-' + tableId;
            regionSelect.className = 'custom-select custom-select-sm form-control form-control-sm';
            regionSelect.style.cssText = `
                padding: 8px 26px 8px 12px;
                font-size: 13px;
                border: 0.5px solid var(--border, var(--m3-outline));
                background-color: var(--surface-2, var(--m3-surface-2));
                color: var(--text-primary, var(--m3-on-surface));
                border-radius: 8px;
                appearance: none;
                cursor: pointer;
                min-width: 175px;
                margin: 0;
                height: 44px;
                font-weight: 600;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 16 16%22><path fill=%22%2379C0FF%22 d=%22M4 6l4 4 4-4%22/></svg>');
                background-repeat: no-repeat;
                background-position: right 8px center;
                box-sizing: border-box;
            `;

            // 1. Opsi Semua Wilayah
            const optAll = document.createElement('option');
            optAll.value = 'ALL';
            optAll.textContent = '🌐 Semua Wilayah';
            regionSelect.appendChild(optAll);

            // 2. Grouping per Regional (Barat, Selatan, Utara) beserta kecamatan di dalamnya
            REGIONS.forEach(reg => {
                const grp = document.createElement('optgroup');
                grp.label = `── ${reg.name} ──`;

                // Pilihan eksklusif regional (misal: Semua Wilayah Barat)
                const optReg = document.createElement('option');
                optReg.value = reg.id;
                optReg.textContent = `${reg.icon} Semua ${reg.name}`;
                grp.appendChild(optReg);

                // Pilihan per kecamatan
                reg.kecamatan.forEach(k => {
                    const optK = document.createElement('option');
                    optK.value = k.code;
                    optK.textContent = `${k.code} - ${k.name}`;
                    grp.appendChild(optK);
                });

                regionSelect.appendChild(grp);
            });

            regionSelect.addEventListener('change', () => {
                selectedWilayah = regionSelect.value;
                if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
                    const $t = jQuery('#' + tableId);
                    if ($t.length && jQuery.fn.DataTable.isDataTable($t)) {
                        $t.DataTable().draw();
                    }
                }
            });
        }

        // Register custom filter di DataTables
        if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
            const filterFunc = function (settings, searchData, index, rowData) {
                if (settings.sTableId !== tableId) return true;

                const rawRow = rowData || (settings && settings.aoData && settings.aoData[index] ? settings.aoData[index]._aData : null);

                // 1. Filter Regional / Kecamatan NOP
                if (enableRegionFilter && selectedWilayah !== 'ALL') {
                    const nopColIdx = findNopColumnIndex();
                    let nopVal = '';
                    if (rawRow && typeof rawRow === 'object') {
                        nopVal = rawRow.nop_pbb || rawRow.nop || rawRow[nopColIdx] || '';
                    } else if (Array.isArray(searchData) && searchData[nopColIdx] !== undefined) {
                        nopVal = searchData[nopColIdx];
                    } else if (Array.isArray(rawRow)) {
                        nopVal = rawRow[nopColIdx] || '';
                    }

                    if (selectedWilayah === 'Barat' || selectedWilayah === 'Selatan' || selectedWilayah === 'Utara') {
                        if (getWilayahFromNop(nopVal) !== selectedWilayah) return false;
                    } else {
                        if (getKecamatanCodeFromNop(nopVal) !== selectedWilayah) return false;
                    }
                }

                // 2. Filter Status Peta (Checkbox centang)
                if (enableStatusPetaFilter && selectedStatusPeta !== 'ALL') {
                    const spColIdx = findStatusPetaColumnIndex();
                    if (spColIdx !== -1) {
                        const checked = isRowPetaChecked(null, index, spColIdx, rawRow, searchData);
                        if (selectedStatusPeta === 'CHECKED' && !checked) return false;
                        if (selectedStatusPeta === 'UNCHECKED' && checked) return false;
                    }
                }

                return true;
            };

            if (!window._tmRegionFilterFuncs) window._tmRegionFilterFuncs = {};
            if (window._tmRegionFilterFuncs[tableId]) {
                const oldIdx = jQuery.fn.dataTable.ext.search.indexOf(window._tmRegionFilterFuncs[tableId]);
                if (oldIdx !== -1) jQuery.fn.dataTable.ext.search.splice(oldIdx, 1);
            }
            window._tmRegionFilterFuncs[tableId] = filterFunc;
            jQuery.fn.dataTable.ext.search.push(filterFunc);

            const $tbl = jQuery('#' + tableId);
            if ($tbl.length && jQuery.fn.DataTable.isDataTable($tbl)) {
                const dt = $tbl.DataTable();
                const updateDynamicCounts = () => {
                    // Update Region & Kecamatan counts
                    if (regionSelect) {
                        const nopColIdx = findNopColumnIndex();
                        const allNops = dt.column(nopColIdx, { search: 'none' }).data().toArray();
                        const rCounts = { Barat: 0, Selatan: 0, Utara: 0 };
                        const kCounts = {};

                        allNops.forEach(raw => {
                            const text = String(raw == null ? '' : raw).replace(/<[^>]*>/g, '').trim();
                            const r = getWilayahFromNop(text);
                            if (r && rCounts[r] !== undefined) {
                                rCounts[r]++;
                            }
                            const k = getKecamatanCodeFromNop(text);
                            if (k) {
                                kCounts[k] = (kCounts[k] || 0) + 1;
                            }
                        });

                        const oAll = regionSelect.querySelector('option[value="ALL"]');
                        if (oAll) oAll.textContent = `🌐 Semua Wilayah (${allNops.length})`;

                        REGIONS.forEach(reg => {
                            const oReg = regionSelect.querySelector(`option[value="${reg.id}"]`);
                            if (oReg) oReg.textContent = `${reg.icon} Semua ${reg.name} (${rCounts[reg.id] || 0})`;

                            reg.kecamatan.forEach(k => {
                                const oK = regionSelect.querySelector(`option[value="${k.code}"]`);
                                if (oK) oK.textContent = `${k.code} - ${k.name} (${kCounts[k.code] || 0})`;
                            });
                        });
                    }

                    // Update Status Peta options & dynamic counts (Checkbox centang)
                    if (statusPetaSelect) {
                        const spColIdx = findStatusPetaColumnIndex();
                        if (spColIdx !== -1) {
                            let countChecked = 0;
                            let countUnchecked = 0;
                            const totalRows = dt.rows({ search: 'none' }).count();

                            dt.rows({ search: 'none' }).every(function (rIdx) {
                                const isChecked = isRowPetaChecked(dt, rIdx, spColIdx, this.data());
                                if (isChecked) {
                                    countChecked++;
                                } else {
                                    countUnchecked++;
                                }
                            });

                            const currentVal = selectedStatusPeta;
                            statusPetaSelect.innerHTML = '';

                            const oAllP = document.createElement('option');
                            oAllP.value = 'ALL';
                            oAllP.textContent = `🗺️ Status Peta: Semua (${totalRows})`;
                            statusPetaSelect.appendChild(oAllP);

                            const oChecked = document.createElement('option');
                            oChecked.value = 'CHECKED';
                            oChecked.textContent = `✅ Sudah Dipetakan (${countChecked})`;
                            statusPetaSelect.appendChild(oChecked);

                            const oUnchecked = document.createElement('option');
                            oUnchecked.value = 'UNCHECKED';
                            oUnchecked.textContent = `⬜ Belum Dipetakan (${countUnchecked})`;
                            statusPetaSelect.appendChild(oUnchecked);

                            statusPetaSelect.value = currentVal || 'ALL';
                        }
                    }
                };
                dt.off('draw.tmRegionCount').on('draw.tmRegionCount', updateDynamicCounts);
                updateDynamicCounts();

                if (enableStatusPetaFilter) {
                    table.addEventListener('change', (e) => {
                        if (e.target && e.target.matches('input[type="checkbox"]')) {
                            updateDynamicCounts();
                        }
                    });
                }
            }
        }

        const buttonContainer = document.createElement('div');
        const countChildren = (showFilter ? 1 : 0) + (statusPetaSelect ? 1 : 0) + (regionSelect ? 1 : 0);
        if (countChildren > 0) {
            buttonContainer.style.cssText = countChildren > 1
                ? 'flex:1 1 auto; display:flex; flex-direction:row; flex-wrap:nowrap; justify-content:center; align-items:center; gap:8px; min-width:0; margin:0;'
                : 'flex:1; display:flex; justify-content:center; align-items:center; gap:8px; min-width:140px; margin:0; flex-wrap:wrap;';
            if (showFilter && filterBtn) {
                buttonContainer.appendChild(filterBtn);
                filterBtn.style.cssText = `
                    padding: 8px 16px; font-size: 13px; border-radius: 8px;
                    border: none; background: #2196F3; color: #fff; cursor: pointer;
                    font-weight: 600; white-space: nowrap; margin: 0; height: 44px;
                    display: flex; align-items: center; transition: background 0.2s ease;
                    flex: 0 0 auto;
                `;
                filterBtn.addEventListener('mouseenter', () => filterBtn.style.background = '#1976D2');
                filterBtn.addEventListener('mouseleave', () => filterBtn.style.background = '#2196F3');
            }
            if (statusPetaSelect) {
                if (countChildren > 1) {
                    statusPetaSelect.style.minWidth = '130px';
                    statusPetaSelect.style.flex = '0 1 auto';
                }
                buttonContainer.appendChild(statusPetaSelect);
            }
            if (regionSelect) {
                if (countChildren > 1) {
                    regionSelect.style.minWidth = '130px';
                    regionSelect.style.flex = '0 1 auto';
                }
                buttonContainer.appendChild(regionSelect);
            }
        } else {
            buttonContainer.style.cssText = 'flex:1;';
        }


        let downloadAllBtn = null;
        if (enableDownloadAll) {
            downloadAllBtn = document.createElement('button');
            downloadAllBtn.id = 'tm-download-all-' + tableId;
            downloadAllBtn.type = 'button';
            downloadAllBtn.className = 'btn';
            downloadAllBtn.innerHTML = '<span>📥 All Entry</span>';
            downloadAllBtn.title = 'Download data sesuai filter yang aktif (semua halaman)';
            downloadAllBtn.style.cssText = `
                padding: 8px 14px;
                font-size: 13px;
                border: none;
                background: #1976D2;
                color: #fff;
                cursor: pointer;
                font-weight: 600;
                white-space: nowrap;
                border-right: 0.5px solid rgba(255,255,255,0.3);
                margin: 0;
                height: 100%;
                display: flex;
                align-items: center;
                transition: background 0.2s ease;
            `;
            downloadAllBtn.addEventListener('mouseenter', () => downloadAllBtn.style.background = '#1565C0');
            downloadAllBtn.addEventListener('mouseleave', () => downloadAllBtn.style.background = '#1976D2');
            downloadAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                downloadAllEntries(tableId, downloadAllBtn);
            });
        }

        const excelLengthGroup = document.createElement('div');
        excelLengthGroup.style.cssText = 'display:flex; gap:0; flex-shrink:0; border:0.5px solid var(--border,var(--m3-outline)); border-radius:8px; overflow:hidden; margin:0; height:44px;';

        if (excelBtn) {
            excelBtn.style.cssText = `
                padding: 8px 14px;
                font-size: 13px;
                border: none;
                background: #d32f2f;
                color: #fff;
                cursor: pointer;
                font-weight: 600;
                white-space: nowrap;
                border-right: 0.5px solid rgba(255,255,255,0.3);
                margin: 0;
                height: 100%;
                display: flex;
                align-items: center;
            `;
            excelLengthGroup.appendChild(excelBtn);
        }

        if (downloadAllBtn) {
            excelLengthGroup.appendChild(downloadAllBtn);
        }

        if (lengthSelect) {
            lengthSelect.style.cssText = `
                padding: 8px 8px;
                font-size: 13px;
                border: none;
                background: var(--surface-2, var(--m3-surface-1));
                color: var(--text-primary, var(--m3-on-surface));
                appearance: none;
                padding-right: 20px;
                cursor: pointer;
                min-width: 50px;
                margin: 0;
                height: 100%;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 16 16%22><path fill=%22%23666%22 d=%22M4 6l4 4 4-4%22/></svg>');
                background-repeat: no-repeat;
                background-position: right 4px center;
                box-sizing: border-box;
            `;
            excelLengthGroup.appendChild(lengthSelect);
        }

        if (paginateDiv) {
            paginateDiv.style.cssText = 'margin:0; flex-shrink:0;';
        }

        // Assemble left-to-right: Excel+DownloadAll+Length (far left) | Pagination |
        // Info text (clings to the filter button when it's centered) |
        // Filter Status (centered) | Search (far right)
        // NOTE: semua elemen disisipkan ke dalam baris kontrol yang SUDAH ADA
        // (controlsRow/toolbar). Tidak pernah membuat .row baru — bila slot
        // tengah tidak tersedia, regionSelect dijatuhkan ke elemen kontrol
        // existing terdekat (buttonContainer/toolbar) alih-alih baris baru.
        controlsRow.innerHTML = '';
        controlsRow.style.cssText = 'display:flex; flex-direction:column; width:100%;';

        if (excelBtn || downloadAllBtn || lengthSelect) toolbar.appendChild(excelLengthGroup);
        if (paginateDiv) toolbar.appendChild(paginateDiv);
        toolbar.appendChild(compressedInfo);
        toolbar.appendChild(buttonContainer);
        if (searchInput) toolbar.appendChild(searchInput);

        controlsRow.appendChild(toolbar);

        // regionSelect sudah berada di buttonContainer (slot tengah) pada
        // kondisi normal. Fallback hanya aktif bila slot itu tidak terpasang,
        // sehingga select tidak pernah hilang tanpa membuat baris baru.
        if (regionSelect && !regionSelect.isConnected) {
            const fallbackHost = controlsRow.querySelector('.tm-toolbar-fallback')
                || buttonContainer
                || toolbar;
            fallbackHost.appendChild(regionSelect);
        }

        if (infoDiv) {
            infoDiv.style.display = 'none';
            toolbar.appendChild(infoDiv); // Pertahankan di live DOM agar DataTables tetap meng-update nilainya
        }

        if (secondRow && secondRow !== controlsRow) secondRow.remove();

        if (showFilter) {
            const selectedStatuses = new Set();

            // ── Live status counts ──
            // Tally every row's Status column value regardless of the
            // current search/filter (search:'none'), so counts stay a
            // stable reference even while a filter is active. Re-runs on
            // every DataTables 'draw' (ajax reload, pagination, sort) via
            // a namespaced handler — off() before on() guarantees only one
            // listener is ever attached even if this init path runs again,
            // avoiding a classic DataTables memory-leak pattern.
            if (typeof jQuery !== 'undefined' && jQuery.fn.DataTable) {
                const $table = jQuery('#' + tableId);
                if ($table.length && jQuery.fn.DataTable.isDataTable($table)) {
                    const dt = $table.DataTable();
                    const statusColIdx = findStatusColumnIndex();
                    const countSpans = filterPanel.querySelectorAll('.tm-status-count');

                    const updateStatusCounts = () => {
                        const allValues = dt.column(statusColIdx, { search: 'none' }).data().toArray();
                        const counts = {};
                        allValues.forEach(raw => {
                            const text = String(raw).replace(/<[^>]*>/g, '').trim();
                            counts[text] = (counts[text] || 0) + 1;
                        });
                        countSpans.forEach(span => {
                            span.textContent = counts[span.dataset.status] || 0;
                        });
                    };

                    dt.off('draw.tmCount').on('draw.tmCount', updateStatusCounts);
                    updateStatusCounts();
                }
            }

            filterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = filterPanel.style.display === 'flex';
                filterPanel.style.display = isOpen ? 'none' : 'flex';
            });

            document.addEventListener('click', (e) => {
                if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) {
                    filterPanel.style.display = 'none';
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && filterPanel.style.display === 'flex') {
                    filterPanel.style.display = 'none';
                }
            });

            filterPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const status = checkbox.getAttribute('data-status');
                    if (checkbox.checked) {
                        selectedStatuses.add(status);
                    } else {
                        selectedStatuses.delete(status);
                    }
                    filterBtn.innerHTML = `🔍 Filter Status (${selectedStatuses.size})`;
                });
            });

            applyBtn.addEventListener('click', () => {
                if (typeof jQuery === 'undefined' || !jQuery.fn.DataTable) return;
                const $table = jQuery('#' + tableId);
                if (!$table.length || !jQuery.fn.DataTable.isDataTable($table)) return;
                const dt = $table.DataTable();
                const statusColIdx = findStatusColumnIndex();

                if (selectedStatuses.size === 0) {
                    dt.column(statusColIdx).search('').draw();
                } else {
                    const regex = Array.from(selectedStatuses).map(statusToPattern).join('|');
                    dt.column(statusColIdx).search(regex, true, false).draw();
                }

                filterPanel.style.display = 'none';
            });

            clearBtn.addEventListener('click', () => {
                selectedStatuses.clear();
                filterPanel.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
                filterBtn.innerHTML = '🔍 Filter Status (0)';

                if (typeof jQuery === 'undefined' || !jQuery.fn.DataTable) return;
                const $table = jQuery('#' + tableId);
                if (!$table.length || !jQuery.fn.DataTable.isDataTable($table)) return;
                const dt = $table.DataTable();
                dt.column(findStatusColumnIndex()).search('').draw();
            });
        }
    }

    // Initialize the 1-row toolbar (and optional filter panel) for a given
    // table once its DataTables wrapper exists. tableId is parameterized —
    // permitList for the n2n0x-list pages, globalTable for vektor/arsip.
    function waitForTableAndInit(tableId, showFilter, enableDownloadAll, enableRegionFilter, enableStatusPetaFilter) {
        let attempts = 0;
        const maxAttempts = 40;

        const tryInit = () => {
            attempts++;
            const wrapper = document.getElementById(tableId + '_wrapper');
            const alreadyInjected = wrapper ? wrapper.querySelector('#tm-toolbar-' + tableId) : null;

            if (wrapper && !alreadyInjected) {
                initStatusFilter(tableId, showFilter, enableDownloadAll, enableRegionFilter, enableStatusPetaFilter);
                return true;
            }
            return false;
        };

        if (tryInit()) return;

        const interval = setInterval(() => {
            if (tryInit() || attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 500);

        const observer = new MutationObserver(() => {
            if (tryInit()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ── URL-based feature gating ───────────────────────────────────────────
    // Toolbar (1-row): n2n0x-list with type=new/process/rev (table: permitList)
    //                  + arsip-mutasi-* pages (table: globalTable)
    //                  + /permohonan/int/count summary page (table: supplicationCount)
    // Filter panel:    n2n0x-list with type=process ONLY
    const _path = window.location.pathname;
    const _type = new URLSearchParams(window.location.search).get('type');
    const isPermitList = /\/permohonan\/int\/n2n0[123]-list/.test(_path);
    const isArsip      = /\/permohonan\/pbb_\/arsip-mutasi/.test(_path);
    const isVektor     = /\/permohonan\/pbb_\/vektor/.test(_path);
    const isCount      = /\/permohonan\/int\/count/.test(_path);

    // Halaman khusus untuk tombol "Download All / Filtered Entry":
    // 1. /permohonan/pbb_/arsip-mutasi-pecah
    // 2. /permohonan/pbb_/arsip-mutasi-gabung
    // 3. /permohonan/pbb_/arsip-mutasi-penuh
    // 4. /permohonan/int/n2n01-list?type=process
    const isN2N01Process = /\/permohonan\/int\/n2n01-list/.test(_path) && _type === 'process';
    const enableDownloadAll = isArsip || isN2N01Process;

    // Filter Wilayah Administrasi Regional (Kecamatan NOP):
    // Aktif pada seluruh n2n01/02/03-list (type=new, process, dan rev)
    // serta seluruh halaman /permohonan/pbb_/ (vektor + arsip-mutasi-*).
    // Halaman tanpa kolom NOP (mis. /permohonan/int/count) tetap dikecualikan.
    const enableRegionFilter = isPermitList || isArsip || isVektor;

    // Filter Status Peta:
    // Khusus untuk halaman arsip-mutasi (arsip-mutasi-pecah, arsip-mutasi-penuh, arsip-mutasi-gabung)
    const enableStatusPetaFilter = isArsip;

    if (isPermitList && (_type === 'new' || _type === 'process' || _type === 'rev')) {
        waitForTableAndInit('permitList', _type === 'process', enableDownloadAll, enableRegionFilter, false);
    } else if (isArsip || isVektor) {
        waitForTableAndInit('globalTable', false, enableDownloadAll, enableRegionFilter, enableStatusPetaFilter);
    } else if (isCount) {
        waitForTableAndInit('supplicationCount', false, false, false, false);
    }
})();
