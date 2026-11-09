/* ====== Export PDF aux couleurs de la structure ====== */
function hexRgb(h) { const m = String(h || '#D7141F').replace('#', '').match(/.{2}/g) || ['d7', '14', '1f']; return m.map(x => parseInt(x, 16)); }
function mixWhite(rgb, t) { return rgb.map(v => Math.round(v + (255 - v) * t)); }
function pdfSafe(s) {
  return String(s ?? '').replace(/[   ]/g, ' ').replace(/[→⇒]/g, '>').replace(/[★✓✔]/g, '').replace(/≈/g, '~').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/[^\x00-\xFF€–—•'"]/g, '');
}

function modalExport(d, c) {
  const A = analyse(d, c); const p = S.profile;
  const o = { anon: true, anonEnt: true, score: true, client: true, tjm: A.tjm, synth: localSynthese(d, c, A, true) };
  const ov = openModal(mhead('Exporter la proposition PDF', 'Dossier de compétences aux couleurs de ' + esc(p.structure || 'votre structure')) + `<div class="mbody">
    ${!p.structure || !p.email ? `<div class="alert warn">${ic('alert')}<span>Vos informations commerciales sont incomplètes. <button class="btn sm" data-act="profile">Compléter</button></span></div>` : ''}
    <div class="two"><div style="display:grid;gap:12px">
      <div class="field"><label for="x-tjm">TJM proposé au client (€ HT / jour)</label><input id="x-tjm" type="number" step="5" value="${o.tjm}"><span class="hint" id="x-mg"></span></div>
      <label class="toggle"><input type="checkbox" id="x-anon" checked>Anonymiser le candidat (initiales et référence, sans coordonnées)</label>
      <label class="toggle"><input type="checkbox" id="x-anonEnt" checked>Masquer les noms des anciens employeurs</label>
      <label class="toggle"><input type="checkbox" id="x-score" checked>Afficher l'adéquation au besoin</label>
      <label class="toggle"><input type="checkbox" id="x-client" checked>Mentionner le nom du client</label>
    </div>
    <div><div class="eyebrow" style="margin-bottom:6px">Aperçu de l'en-tête</div><div class="pdf-prev" id="x-prev"></div></div></div>
    <div class="field"><div class="row" style="justify-content:space-between"><label for="x-synth">Synthèse du profil</label><button class="btn sm" id="x-ai">${ic('spark')}Rédiger avec l'IA</button></div><textarea id="x-synth" rows="5">${esc(o.synth)}</textarea></div>
    <div id="x-msg"></div></div>
    <div class="mfoot"><button class="btn" data-act="close">Annuler</button><button class="btn primary" id="x-go">${ic('dl')}Télécharger le PDF</button></div>`, 'wide');
  const prev = () => {
    const col = p.couleur || '#D7141F';
    o.tjm = +$('#x-tjm', ov).value || A.tjm; const mg = o.tjm - A.cout;
    $('#x-mg', ov).innerHTML = `Coût ${eur(A.cout)} · marge ${eur(mg)}/j soit <b>${o.tjm ? (mg / o.tjm * 100).toFixed(1).replace('.', ',') : 0} %</b>${d.budgetTJM ? ' · budget client ' + eur(d.budgetTJM) : ''}`;
    $('#x-prev', ov).innerHTML = `<div class="ph" style="background:${esc(col)}"><img src="${logoSrc()}" alt=""><div><b>${esc(p.structure || 'Votre structure')}</b><div style="font-size:11px;opacity:.85">Dossier de compétences</div></div></div>
      <div style="padding:10px 14px;font-size:12px"><div style="color:#868C90;font-size:10px;letter-spacing:.08em;text-transform:uppercase">Proposition${$('#x-client', ov).checked && d.client ? ' pour ' + esc(d.client) : ''}</div>
      <b style="color:${esc(p.couleur2 || '#2E3336')}">${esc(d.titre)}</b><div>${$('#x-anon', ov).checked ? 'Consultant(e) réf. ' + refCode(c) : esc(c.prenom + ' ' + c.nom)} · TJM ${eur(o.tjm)} HT</div></div>`;
  };
  prev();
  ov.addEventListener('input', prev); ov.addEventListener('change', prev);
  $('#x-anon', ov).addEventListener('change', () => { $('#x-synth', ov).value = localSynthese(d, c, A, $('#x-anon', ov).checked); });
  $('#x-ai', ov).onclick = async () => {
    const b = $('#x-ai', ov); b.disabled = true; b.innerHTML = '<span class="spin"></span> Rédaction…';
    try { $('#x-synth', ov).value = await aiSynthese(d, c, A, $('#x-anon', ov).checked); } catch (e) { toast(e && e.code === 'unavailable' ? "Ajoutez votre clé API Claude dans « Mes informations »" : 'La rédaction n\'a pas abouti : ' + ((e && e.message) || 'réessayez')); }
    b.disabled = false; b.innerHTML = ic('spark') + "Rédiger avec l'IA";
  };
  $('#x-go', ov).onclick = async () => {
    const b = $('#x-go', ov); b.disabled = true; b.innerHTML = '<span class="spin"></span> Création du PDF…';
    const opts = { anon: $('#x-anon', ov).checked, anonEnt: $('#x-anonEnt', ov).checked, score: $('#x-score', ov).checked, client: $('#x-client', ov).checked, tjm: +$('#x-tjm', ov).value || A.tjm, synth: $('#x-synth', ov).value.trim() };
    try {
      const blob = await buildPDF(d, c, opts);
      const fname = `Proposition_${(opts.anon ? refCode(c) : (c.prenom + '_' + c.nom)).replace(/[^\wÀ-ÿ-]+/g, '_')}_${(d.client || 'client').replace(/[^\wÀ-ÿ-]+/g, '_')}.pdf`;
      c.tjmPropose = opts.tjm; if (c.pipeline === 'qualifier' || c.pipeline === 'shortlist') c.pipeline = 'propose'; saveDemande(d);
      downloadBlob(blob, fname); closeModal(); renderMain(); toast('PDF téléchargé');
    } catch (e) {
      b.disabled = false; b.innerHTML = ic('dl') + 'Télécharger le PDF';
      $('#x-msg', ov).innerHTML = `<div class="alert ${e && e.code === 'declined' ? 'info' : 'crit'}">${ic('alert')}<span>Le PDF n'a pas pu être créé${e && e.message ? ' : ' + esc(e.message) : ''}.</span></div>`;
    }
  };
}

async function buildPDF(d, c, o) {
  await loadLib('jspdf');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const p = S.profile; const A = analyse(d, c, o.tjm);
  const C1 = hexRgb(p.couleur), C2 = hexRgb(p.couleur2 || '#2E3336'), GR = [134, 140, 144], INK = [46, 51, 54], SOFT = mixWhite(C1, 0.92);
  const W = 210, M = 16, CW = W - 2 * M, FOOT = 270;
  let y = 0;
  const T = (s) => pdfSafe(s);
  const font = (st = 'normal', sz = 10, col = INK) => { doc.setFont('helvetica', st); doc.setFontSize(sz); doc.setTextColor(...col); };
  const need = (h) => { if (y + h > FOOT) { doc.addPage(); y = 20; } };
  const section = (title, keep = 16) => { need(keep); y += 4; font('bold', 12, C2); doc.text(T(title.toUpperCase()), M, y); doc.setDrawColor(...C1); doc.setLineWidth(0.8); doc.line(M, y + 2, M + 14, y + 2); y += 8; };
  const para = (txt, x, w, sz = 10, col = INK, st = 'normal', lh = 4.6) => { font(st, sz, col); const lines = doc.splitTextToSize(T(txt), w); for (const l of lines) { need(lh); doc.text(l, x, y); y += lh; } };

  // En-tête
  doc.setFillColor(...C1); doc.rect(0, 0, W, 36, 'F');
  doc.setFillColor(255, 255, 255); doc.roundedRect(M, 7, 22, 22, 2.5, 2.5, 'F');
  try { const src = logoSrc(); const fmt = /^data:image\/png/.test(src) ? 'PNG' : 'JPEG'; doc.addImage(src, fmt, M + 1.2, 8.2, 19.6, 19.6, undefined, 'FAST'); } catch (e) { }
  font('bold', 17, [255, 255, 255]); doc.text(T(p.structure || 'Votre structure'), M + 28, 17);
  font('normal', 10, [255, 255, 255]); doc.text(T('Dossier de compétences'), M + 28, 23.5);
  font('normal', 9, [255, 255, 255]); doc.text(T(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })), W - M, 17, { align: 'right' });
  doc.text(T('Réf. ' + refCode(c)), W - M, 23.5, { align: 'right' });
  y = 48;
  font('bold', 8.5, GR); doc.text(T(('Proposition' + (o.client && d.client ? ' pour ' + d.client : '')).toUpperCase()), M, y); y += 7;
  font('bold', 17, C2); for (const l of doc.splitTextToSize(T(d.titre), CW)) { doc.text(l, M, y); y += 7; }
  y += 1;
  font('bold', 12, INK); doc.text(T(o.anon ? `Consultant(e) réf. ${refCode(c)} (${initials(c)})` : `${c.prenom} ${c.nom}`), M, y);
  font('normal', 10.5, GR); doc.text(T(c.titre || ''), M, y + 5.5); y += 13;

  // Chiffres clés
  const boxes = [['Expérience', `${Math.round(A.rawYears)} ans`, `dont ${A.effYears.toFixed(1).replace('.', ',')} ans récents et utiles`], ['Niveau', A.level.label, (c.certifications || []).length ? (c.certifications.length + ' certification' + (c.certifications.length > 1 ? 's' : '')) : ' '],
    ['Disponibilité', c.dispo ? new Date(c.dispo).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'À confirmer', d.lieu || ' '], ['TJM proposé', eur(o.tjm) + ' HT', d.duree ? `mission de ${d.duree} jours` : 'par jour']];
  const bw = (CW - 9) / 4;
  boxes.forEach(([l, v, s], i) => {
    const x = M + i * (bw + 3); const hl = i === 3;
    doc.setFillColor(...(hl ? C1 : SOFT)); doc.roundedRect(x, y, bw, 22, 2, 2, 'F');
    font('bold', 7.5, hl ? [255, 255, 255] : GR); doc.text(T(l.toUpperCase()), x + 4, y + 6);
    font('bold', 13, hl ? [255, 255, 255] : C2); doc.text(T(v), x + 4, y + 13);
    font('normal', 7.5, hl ? [255, 255, 255] : GR); doc.text(doc.splitTextToSize(T(s), bw - 8)[0] || '', x + 4, y + 18.5);
  });
  y += 30;

  // Synthèse
  if (o.synth) { section('Synthèse'); para(o.synth, M, CW, 10, INK, 'normal', 5); y += 2; }

  // Adéquation
  if (o.score) {
    section('Adéquation au besoin');
    need(12); font('bold', 22, C1); doc.text(Math.round(A.global) + ' %', M, y + 6);
    font('normal', 9, GR); doc.text(doc.splitTextToSize(T("Score calculé sur les compétences demandées, la durée et la fraîcheur de l'expérience et le secteur d'activité. Les expériences récentes comptent davantage que les plus anciennes."), CW - 34), M + 32, y + 1.5);
    y += 13;
    const cols = [M, M + 52, M + 82, M + 112, M + 140];
    need(8); doc.setFillColor(...SOFT); doc.rect(M, y - 4.5, CW, 7, 'F');
    font('bold', 8, C2); ['Compétence', 'Exigence', 'Expérience', 'Dernière pratique', 'Maîtrise'].forEach((h, i) => doc.text(T(h), cols[i] + 2, y));
    y += 6;
    for (const k of A.skills) {
      need(7); font('bold', 9.5, INK); doc.text(T(k.nom), cols[0] + 2, y);
      font('normal', 9, GR); doc.text(k.obligatoire ? 'Obligatoire' : 'Appréciée', cols[1] + 2, y);
      font('normal', 9, INK); doc.text(T(k.months ? yearsLabel(k.months) : '-'), cols[2] + 2, y); doc.text(String(k.lastYear || '-'), cols[3] + 2, y);
      doc.setFillColor(232, 232, 232); doc.roundedRect(cols[4] + 2, y - 2.6, 34, 2.8, 1.4, 1.4, 'F');
      if (k.score > 0.02) { doc.setFillColor(...C1); doc.roundedRect(cols[4] + 2, y - 2.6, Math.max(2.8, 34 * k.score), 2.8, 1.4, 1.4, 'F'); }
      doc.setDrawColor(235, 235, 235); doc.setLineWidth(0.2); doc.line(M, y + 2.5, M + CW, y + 2.5);
      y += 6.5;
    }
    y += 2;
  }

  // Parcours
  section('Parcours professionnel', 50);
  for (const e of A.exps) {
    const x = M + 42, w = CW - 42;
    let desc = e.description || ''; if (o.anonEnt && e.entreprise) desc = desc.split(e.entreprise).join(anonEntreprise(e).toLowerCase());
    font('normal', 9); const nd = desc ? doc.splitTextToSize(T(desc), w).length : 0;
    font('italic', 8.5); const nt = (e.technos || []).length ? doc.splitTextToSize(T('Environnement : ' + e.technos.join(', ')), w).length : 0;
    need(Math.min(90, 11 + nd * 4.3 + nt * 4.1 + 2));
    const y0 = y;
    font('bold', 8.5, C1); doc.text(T(`${fmtYM(e.debut)} - ${e.fin ? fmtYM(e.fin) : "aujourd'hui"}`), M, y);
    font('normal', 8.5, GR); doc.text(T(yearsLabel(monthsOf(e))), M, y + 4.5);
    font('bold', 10.5, INK); doc.text(doc.splitTextToSize(T(e.poste), w)[0], x, y); y += 5;
    font('normal', 9.5, C2); doc.text(T((o.anonEnt ? anonEntreprise(e) : e.entreprise) + (e.secteur && !o.anonEnt ? ' · ' + e.secteur : '')), x, y); y += 5;
    if (desc) para(desc, x, w, 9, INK, 'normal', 4.3);
    if ((e.technos || []).length) { y += 0.5; para('Environnement : ' + e.technos.join(', '), x, w, 8.5, GR, 'italic', 4.1); }
    y = Math.max(y, y0 + 10) + 4;
  }

  // Formation, certifications, langues
  const extra = [['Certifications', c.certifications], ['Formation', c.formation], ['Langues', c.langues]].filter(x => (x[1] || []).length);
  if (extra.length) {
    section('Formation, certifications et langues');
    for (const [l, arr] of extra) { need(6); font('bold', 9.5, C2); doc.text(T(l), M, y); const yy = y; para(arr.join(' · '), M + 42, CW - 42, 9.5); y = Math.max(y, yy + 5) + 1.5; }
  }

  // Pied de page sur chaque page
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C1); doc.setLineWidth(0.6); doc.line(M, 276, W - M, 276);
    font('bold', 8.5, C2); doc.text(T(`Votre contact : ${[p.prenom, p.nom].filter(Boolean).join(' ') || '-'}${p.fonction ? ', ' + p.fonction : ''}`), M, 281);
    font('normal', 8.5, INK); doc.text(T([p.tel, p.email].filter(Boolean).join('  ·  ')), M, 285.5);
    font('normal', 7.5, GR); doc.text(T([p.structure, p.adresse, p.site].filter(Boolean).join('  ·  ')), M, 290);
    doc.text(T(`Document confidentiel · ${i}/${n}`), W - M, 290, { align: 'right' });
  }
  return doc.output('blob');
}
