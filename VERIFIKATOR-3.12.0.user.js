// ==UserScript==
// @name         VERIFIKATOR HELPER - SPOP/LSPOP Sidoarjo
// @namespace    http://tampermonkey.net/
// @downloadURL https://raw.githubusercontent.com/PinkThor/DARJO_PBB/main/VERIFIKATOR%20HELPER.user.js
// @updateURL   https://raw.githubusercontent.com/PinkThor/DARJO_PBB/main/VERIFIKATOR%20HELPER.user.js
// @version      3.12.0
// @description  Otomatis memverifikasi seluruh SPOP & LSPOP pada halaman permohonan PBB Sidoarjo, menampilkan temuan sebagai toast notification persistent (tutup dengan X). v3.12: dukungan Mutasi Penuh (n2n01-form) = diff nilai existing (text-success float-right) vs permohonan, deteksi NIK filler=NOP, toleransi luas wajar, hitung revisi dari riwayat; perbaikan layout kolom spopTable n2n03 (kolom NOP) & baris NOP asal pada Mutasi Gabung tidak dianggap error.
// @author       You
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n01-form/*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n01-form/*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n02-form/*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n02-form/*
// @match        https://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n03-form/*
// @match        http://sie.pajakdaerah.sidoarjokab.go.id:440/permohonan/int/n2n03-form/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';
  if (window.__verifHelperLoaded) return;
  window.__verifHelperLoaded = true;

  /* ── v3.12 changelog ──
   * 1. @match n2n01-form/* (Mutasi Penuh / form SPOP tunggal):
   *    - parse pasangan input (nilai BARU) ↔ <strong class="text-success float-right"> (nilai EXISTING/lama)
   *    - toast ringkas "field berubah: lama → baru" (diff mutasi, level info)
   *    - deteksi NIK lama = NOP (filler) → info koreksi; NIK baru masih = NOP → warn
   *    - luas berubah dalam toleransi wajar (CFG.luasAbsTol / luasPctTol) → info (pengukuran ulang BPN),
   *      perubahan luas besar tanpa perubahan jenis tanah → warn (cek lampiran)
   *    - NIK & Nama berubah bersamaan → warn (cek KTP/KK)
   *    - hitung berapa kali CS mengembalikan permohonan dari panel Riwayat → info
   * 2. spopTable: deteksi layout kolom dari <thead> (n2n02 7 kolom vs n2n03 8 kolom + NOP) →
   *    label baris & isInduk benar di kedua halaman.
   * 3. Mutasi Gabung (n2n03): baris NOP asal (No. Formulir '-') tidak lagi dicek kelengkapan
   *    (dulu jadi vh-row-bad palsu); muncul info ringkas "NOP asal → induk, verifikasi manual".
   * 4. Cek induk vs bagian: bandingkan luas INDUK ASLI (marker) dengan induk baru + jumlah bagian
   *    (bukan hanya jumlah bagian), sehingga mutasi yang memotong induk tidak false-positive.
   * ────────────────────────────────────────────────────*/

  const CACHE = window.__verifCache || (window.__verifCache = { spop: new Map(), lspop: new Map() });

  const q = []; let running = 0; const CONC = 4;
  function enqueue(fn){ q.push(fn); pump(); }
  function pump(){ while (running < CONC && q.length){ const fn=q.shift(); running++; Promise.resolve().then(fn).finally(()=>{running--; pump();}); } }

  function num(v){ const x=Number(String(v||'').replace(/[^\d.,-]/g,'').replace(',','.')); return isNaN(x)?0:x; }
  function get(doc,name){ const e=doc.querySelector('[name="'+name+'"]'); return e ? (e.value||'').trim() : ''; }
  function selVal(doc,name){ const e=doc.querySelector('select[name="'+name+'"]'); if(!e) return ''; const opt=e.querySelector('option[selected]'); return opt ? (opt.value||'').trim() : (e.value||'').trim(); }
  function allVals(doc,name){ return Array.from(doc.querySelectorAll('[name="'+name+'"]')).map(e=> (e.value||'').trim()); }

  /* ── konfigurasi (ubah sesuai kebiasaan verifikasi) ── */
  const CFG = {
    luasAbsTol: 50,    // m² — selisih luas dianggap wajar (mis. hasil pengukuran ulang BPN)
    luasPctTol: 0.02,  // relatif — toleransi tambahan 2% dari luas lama
    indukTol: 0.01,    // relatif — toleransi cek induk asli vs induk baru + bagian (1%)
  };
  function digitsOnly(s){ return String(s||'').replace(/\D/g,''); }
  // seluruh pasangan name -> nilai existing pada satu dokumen (n2n01-form / modal SPOP)
  function parseExistingMap(doc){
    const map = {};
    try {
      doc.querySelectorAll('strong.text-success.float-right, strong.float-right.text-success').forEach(st=>{
        const fg = st.closest('.form-group'); if(!fg) return;
        const inp = fg.querySelector('input[name], select[name]'); if(!inp) return;
        const name = inp.getAttribute('name');
        const v = (st.textContent||'').trim();
        if(v !== '' && v !== '-') map[name] = v;
      });
    } catch(e){}
    return map;
  }

  function normPersil(s){ return String(s||'').toUpperCase().replace(/\s+/g,'').replace(/^NIB/,'').trim(); }
  function normText(s){ return String(s||'').trim().replace(/\s+/g,' '); }

  function parseSpop(html){
    const doc = new DOMParser().parseFromString(html,'text/html');
    return {
      nik: get(doc,'subjek_pajak_id'),
      nama: get(doc,'nm_wp'),
      alamat: get(doc,'jalan_wp'),
      rt: get(doc,'rt_wp'),
      rw: get(doc,'rw_wp'),
      kelurahan: selVal(doc,'kelurahan_wp') || get(doc,'kelurahan_wp'),
      npwp: get(doc,'npwp'),
      telp: get(doc,'telp_wp'),
      email: get(doc,'email'),
      pekerjaan: selVal(doc,'status_pekerjaan_wp') || get(doc,'status_pekerjaan_wp'),
      statusWp: selVal(doc,'kd_status_wp') || get(doc,'kd_status_wp'),
      noPersil: get(doc,'no_persil'),
      luasTanah: num(get(doc,'luas_bumi')),
      existing: parseExistingMap(doc),
      // luas tanah asli/induk lama (sebelum dikurangi) ada di <strong class="text-success float-right"> di bawah input luas_bumi
      luasTanahAsli: (function(){
        try {
          const inp = doc.querySelector('input[name="luas_bumi"]');
          const container = inp ? (inp.closest('.form-group') || inp.parentElement) : null;
          const st = container ? container.querySelector('strong.text-success.float-right, strong.float-right.text-success') : null;
          return st ? num(st.textContent) : 0;
        } catch(e){ return 0; }
      })(),
      jenisTanah: selVal(doc,'jns_bumi') || get(doc,'jns_bumi'),
      kdBukti: selVal(doc,'kd_bukti_kepemilikan') || get(doc,'kd_bukti_kepemilikan'),
      noSertifikat: allVals(doc,'no_sertifikat[]'),
      tglSertifikat: allVals(doc,'tgl_sertifikat[]'),
      namaSertifikat: allVals(doc,'nama_sertifikat[]'),
      jalanOp: get(doc,'jalan_op'),
      rtOp: get(doc,'rt_op'),
      rwOp: get(doc,'rw_op'),
    };
  }
  function parseLspop(html){
    const doc = new DOMParser().parseFromString(html,'text/html');
    return {
      noBng: get(doc,'no_bng'),
      kdJpb: selVal(doc,'kd_jpb') || get(doc,'kd_jpb'),
      luasBng: num(get(doc,'luas_bng')),
      jmlLantai: num(get(doc,'jml_lantai_bng')),
      thnBangun: num(get(doc,'thn_dibangun_bng')),
      thnRenov: num(get(doc,'thn_renovasi_bng')),
      kondisi: selVal(doc,'kondisi_bng') || get(doc,'kondisi_bng'),
    };
  }

  function ensureFullTable(tableId){
    // Paksa DataTables tampilkan semua baris (page length 100) agar tidak terpotong paginasi
    try {
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
        const dt = window.jQuery('#'+tableId).DataTable();
        if (dt && dt.page && dt.page.len) {
          if (dt.page.len() < 100) dt.page.len(100).draw(false);
        }
      }
    } catch(e){}
  }

  // Peta kolom spopTable dari <thead> — layout beda antara n2n02 (7 kolom, tanpa NOP)
  // dan n2n03 (8 kolom, ada kolom NOP di posisi 1).
  function spopColMap(){
    const table = document.getElementById('spopTable');
    if(!table) return null;
    const thead = table.querySelector('thead');
    if(!thead) return null;
    const ths = Array.from(thead.querySelectorAll('th')).map(th=>(th.textContent||'').toLowerCase().replace(/\s+/g,' ').trim());
    const find = re => ths.findIndex(t=>re.test(t));
    const m = {
      noForm: find(/formulir/),
      nama: find(/nama wp/),
      alamat: find(/^alamat/),
      jenis: find(/jenis/),
      luas: find(/luas/),
      nop: find(/^nop(\s|$)/),
    };
    if(m.noForm < 0) return null;
    return m;
  }
  // buang badge "Induk"/"Pecahan" dari teks sel No. Formulir SPOP
  function cleanNoForm(s){
    return String(s||'').replace(/\s*(induk|pecahan)\s*$/i,'').trim().replace(/\s+/g,' ');
  }
  function collectSpop(){
    ensureFullTable('spopTable');
    const table = document.getElementById('spopTable');
    if(!table) return [];
    const cm = spopColMap();
    const rows = [];
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells = tr.querySelectorAll('td');
      if(cells.length < 7) return;
      const link = tr.querySelector('a.showModal[href*="temp-dat-spop"], a[href*="temp-dat-spop"]');
      const url = link ? link.getAttribute('href') : null;
      const cellAt = i => ((cells[i]||{}).textContent || '').trim().replace(/\s+/g,' ');
      const noFormCell = cm ? cellAt(cm.noForm) : cellAt(1);
      const nopCell   = cm && cm.nop > -1 ? cellAt(cm.nop) : '';
      const isInduk = /(^|\s)induk/i.test(noFormCell) || /(^|\s)induk/i.test(nopCell);
      const noForm = cleanNoForm(noFormCell);
      rows.push({
        no: cellAt(0),
        noForm,
        nop: nopCell.replace(/\s*induk$/i,'').trim(),
        isInduk,
        // baris placeholder NOP asal (Mutasi Gabung): No. Formulir '-', biasanya nama/alamat '-'
        isOrigin: (noForm === '-' || noForm === ''),
        nama: cm ? cellAt(cm.nama) : cellAt(2),
        alamat: cm ? cellAt(cm.alamat) : cellAt(3),
        jenis: cm ? cellAt(cm.jenis) : cellAt(4),
        luas: cm ? cellAt(cm.luas) : cellAt(5),
        url,
        data: CACHE.spop.get(url) || undefined,
        _tr: tr,
      });
    });
    return rows;
  }
  function collectLspop(){
    ensureFullTable('lspopTable');
    const table = document.getElementById('lspopTable');
    if(!table) return [];
    const rows = [];
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells = tr.querySelectorAll('td');
      if(cells.length < 8) return;
      const link = tr.querySelector('a.showModal[href*="temp-bangunan"], a[href*="temp-bangunan"]');
      const url = link ? link.getAttribute('href') : null;
      rows.push({
        no: (cells[0]||{}).textContent?.trim() || '',
        noSpop: (cells[1]||{}).textContent?.trim() || '',
        nama: (cells[2]||{}).textContent?.trim() || '',
        noFormLspop: (cells[3]||{}).textContent?.trim() || '',
        jenis: (cells[4]||{}).textContent?.trim() || '',
        noBng: (cells[5]||{}).textContent?.trim() || '',
        luas: (cells[6]||{}).textContent?.trim() || '',
        tahun: (cells[7]||{}).textContent?.trim() || '',
        url,
        data: CACHE.lspop.get(url) || undefined,
        _tr: tr,
      });
    });
    return rows;
  }

  function fetchSpop(row){
    if(!row.url) return;
    if(CACHE.spop.has(row.url)){ row.data = CACHE.spop.get(row.url); return; }
    if(row._fetching) return;
    row._fetching = true;
    enqueue(async ()=>{
      try {
        const res = await fetch(row.url, {credentials:'same-origin'});
        const html = await res.text();
        const d = parseSpop(html);
        CACHE.spop.set(row.url, d);
        row.data = d;
      } catch(e){ row.data = null; row._err = String(e); }
      finally { row._fetching = false; recompute(); }
    });
  }
  function fetchLspop(row){
    if(!row.url) return;
    if(CACHE.lspop.has(row.url)){ row.data = CACHE.lspop.get(row.url); return; }
    if(row._fetching) return;
    row._fetching = true;
    enqueue(async ()=>{
      try {
        const res = await fetch(row.url, {credentials:'same-origin'});
        const html = await res.text();
        const d = parseLspop(html);
        CACHE.lspop.set(row.url, d);
        row.data = d;
      } catch(e){ row.data = null; row._err = String(e); }
      finally { row._fetching = false; recompute(); }
    });
  }

  function subjectSig(d){
    // Hanya data SUBJEK PAJAK (WP), bukan data objek (no. persil, luas, alamat OP).
    // Satu orang boleh punya banyak objek (persil berbeda) dengan data WP yang sama.
    return JSON.stringify({
      nama: (d.nama||'').toUpperCase(),
      alamat: (d.alamat||'').toUpperCase(),
      rt: d.rt, rw: d.rw,
      kelurahan: d.kelurahan,
      npwp: d.npwp,
      telp: d.telp,
      email: (d.email||'').toLowerCase(),
      pekerjaan: d.pekerjaan,
    });
  }

  const currentYear = new Date().getFullYear();

  function isFakePhone(v){
    const d = v.replace(/\D/g,'');
    if(!d) return false;
    if(/^(\d)\1+$/.test(d)) return true;          // 111111
    if(d === '1234567890' || d === '0123456789') return true;
    if(/0{5,}/.test(d)) return true;
    return false;
  }
  function hasInvalidChars(s){
    // allow letters, digits, space, and common address punctuation: . , - ' / ( ) [ ] & # + :
    return /[^\p{L}\p{N}\s.,'\-\/()\[\]&#+:]/u.test(String(s||''));
  }
  function isFutureDate(str){ const d=new Date(str); if(isNaN(d)) return false; return d > new Date(); }
  function tooOldDate(str){ const d=new Date(str); if(isNaN(d)) return false; return (new Date().getFullYear() - d.getFullYear()) > 100; }

  function computeIssues(spopRows, lspopRows){
    const issues = [];
    // --- NIK/NIB duplicates ---
    const byNik = new Map();
    for (const r of spopRows){ if(!r.data || r.isOrigin) continue; const nik=(r.data.nik||'').trim()||'(kosong)'; if(!byNik.has(nik)) byNik.set(nik,[]); byNik.get(nik).push(r); }
    for (const [nik, list] of byNik){
      if(list.length < 2) continue;
      if(nik === '(kosong)'){ issues.push({key:'nik-empty', text:'NIK/NIB kosong pada ' + list.length + ' SPOP (' + list.map(r=>r.noForm).join(', ') + ')', level:'warn', rows:list.map(r=>r.noForm)}); continue; }
      const sigs = new Set(list.map(r=>subjectSig(r.data)));
      if(sigs.size > 1){
        issues.push({key:'nik-diff:'+nik, text:'NIK/NIB sama "' + nik + '" tapi data subjek pajak berbeda antar SPOP: ' + list.map(r=>r.noForm).join(', '), level:'error', rows:list.map(r=>r.noForm)});
      }
    }
    // --- no sertifikat duplicates ---
    const certMap = new Map();
    for (const r of spopRows){ if(!r.data || r.isOrigin) continue; for(const c of (r.data.noSertifikat||[])){ const key=(c||'').toUpperCase().replace(/\s+/g,''); if(!key) continue; if(!certMap.has(key)) certMap.set(key,[]); certMap.get(key).push({row:r, val:c}); } }
    for (const [c, list] of certMap){
      if(list.length > 1){
        // Satu sertifikat bisa mencakup beberapa persil (pecahan) -> bukan duplikat.
        // Hanya flag jika persil SAMA (atau keduanya kosong/tidak diketahui).
        const persils = list.map(x=>normPersil(x.row.data.noPersil));
        const distinctPersil = new Set(persils.filter(p=>p));
        const allEmpty = persils.every(p=>!p);
        if(distinctPersil.size > 1) continue; // persil berbeda -> shared cert, skip
        if(allEmpty) continue; // tidak bisa verifikasi, skip (hindari false positive)
        const dates = new Set(list.map(x=>(x.row.data.tglSertifikat||[]).join('|')));
        const names = new Set(list.map(x=>(x.row.data.namaSertifikat||[]).join('|')));
        let extra = '';
        if(dates.size > 1) extra += ' (tanggal berbeda)';
        if(names.size > 1) extra += ' (nama berbeda)';
        issues.push({key:'cert-dup:'+c, text:'No. sertifikat duplikat (persil sama) "' + c + '"' + extra + ' pada: ' + list.map(x=>x.row.noForm).join(', '), level:'error', rows:list.map(x=>x.row.noForm)});
      }
    }
    // --- cert same no but different date/nama (even if not dup across rows? handled above) ---

    // --- per-SPOP checks ---
    for (const r of spopRows){ if(!r.data || r.isOrigin) continue; const d=r.data;
      const nik=(d.nik||'').trim();
      // NIK length check dihapus (lenient): yang berbahaya duplikasi, bukan jumlah digit
      if(d.kdBukti === '1' && (!d.noPersil || d.noPersil === '-')) issues.push({key:'persil:'+r.noForm, text:'No. Persil/NIB kosong pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      if(d.luasTanah <= 0 && !['4','5','6','A','B','C','D','E'].includes(String(d.jenisTanah||'').toUpperCase())) issues.push({key:'luas-tanah:'+r.noForm, text:'Luas tanah 0/kosong pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      if(d.kdBukti === '1' && (d.noSertifikat.length===0 || d.noSertifikat.every(x=>!x))) issues.push({key:'cert-empty:'+r.noForm, text:'No. sertifikat kosong pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      if(d.email && d.email !== '-' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) issues.push({key:'email:'+r.noForm, text:'Format email tidak valid pada SPOP '+r.noForm+' ('+d.email+')', level:'warn', rows:[r.noForm]});

      // telepon format
      const telp = (d.telp||'').trim();
      if(telp){
        const digits = telp.replace(/\D/g,'');
        if(!(telp.startsWith('62') || telp.startsWith('0'))) issues.push({key:'telp-prefix:'+r.noForm, text:'Telepon tidak diawali 62/0 pada SPOP '+r.noForm+' ('+telp+')', level:'warn', rows:[r.noForm]});
        if(digits.length < 10 || digits.length > 15) issues.push({key:'telp-len:'+r.noForm, text:'Panjang telepon tidak 10-15 digit pada SPOP '+r.noForm+' ('+telp+')', level:'warn', rows:[r.noForm]});
        if(isFakePhone(telp)) issues.push({key:'telp-fake:'+r.noForm, text:'Nomor telepon terlihat palsu/placeholder pada SPOP '+r.noForm+' ('+telp+')', level:'info', rows:[r.noForm]});
      }
      // bukti kepemilikan SERTIFIKAT tapi no. sertifikat kosong/invalid
      if(d.kdBukti === '1'){
        const certs = (d.noSertifikat||[]).map(x=>String(x||'').trim());
        for(const c of certs){
          if(!c || /^0+$/.test(c.replace(/\D/g,'')) || c.length < 5){
            issues.push({key:'cert-invalid:'+r.noForm+':'+c, text:'Bukti SERTIFIKAT tapi no. sertifikat kosong/placeholder ("'+c+'") pada SPOP '+r.noForm, level:'info', rows:[r.noForm]});
          }
        }
      }
      // sertifikat tanggal
      for(const tg of (d.tglSertifikat||[])){
        if(!tg) continue;
        if(isFutureDate(tg)) issues.push({key:'cert-future:'+r.noForm+':'+tg, text:'Tanggal sertifikat di masa depan ('+tg+') pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
        if(tooOldDate(tg)) issues.push({key:'cert-old:'+r.noForm+':'+tg, text:'Tanggal sertifikat >100 tahun ('+tg+') pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      }
      // nilai negatif di field angka
      if(d.luasTanah < 0) issues.push({key:'neg-luastanah:'+r.noForm, text:'Luas tanah negatif pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      // karakter tidak valid di nama/alamat
      if(hasInvalidChars(d.nama)) issues.push({key:'invalidchar-nama:'+r.noForm, text:'Karakter tidak valid di nama WP pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      if(hasInvalidChars(d.alamat)) issues.push({key:'invalidchar-alamat:'+r.noForm, text:'Karakter tidak valid di alamat WP pada SPOP '+r.noForm, level:'warn', rows:[r.noForm]});
      // RT/RW format check dihapus: 2-3 digit sudah valid di Sidoarjo
    }

    // --- no persil/NIB format normalize + duplikat antar SPOP ---
    const persilMap = new Map();
    for (const r of spopRows){ if(!r.data || r.isOrigin) continue; const key = normPersil(r.data.noPersil); if(!key) continue; if(!persilMap.has(key)) persilMap.set(key,[]); persilMap.get(key).push(r); }
    for (const [k, list] of persilMap){
      if(list.length > 1){
        issues.push({key:'persil-dup:'+k, text:'No. persil/NIB duplikat (dinormalisasi "'+k+'") pada: ' + list.map(r=>r.noForm).join(', '), level:'warn', rows:list.map(r=>r.noForm)});
      }
    }

    // --- Duplikat OP: alamat OP + kelurahan + luas bumi identik ---
    const opMap = new Map();
    for (const r of spopRows){ if(!r.data || r.isOrigin) continue; const d=r.data; const key = normText((d.jalanOp||'')+'|'+(d.rtOp||'')+'|'+(d.rwOp||'')+'|'+(d.kelurahan||'')+'|'+d.luasTanah+'|'+normPersil(d.noPersil)).toLowerCase(); if(!d.jalanOp && !d.luasTanah) continue; if(!opMap.has(key)) opMap.set(key,[]); opMap.get(key).push(r); }
    for (const [k, list] of opMap){ if(list.length > 1) issues.push({key:'op-dup:'+k, text:'Duplikat OP (alamat+RT/RW+kelurahan+luas+persil sama) pada: ' + list.map(r=>r.noForm).join(', '), level:'warn', rows:list.map(r=>r.noForm)}); }

    // --- SPOP induk vs bagian (pecah/gabung) ---
    // Luas induk ASLI (sebelum mutasi) ada di <strong class="text-success float-right"> di bawah input luas_bumi
    // pada form SPOP induk. Invariant: luas induk asli ≈ luas induk BARU + jumlah luas bagian.
    // v3.12: jumlah bagian TIDAK dibandingkan sendirian dengan induk asli (itu false-positive ketika
    // induk ikut dipotong/dimutasi); bandingkan induk asli dengan total hasil mutasi.
    const byNikAll = new Map();
    for (const r of spopRows){ if(!r.data) continue; const nik=(r.data.nik||'').trim()||'(kosong)'; if(!byNikAll.has(nik)) byNikAll.set(nik,[]); byNikAll.get(nik).push(r); }
    for (const [nik, list] of byNikAll){
      const induk = list.find(r=>r.isInduk && !r.isOrigin);
      const bagian = list.filter(r=>r!==induk);
      if(!induk || bagian.length === 0) continue;
      const indukAsli = (induk.data.luasTanahAsli && induk.data.luasTanahAsli > 0) ? induk.data.luasTanahAsli : 0;
      if(indukAsli <= 0) continue; // tanpa nilai asli dari marker, tidak bisa diverifikasi (hindari false positive)
      const indukBaru = induk.data.luasTanah || 0;
      const sumBagian = bagian.reduce((a,r)=>a+((r.data && r.data.luasTanah > 0) ? r.data.luasTanah : 0),0);
      const sumAll = indukBaru + sumBagian;
      const tol = Math.max(1, indukAsli * CFG.indukTol);
      const diff = Math.abs(indukAsli - sumAll);
      if(diff > tol){
        issues.push({key:'induk-pecahan:'+nik, text:'Luas tanah induk asli ('+indukAsli+' m²) ≠ total mutasi (induk baru '+indukBaru+' + bagian '+Math.round(sumBagian)+' = '+Math.round(sumAll)+' m²) [selisih '+Math.round(diff)+'] pada NIK '+nik, level:'warn', rows:list.map(r=>r.noForm)});
      } else {
        issues.push({key:'induk-potong:'+nik, text:'Induk '+indukAsli+' m² → '+indukBaru+' m² (bagian '+Math.round(sumBagian)+' m², konsisten)', level:'info', rows:[induk.noForm]});
      }
    }

    // --- NIK sama tapi no. persil berbeda: flag kalau nama WP berbeda (sudah via nik-diff) ---

    // --- LSPOP checks ---
    for (const r of lspopRows){ if(!r.data) continue; const d=r.data;
      const label = 'LSPOP ' + (r.noFormLspop || r.no) + ' (SPOP ' + r.noSpop + ', bng ' + r.noBng + ')';
      if(!d.jmlLantai || d.jmlLantai <= 0){ issues.push({key:'lantai-zero:'+r.url, text:'Jumlah lantai kosong/0 pada ' + label, level:'error', rows:[r.noFormLspop||r.no]}); }
      else {
        if(!Number.isInteger(d.jmlLantai)) issues.push({key:'lantai-float:'+r.url, text:'Jumlah lantai bukan bilangan bulat ('+d.jmlLantai+') pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
        if(d.jmlLantai > 50) issues.push({key:'lantai-absurd:'+r.url, text:'Jumlah lantai absurd (>50): '+d.jmlLantai+' pada '+label, level:'error', rows:[r.noFormLspop||r.no]});
        if(d.luasBng > 0 && d.jmlLantai === d.luasBng) issues.push({key:'lantai=luas:'+r.url, text:'Jumlah lantai = luas bangunan ('+d.jmlLantai+') — kemungkinan tertukar luas↔lantai pada '+label, level:'error', rows:[r.noFormLspop||r.no]});
        if(d.luasBng > 0 && d.jmlLantai > d.luasBng) issues.push({key:'lantai>luas:'+r.url, text:'Jumlah lantai ('+d.jmlLantai+') > luas bangunan ('+d.luasBng+' m²) pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
        if(d.luasBng > 0 && d.jmlLantai > 0){
          const perLantai = d.luasBng / d.jmlLantai;
          if(perLantai < 4) issues.push({key:'per-lantai:'+r.url, text:'Luas per lantai < 4 m² ('+perLantai.toFixed(1)+' m²) pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
        }
      }
      // Edge: JPB 11 (bukan kena pajak) boleh tanpa bangunan; tanah kosong (jns_bumi 3) juga boleh
      if(d.luasBng <= 0 && d.kdJpb !== '11'){
        issues.push({key:'luas-bng:'+r.url, text:'Luas bangunan 0/kosong pada '+label, level:'info', rows:[r.noFormLspop||r.no]});
      }
      if(d.thnBangun && (d.thnBangun < 1900 || d.thnBangun > currentYear+1)) issues.push({key:'thn:'+r.url, text:'Tahun bangun tidak wajar ('+d.thnBangun+') pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
      // tahun bangun > tahun renovasi
      if(d.thnRenov && d.thnBangun && d.thnRenov < d.thnBangun) issues.push({key:'renov:'+r.url, text:'Tahun renovasi ('+d.thnRenov+') < tahun bangun ('+d.thnBangun+') pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
      // kondisi vs tahun: bangunan baru (<5 thn) dengan kondisi jelek
      const age = currentYear - (d.thnBangun||currentYear);
      if(age < 5 && d.kondisi === '4') issues.push({key:'kondisi-baru:'+r.url, text:'Bangunan baru (<5 thn) dengan kondisi berat/rusak pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
      if(age < 2 && d.kondisi === '3') issues.push({key:'kondisi-sedang-baru:'+r.url, text:'Bangunan baru (<2 thn) dengan kondisi sedang pada '+label, level:'info', rows:[r.noFormLspop||r.no]});
      // negatif
      if(d.luasBng < 0) issues.push({key:'neg-luasbng:'+r.url, text:'Luas bangunan negatif pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
      if(d.jmlLantai < 0) issues.push({key:'neg-lantai:'+r.url, text:'Jumlah lantai negatif pada '+label, level:'warn', rows:[r.noFormLspop||r.no]});
    }

    // --- no. bangunan duplikat dalam satu SPOP ---
    const bngNoMap = new Map();
    for (const r of lspopRows){ if(!r.data) continue; const key = (r.noSpop||'').replace(/\s+/g,'') + '|' + (r.noBng||'').trim(); if(!r.noBng) continue; if(!bngNoMap.has(key)) bngNoMap.set(key,[]); bngNoMap.get(key).push(r); }
    for (const [k, list] of bngNoMap){ if(list.length > 1) issues.push({key:'bng-dup:'+k, text:'No. bangunan duplikat "'+list[0].noBng+'" pada SPOP '+list[0].noSpop+' ('+list.length+' entri)', level:'warn', rows:list.map(r=>r.noFormLspop||r.no)}); }

    // --- cross-check total luas bangunan vs luas tanah (berdasarkan jumlah lantai) ---
    const landBySpop = new Map();
    for (const r of spopRows){ if(r.data) landBySpop.set(r.noForm.replace(/\s+/g,''), r.data.luasTanah); }
    // max lantai per SPOP dari LSPOP
    const maxLantaiBySpop = new Map();
    for (const r of lspopRows){ if(!r.data) continue; const key=(r.noSpop||'').replace(/\s+/g,''); const cur = maxLantaiBySpop.get(key)||0; if((r.data.jmlLantai||0) > cur) maxLantaiBySpop.set(key, r.data.jmlLantai); }
    const bngBySpop = new Map();
    for (const r of lspopRows){ if(!r.data) continue; const key=(r.noSpop||'').replace(/\s+/g,''); bngBySpop.set(key, (bngBySpop.get(key)||0)+(r.data.luasBng||0)); }
    for (const [spop,total] of bngBySpop){
      const land=landBySpop.get(spop);
      if(!land || land<=0) continue;
      const ml = maxLantaiBySpop.get(spop) || 1;
      // max total floor area = tanah * lantai * 1.15 (toleransi 15% untuk coverage non-penuh)
      const maxTotal = land * Math.max(1, ml) * 1.15;
      if(total > maxTotal) issues.push({key:'bng>tanah:'+spop, text:'Total luas bangunan ('+total+' m²) melebihi kapasitas lantai (max ~'+Math.round(maxTotal)+' m², '+ml+' lantai) pada SPOP '+spop, level:'warn', rows:[spop]});
    }

    // --- Mutasi Gabung (n2n03): baris NOP asal sengaja kosong ('-', 0 m²) → jangan dianggap error,
    //     cukup info ringkas + pengingat verifikasi manual jumlah luas asal vs induk ---
    const origins = spopRows.filter(r=>r.isOrigin);
    if(origins.length > 0){
      const induk = spopRows.find(r=>r.isInduk && !r.isOrigin);
      const nops = origins.map(r=>r.nop || r.noForm || r.no).filter(Boolean).join(', ');
      const indukNop = induk ? (induk.nop || induk.noForm) : '';
      let txt = 'NOP asal (gabung) dilewati dari cek kelengkapan: ' + nops;
      if(indukNop){
        const luas = (induk.data && induk.data.luasTanah > 0) ? induk.data.luasTanah + ' m²' : (induk.luas || '?');
        txt += ' → induk ' + indukNop + ' (' + luas + ')';
      }
      txt += '. Verifikasi manual: jumlah luas NOP asal harus = luas induk.';
      issues.push({key:'gabung-origin', text:txt, level:'info', rows:origins.map(r=>r.noForm||r.nop||r.no)});
    }

    return issues;
  }

  /* ── Theme-aware styles (aligns with Material 3 Expressive theming) ── */
  function injectVhStyles(){
    if(document.getElementById('vh-styles')) return;
    const st = document.createElement('style');
    st.id = 'vh-styles';
    st.textContent = [
      '#vh-toast-host { font-family: inherit; pointer-events:none; }',
      '.vh-toast { background: var(--m3-surface-1, #161B22); color: var(--m3-on-surface, #E1E3E5); border-left: 4px solid var(--m3-outline, #30363D); border-radius: var(--m3-radius-sm, 6px); padding: 8px 10px; box-shadow: 0 2px 8px rgba(0,0,0,.25); font-size: 12px; display: flex; gap: 6px; align-items: flex-start; pointer-events:auto; }',
      '.vh-toast--error { border-left-color: var(--m3-error, #FF7B72); }',
      '.vh-toast--warn  { border-left-color: var(--m3-tertiary, #FFD6A5); }',
      '.vh-toast--info  { border-left-color: var(--m3-primary, #79C0FF); }',
      '.vh-toast__icon { flex-shrink: 0; }',
      '.vh-toast__body { flex: 1; line-height: 1.4; }',
      '.vh-toast__close { background: none; border: none; font-size: 14px; cursor: pointer; color: var(--m3-on-surface-variant, #A8B0B8); padding: 0 2px; line-height: 1; }',
      '.vh-toast__close:hover { color: var(--m3-on-surface, #E1E3E5); }',
      '.vh-row-bad { outline: 2px solid var(--m3-error, #FF7B72) !important; background-color: color-mix(in srgb, var(--m3-error, #FF7B72) 14%, transparent) !important; }',
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ── Toast UI ── */
  let toastHost = null;
  function ensureToastHost(){
    if(toastHost) return toastHost;
    injectVhStyles();
    toastHost = document.createElement('div');
    toastHost.id = 'vh-toast-host';
    toastHost.setAttribute('role', 'status');
    toastHost.setAttribute('aria-live', 'polite');
    toastHost.style.cssText = 'position:fixed;top:12px;right:12px;width:min(360px,calc(100vw - 24px));z-index:1040;pointer-events:none;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(toastHost);
    return toastHost;
  }
  const activeToasts = new Map();
  const dismissedKeys = new Set(); // user-closed toasts; re-shown only after issue disappears & reappears
  const MAX_TOASTS = 5;
  function showToast(issue){
    ensureToastHost();
    if(dismissedKeys.has(issue.key)) return;
    if(activeToasts.has(issue.key)) return;
    // cap visible toasts
    if(activeToasts.size >= MAX_TOASTS){
      const oldest = activeToasts.keys().next().value;
      const el = activeToasts.get(oldest);
      if(el) el.remove();
      activeToasts.delete(oldest);
    }
    const el = document.createElement('div');
    el.dataset.key = issue.key;
    const cls = issue.level === 'error' ? 'vh-toast vh-toast--error' : (issue.level === 'info' ? 'vh-toast vh-toast--info' : 'vh-toast vh-toast--warn');
    const icon = issue.level === 'error' ? '⛔' : (issue.level === 'info' ? 'ℹ' : '⚠');
    el.className = cls;
    el.innerHTML = '<div class="vh-toast__icon">'+icon+'</div><div class="vh-toast__body">'+escapeHtml(issue.text)+'</div><button type="button" class="vh-toast__close" aria-label="Tutup">×</button>';
    const btn = el.querySelector('button');
    btn.addEventListener('click', ()=>{ el.remove(); activeToasts.delete(issue.key); dismissedKeys.add(issue.key); });
    toastHost.appendChild(el);
    activeToasts.set(issue.key, el);
    // auto-dismiss info toasts
    if(issue.level === 'info'){
      setTimeout(()=>{ if(activeToasts.has(issue.key)){ el.remove(); activeToasts.delete(issue.key); } }, 6000);
    }
  }
  function removeStaleToasts(currentKeys){
    for(const [key, el] of Array.from(activeToasts.entries())){
      if(!currentKeys.has(key)){ el.remove(); activeToasts.delete(key); }
    }
    // issue hilang -> izinkan muncul lagi nanti
    for(const k of Array.from(dismissedKeys)){
      if(!currentKeys.has(k)) dismissedKeys.delete(k);
    }
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ── highlight rows ── */
  function highlightRows(spopRows, lspopRows, issues){
    const spopBad = new Set(); const lspopBad = new Set();
    issues.forEach(i=>{
      (i.rows||[]).forEach(r=>{
        // try match spop noForm
        if(spopRows.some(x=>x.noForm===r)) spopBad.add(r);
        if(lspopRows.some(x=> (x.noFormLspop||x.no)===r)) lspopBad.add(r);
      });
    });
    spopRows.forEach(r=>{
      if(!r._tr) return;
      if(spopBad.has(r.noForm)) r._tr.classList.add('vh-row-bad');
      else r._tr.classList.remove('vh-row-bad');
    });
    lspopRows.forEach(r=>{
      if(!r._tr) return;
      const id = r.noFormLspop || r.no;
      if(lspopBad.has(id)) r._tr.classList.add('vh-row-bad');
      else r._tr.classList.remove('vh-row-bad');
    });
  }

  /* ── dirty state ── */
  let dirty = false;
  function setDirty(v){ dirty = v; }
  function bindDirtyTracking(){
    document.addEventListener('input', (e)=>{ if(e.target && (e.target.matches('input,select,textarea'))) setDirty(true); }, true);
    document.addEventListener('change', (e)=>{ if(e.target && (e.target.matches('input,select,textarea'))) setDirty(true); }, true);
    // submit buttons clear dirty
    document.addEventListener('click', (e)=>{
      const t = e.target;
      if(t && (t.type==='submit' || /simpan|save/i.test(t.textContent||'') || t.classList.contains('btn-success'))){
        setTimeout(()=>setDirty(false), 500);
      }
    }, true);
  }
  bindDirtyTracking();
  window.addEventListener('beforeunload', (e)=>{ if(dirty){ e.preventDefault(); e.returnValue=''; } });

  /* ── finalized detection ── */
  function isFinalized(){
    try {
      const txt = (document.body.innerText || '').toLowerCase();
      return /permohonan selesai/.test(txt);
    } catch(e){}
    return false;
  }

  /* ── cleanup: hentikan polling interval & observer saat helper selesai / halaman ditutup ── */
  let _cleanedUp = false;
  function cleanup(){
    if(_cleanedUp) return;
    _cleanedUp = true;
    if(_scanInterval !== null){ clearInterval(_scanInterval); _scanInterval = null; }
    try { obs.disconnect(); } catch(e){}
  }
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('beforeunload', cleanup);

  /* ── scan ── */
  let spopRows = [], lspopRows = [];
  let _scanTimer = null;
  let _scanInterval = null;
  function scheduleScan(force){ clearTimeout(_scanTimer); _scanTimer = setTimeout(()=>runScan(!!force), 800); }

  let _lastDataSig = '';
  function dataSig(){
    return spopRows.map(r=>r.url+':'+(r.data?'1':'0')).join('|') + '||' + lspopRows.map(r=>r.url+':'+(r.data?'1':'0')).join('|');
  }
  function runScan(force){
    // mode n2n01 (Mutasi Penuh / form SPOP tunggal): nilai existing ada langsung di DOM, tanpa fetch
    if(isN2n01Mode()){
      if(force) dismissedKeys.clear();
      if(isFinalized() && !force){ removeStaleToasts(new Set()); cleanup(); return; }
      try { runN2n01Scan(!!force); }
      catch(e){ window.__vh_n2n01 = {error: String(e)}; }
      return;
    }
    // tabel target sudah tidak ada di DOM (halaman berganti/hapus) -> skip kerja
    if(!document.getElementById('spopTable') && !document.getElementById('lspopTable')) return;
    if(force) dismissedKeys.clear();
    if(isFinalized() && !force){
      // mode audit: jangan scan ulang, hapus toast yang ada, hentikan interval & observer
      removeStaleToasts(new Set());
      cleanup();
      return;
    }
    const prevSig = _lastDataSig;
    spopRows = collectSpop();
    lspopRows = collectLspop();
    window.__vh_spopRows = spopRows;
    window.__vh_lspopRows = lspopRows;
    spopRows.forEach(r=>{ if(force) r.data = undefined; fetchSpop(r); });
    lspopRows.forEach(r=>{ if(force) r.data = undefined; fetchLspop(r); });
    const newSig = dataSig();
    _lastDataSig = newSig;
    // skip recompute if nothing changed and not force
    if(!force && newSig === prevSig && newSig.indexOf(':0') === -1){
      return;
    }
    recompute();
  }
  function recompute(){
    if(isFinalized()) return;
    spopRows = window.__vh_spopRows || spopRows;
    lspopRows = window.__vh_lspopRows || lspopRows;
    spopRows.forEach(r=>{ if(r.url && CACHE.spop.has(r.url) && r.data===undefined) r.data=CACHE.spop.get(r.url); });
    lspopRows.forEach(r=>{ if(r.url && CACHE.lspop.has(r.url) && r.data===undefined) r.data=CACHE.lspop.get(r.url); });
    const issues = computeIssues(spopRows, lspopRows);
    // dirty toast
    const curIssues = issues.slice();
    if(dirty){
      curIssues.push({key:'dirty-state', text:'Data belum disimpan.', level:'warn', rows:[]});
    }
    const keys = new Set(curIssues.map(i=>i.key));
    removeStaleToasts(keys);
    curIssues.forEach(showToast);
    highlightRows(spopRows, lspopRows, issues);
  }

  /* ── Mode n2n01-form: Mutasi Penuh (form SPOP tunggal) ──
   * Nilai BARU (permohonan) ada di input/select; nilai EXISTING (lama, induk sebelum mutasi)
   * ada di <strong class="text-success float-right"> di dalam form-group yang sama.
   */
  function isN2n01Mode(){
    // berbasis pathname, BUKAN DOM: modal "Edit SPOP" di halaman n2n02 juga memuat
    // input[name=nik_wp] ke DOM — deteksi via DOM akan salah mengalihkan mode.
    try { return /\/n2n01-form\//.test(location.pathname); }
    catch(e){ return false; }
  }
  function collectN2n01(){
    const val = n => { const e=document.querySelector('[name="'+n+'"]'); return e ? (e.value||'').trim() : ''; };
    const sel = n => { const e=document.querySelector('select[name="'+n+'"]'); if(!e) return ''; const o=e.querySelector('option[selected]'); return o ? (o.value||'').trim() : (e.value||'').trim(); };
    const riwayat = document.getElementById('history-timeline');
    return {
      nik: val('nik_wp'), nama: val('nama_wp'), alamat: val('alamat_wp'),
      kodePos: val('kode_pos_wp'), rt: val('rt_wp'), rw: val('rw_wp'), blokKav: val('blok_kav_wp'),
      kelurahan: sel('kelurahan_wp') || val('kelurahan_wp'),
      npwp: val('npwp_wp'), telp: val('telepon_wp'), email: val('email'),
      kdStatus: sel('kd_status_wp'), pekerjaan: sel('status_pekerjaan_wp'),
      nop: val('no_register'), nopBersama: val('nop_bersama'), nopAsal: val('nop_asal'),
      kdJenisTanah: sel('ref_jenis_tanah_id'), kdBukti: sel('ref_jenis_kepemilikan_id'), kdZnt: sel('kd_znt'),
      luasTanah: num(val('luas_bumi')),
      existing: parseExistingMap(document),
      riwayat: riwayat ? (riwayat.innerText||'') : '',
    };
  }
  function computeN2n01Issues(d){
    const issues = [];
    const ex = d.existing || {};
    const chg = [];
    const addChg = (label, lama, baru)=>{ const a=normText(lama), b=normText(baru); if(a!==b) chg.push(label+': '+(a||'—')+' → '+(b||'—')); };
    if(ex.nik_wp !== undefined && ex.nik_wp !== d.nik) addChg('NIK/NIB', ex.nik_wp, d.nik);
    if(ex.nama_wp !== undefined && ex.nama_wp !== d.nama) addChg('Nama', ex.nama_wp, d.nama);
    if(ex.alamat_wp !== undefined && ex.alamat_wp !== d.alamat) addChg('Alamat WP', ex.alamat_wp, d.alamat);
    if(ex.rt_wp !== undefined && ex.rt_wp !== d.rt) addChg('RT', ex.rt_wp, d.rt);
    if(ex.rw_wp !== undefined && ex.rw_wp !== d.rw) addChg('RW', ex.rw_wp, d.rw);
    if(ex.npwp_wp !== undefined && ex.npwp_wp !== d.npwp) addChg('NPWP', ex.npwp_wp, d.npwp || '(kosong)');
    if(ex.telepon_wp !== undefined && ex.telepon_wp !== d.telp) addChg('Telepon', ex.telepon_wp, d.telp);
    if(ex['ref_jenis_tanah_id'] !== undefined && ex['ref_jenis_tanah_id'] !== d.kdJenisTanah) addChg('Jenis tanah', ex['ref_jenis_tanah_id'], d.kdJenisTanah);
    if(ex['ref_jenis_kepemilikan_id'] !== undefined && ex['ref_jenis_kepemilikan_id'] !== d.kdBukti) addChg('Bukti kepemilikan', ex['ref_jenis_kepemilikan_id'], d.kdBukti);
    if(ex.kd_znt !== undefined && ex.kd_znt !== d.kdZnt) addChg('ZNT', ex.kd_znt, d.kdZnt);

    // ringkasan field yang berubah (diff mutasi) — tampil paling atas
    if(chg.length){
      let txt = 'Mutasi Penuh — field berubah: ' + chg.join(' • ');
      if(txt.length > 320) txt = txt.slice(0, 317) + '…';
      issues.push({key:'mutasi-diff', text:txt, level:'info', rows:[]});
    } else if(Object.keys(ex).length){
      issues.push({key:'mutasi-nochange', text:'Mutasi Penuh tanpa perubahan field apa pun (nilai baru sama dengan existing) — pastikan ada alasan/lampiran pengukuran.', level:'info', rows:[]});
    }

    // luas tanah: perubahan ≤ toleransi → wajar (pengukuran ulang BPN); besar tanpa ubah jenis → cek lampiran
    const lLama = ex.luas_bumi !== undefined ? num(ex.luas_bumi) : NaN;
    const lBaru = d.luasTanah;
    if(!isNaN(lLama) && lLama > 0 && lLama !== lBaru){
      const delta = Math.abs(lBaru - lLama), pct = delta / lLama;
      const jenisSama = ex['ref_jenis_tanah_id'] === undefined || ex['ref_jenis_tanah_id'] === d.kdJenisTanah;
      if(delta <= CFG.luasAbsTol || pct <= CFG.luasPctTol){
        issues.push({key:'luas-wajar', text:'Luasan diperbarui '+lLama+' → '+lBaru+' m² (selisih '+(delta>=1?Math.round(delta):delta.toFixed(1))+' m²) — kemungkinan hasil pengukuran ulang BPN, dalam angka wajar.', level:'info', rows:[]});
      } else if(jenisSama){
        issues.push({key:'luas-besar', text:'Luas berubah signifikan '+lLama+' → '+lBaru+' m² ('+(pct*100).toFixed(0)+'%) tanpa perubahan jenis tanah — cek lampiran sertifikat/denah objek.', level:'warn', rows:[]});
      } else {
        issues.push({key:'luas-jenis', text:'Luas & jenis tanah berubah '+lLama+' m² → '+lBaru+' m² — pastikan sesuai pengukuran BPN dan lampiran.', level:'info', rows:[]});
      }
    }

    // NIK: filler lama = NOP → koreksi; baru masih = NOP → warn; berubah + nama sama → koreksi data OK
    const digNop = digitsOnly(d.nop), digNikLama = digitsOnly(ex.nik_wp), digNikBaru = digitsOnly(d.nik);
    if(digNop && digNikLama && digNikLama === digNop && digNikLama.length >= 17){
      issues.push({key:'nik-filler', text:'NIK lama = NOP PBB ('+ex.nik_wp+') — ini data filler. Perubahan NIK = koreksi; sah bila nama konsisten dengan KTP/KK.', level:'info', rows:[]});
      if(digNikBaru === digNop || !digNikBaru){
        issues.push({key:'nik-masih-filler', text:'NIK baru/input MASIH sama dengan NOP ('+(d.nik||'(kosong)')+') — isian NIK masih filler, perlu dikoreksi.', level:'warn', rows:[]});
      }
    } else if(digNikLama && digNikBaru && digNikLama !== digNikBaru){
      const namaSama = !ex.nama_wp || normText(ex.nama_wp) === normText(d.nama);
      if(namaSama){
        issues.push({key:'nik-change', text:'NIK diubah ('+ex.nik_wp+' → '+d.nik+') dengan nama sama — koreksi data subjek, OK.', level:'info', rows:[]});
      } else {
        issues.push({key:'nik-nama-change', text:'NIK & Nama berubah bersamaan ('+ex.nik_wp+'/'+ex.nama_wp+' → '+d.nik+'/'+d.nama+') — pastikan sesuai KTP/KK dan lampiran.', level:'warn', rows:[]});
      }
    }

    // riwayat: berapa kali CS mengembalikan permohonan
    const rev = (d.riwayat.match(/mengembalikan permohonan/gi)||[]).length;
    if(rev > 0) issues.push({key:'riwayat-revisi', text:'Permohonan pernah dikembalikan/direvisi '+rev+'x oleh CS — baca catatan di panel Riwayat (kanan).', level:'info', rows:[]});

    return issues;
  }
  let _lastN2n01Sig = '';
  function runN2n01Scan(force){
    const data = collectN2n01();
    window.__vh_n2n01 = data;
    const sig = JSON.stringify([data.nik, data.nama, data.alamat, data.luasTanah, data.existing, data.nop, data.kdJenisTanah]);
    if(!force && sig === _lastN2n01Sig) return;
    _lastN2n01Sig = sig;
    const issues = computeN2n01Issues(data);
    const keys = new Set(issues.map(i=>i.key));
    removeStaleToasts(keys);
    issues.forEach(showToast);
  }

  // MutationObserver: skip mutations inside our own UI host
  const obs = new MutationObserver((muts)=>{
    let relevant = false;
    for(const m of muts){
      const t = m.target;
      if(t && (t.id==='vh-toast-host' || t.id==='verif-helper-panel' || t.closest && t.closest('#vh-toast-host,#verif-helper-panel'))) continue;
      relevant = true; break;
    }
    if(relevant) scheduleScan(false);
  });
  obs.observe(document.body, {childList:true, subtree:true});
  // DataTables draw event -> re-scan (paginasi/filter berubah)
  try { if(window.jQuery){ window.jQuery(document).on('draw.dt', ()=>scheduleScan(false)); } } catch(e){}
  // periodik lebih jarang
  _scanInterval = setInterval(()=>scheduleScan(false), 10000);

  setTimeout(()=>{
    ensureToastHost();
    if(isFinalized()){
      const badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;bottom:12px;left:12px;padding:6px 10px;background:#e8f5e9;border:1px solid #43a047;border-radius:6px;font-size:12px;color:#1b5e20;z-index:1040;';
      badge.textContent = 'Mode Audit (permohonan selesai)';
      document.body.appendChild(badge);
    }
    runScan(false);
  }, 800);
})();
