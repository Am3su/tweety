/* ====== Interface ====== */
const U = { view: 'dash', demId: null, candId: null, tab: 'adequation', mode: 'rank' };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IC = {
  plus: '<path d="M12 5v14M5 12h14"/>', up: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>', dl: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  check: '<path d="m5 12 5 5 9-10"/>', alert: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>', back: '<path d="M15 6l-6 6 6 6"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
const ic = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const DEM_STATUS = { qualif: 'À qualifier', sourcing: 'Sourcing', propose: 'Profils proposés', entretien: 'Entretiens client', gagne: 'Gagné', perdu: 'Perdu' };
const CAND_STATUS = { qualifier: 'À qualifier', shortlist: 'Shortlist', propose: 'Proposé au client', retenu: 'Retenu', ecarte: 'Écarté' };
const SEN = { junior: 'Junior', confirme: 'Confirmé', senior: 'Senior', expert: 'Expert' };
const CAND_COLORS = ['var(--red)', 'var(--ink)', 'var(--info)', 'var(--warn)', 'var(--ok)'];

function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }
function curDem() { return S.demandes.find(d => d.id === U.demId); }
function curCand(d) { return d && (d.candidats || []).find(c => c.id === U.candId); }
function scoreCls(v) { return v >= 75 ? 'ok' : v >= 55 ? 'warn' : 'crit'; }
function ring(v, size = 56) {
  const r = 24, C = 2 * Math.PI * r, col = `var(--${scoreCls(v)})`;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 56 56" style="width:${size}px;height:${size}px"><circle cx="28" cy="28" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="6"/><circle cx="28" cy="28" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C * v / 100} ${C}"/></svg><b>${Math.round(v)}</b></div>`;
}
function logoSrc() { const p = S.profile; return (!p.useDefaultLogo && p.logo) ? p.logo : LOGO; }
function avColor(i) { return ['#D7141F', '#2E3336', '#3D6E99', '#B86E06', '#1D8A57'][i % 5]; }

/* ---------- Barre supérieure ---------- */
function renderTop() {
  const p = S.profile;
  $('#top').innerHTML = `<div class="top-in">
    <button class="brand" data-act="home" aria-label="Accueil"><span class="logo-tile"><img src="${LOGO}" alt=""></span><span class="brand-name">Twee<b>ty</b></span></button>
    <nav class="nav"><button data-act="home" aria-current="${U.view === 'dash'}">Tableau de bord</button></nav>
    <span class="spacer"></span>
    <button class="btn primary" data-act="new-dem">${ic('plus')}<span>Nouvelle demande</span></button>
    <button class="me" data-act="profile" title="Mes informations commerciales"><span class="av" style="background:${esc(p.couleur || '#D7141F')}">${esc((((p.prenom || '')[0] || '') + ((p.nom || '')[0] || '')).toUpperCase() || '?')}</span>
      <span>${esc(p.prenom ? p.prenom + ' ' + (p.nom || '') : 'Mon profil')}<small>${esc(p.structure || 'Ma structure')}</small></span></button>
  </div>`;
}

/* ---------- Tableau de bord ---------- */
function bestOf(d) {
  const as = (d.candidats || []).map(c => ({ c, A: analyse(d, c) }));
  return as.sort((x, y) => y.A.proba - x.A.proba)[0];
}
function renderDash() {
  const p = S.profile;
  const open = S.demandes.filter(d => !['gagne', 'perdu'].includes(d.statut));
  let ca = 0, mg = 0, nb = 0;
  for (const d of S.demandes) { nb += (d.candidats || []).length; }
  for (const d of open) { const b = bestOf(d); if (b) { ca += b.A.tjm * (d.duree || 0); mg += b.A.proba / 100 * b.A.margeJour * (d.duree || 0); } }
  const won = S.demandes.filter(d => d.statut === 'gagne').length;
  const counts = Object.keys(DEM_STATUS).map(k => [k, S.demandes.filter(d => (d.statut || 'qualif') === k).length]);
  $('#app').innerHTML = `<div class="wrap">
    <div class="hello"><div><div class="eyebrow">${esc(p.structure || 'Votre structure')} · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <h1>Bonjour${p.prenom ? ' <em>' + esc(p.prenom) + '</em>' : ''}, ${open.length ? open.length + ' besoin' + (open.length > 1 ? 's' : '') + ' à placer' : 'aucun besoin en cours'}.</h1></div>
      <div class="row"><button class="btn" data-act="reset-example">${ic('file')}Recharger l'exemple</button><button class="btn primary" data-act="new-dem">${ic('plus')}Nouvelle demande</button></div></div>
    <div class="grid-kpi">
      <div class="card kpi"><div class="eyebrow">Demandes en cours</div><div class="v">${open.length}</div><div class="s">${won} gagnée${won > 1 ? 's' : ''} au total</div></div>
      <div class="card kpi"><div class="eyebrow">Profils évalués</div><div class="v">${nb}</div><div class="s">CV analysés et scorés</div></div>
      <div class="card kpi"><div class="eyebrow">CA potentiel</div><div class="v">${eur(ca)}</div><div class="s">meilleur profil × durée</div></div>
      <div class="card kpi"><div class="eyebrow">Marge pondérée</div><div class="v" style="color:var(--red)">${eur(mg)}</div><div class="s">marge × probabilité de placement</div></div>
    </div>
    <div class="row" style="margin-top:18px">${counts.map(([k, n]) => `<span class="chip${n ? '' : ' ex'}">${DEM_STATUS[k]} · ${n}</span>`).join('')}</div>
    <div class="dlist">${S.demandes.length ? S.demandes.map(d => {
      const as = (d.candidats || []).map(c => analyse(d, c));
      const ds = demandeScore(d, as); const b = as.sort((x, y) => y.global - x.global)[0];
      const late = d.echeance && (new Date(d.echeance) - NOW) / 864e5;
      return `<div class="card dcard" data-act="open-dem" data-id="${d.id}" role="button" tabindex="0">
        <div style="min-width:0"><div class="row" style="margin-bottom:4px"><span class="eyebrow">${esc(d.client || 'Client')}</span><span class="chip">${DEM_STATUS[d.statut || 'qualif']}</span>${d.exemple ? '<span class="chip ex">Exemple</span>' : ''}${late != null && late >= 0 && late < 7 ? `<span class="chip red">Réponse avant le ${fmtDate(d.echeance)}</span>` : ''}</div>
          <h3>${esc(d.titre || 'Besoin sans titre')}</h3>
          <div class="small muted">${[d.budgetTJM ? 'TJM max ' + eur(d.budgetTJM) : null, d.demarrage ? 'Démarrage ' + fmtDate(d.demarrage) : null, d.duree ? d.duree + ' j' : null, d.lieu].filter(Boolean).map(esc).join(' · ')}</div></div>
        <div class="hide-m mini"><b>${(d.candidats || []).length}</b>profil${(d.candidats || []).length > 1 ? 's' : ''}</div>
        <div class="hide-m mini"><b>${b ? Math.round(b.proba) + ' %' : '—'}</b>meilleure chance</div>
        <span class="verdict ${ds.verdict.k}">${ds.verdict.l}</span></div>`;
    }).join('') : `<div class="card empty"><p>Aucune demande pour l'instant.</p><button class="btn primary" data-act="new-dem">${ic('plus')}Créer ma première demande</button></div>`}</div>
  </div>`;
}

/* ---------- Vue demande ---------- */
function renderDem() {
  const d = curDem(); if (!d) { U.view = 'dash'; return render(); }
  d.candidats = d.candidats || [];
  if (!U.candId || !curCand(d)) { const b = d.candidats.map(c => ({ c, A: analyse(d, c) })).sort((x, y) => y.A.global - x.A.global)[0]; U.candId = b ? b.c.id : null; }
  $('#app').innerHTML = `<div class="wrap"><div class="row" style="margin-bottom:12px"><button class="btn ghost sm" data-act="home">${ic('back')}Tableau de bord</button></div>
    <div class="dem"><aside class="side" id="side">${sideHTML(d)}</aside><section class="mainc" id="mainc"></section></div></div>`;
  renderMain();
}
function sideHTML(d) {
  const w = d.poids;
  return `<div class="card"><div class="dh"><div class="row"><span class="eyebrow">${esc(d.client || 'Client')}</span>${d.exemple ? '<span class="chip ex">Exemple</span>' : ''}</div>
      <h2>${esc(d.titre || 'Besoin')}</h2>
      <div class="row"><select id="dem-statut" aria-label="Statut de la demande" class="btn sm" style="padding:4px 8px">${Object.entries(DEM_STATUS).map(([k, v]) => `<option value="${k}" ${d.statut === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <button class="btn sm" data-act="edit-dem">${ic('edit')}Modifier</button>${d.sourceText ? `<button class="btn sm" data-act="source">${ic('eye')}Source</button>` : ''}</div></div>
    <div class="facts">
      <div><span>Budget</span><b class="num">${d.budgetTJM ? eur(d.budgetTJM) + ' HT/j' : '—'}</b></div>
      <div><span>Séniorité</span><b>${SEN[d.seniorite] || '—'}${d.xpMin ? ' · ' + d.xpMin + ' ans' : ''}</b></div>
      <div><span>Démarrage</span><b>${fmtDate(d.demarrage)}</b></div>
      <div><span>Durée</span><b>${d.duree ? d.duree + ' jours' : '—'}</b></div>
      <div><span>Lieu</span><b>${esc(d.lieu || '—')}</b></div>
      <div><span>Télétravail</span><b>${esc(d.teletravail || '—')}</b></div>
      <div><span>Secteur</span><b>${esc(d.secteur || '—')}</b></div>
      <div><span>Réponse avant</span><b>${fmtDate(d.echeance)}</b></div>
    </div>
    <div class="skills">${(d.competences || []).map(k => `<span class="chip ${k.obligatoire ? 'must' : ''}" title="${k.obligatoire ? 'Obligatoire' : 'Appréciée'} · poids ${k.poids}">${esc(k.nom)}${k.poids >= 3 ? ' ★' : ''}</span>`).join('')}</div>
    ${d.contexte ? `<p class="ctx">${esc(d.contexte)}</p>` : ''}
  </div>
  <div class="card" id="ds-area"></div>
  <div class="card"><h3>Curseurs de sélection</h3><p class="small muted" style="margin:4px 0 0">Ce qui compte le plus pour ce client. Le classement se met à jour en direct.</p>
    ${[['competences', 'Compétences demandées'], ['experience', "Durée d'expérience"], ['secteur', "Secteur d'activité"], ['cout', 'Coût / marge']].map(([k, l]) => `
      <div class="sl"><div class="top2"><label for="w-${k}">${l}</label><span class="num" id="wv-${k}">${w[k]}</span></div><input type="range" id="w-${k}" data-w="${k}" min="0" max="100" step="5" value="${w[k]}"></div>`).join('')}
    <div class="presets"><button class="btn sm" data-act="preset" data-p="equilibre">Équilibré</button><button class="btn sm" data-act="preset" data-p="expertise">Expertise d'abord</button><button class="btn sm" data-act="preset" data-p="prix">Prix serré</button><button class="btn sm" data-act="preset" data-p="metier">Connaissance métier</button></div>
    <div class="sl" style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line)"><div class="top2"><label for="w-marge">Marge cible</label><span class="num" id="wv-marge">${d.marge} %</span></div><input type="range" id="w-marge" min="5" max="45" step="1" value="${d.marge}">
      <span class="small muted">Coût maximum acceptable : <b class="num" id="coutmax">${d.budgetTJM ? eur(d.budgetTJM * (1 - d.marge / 100)) : '—'}</b> par jour</span></div>
  </div>`;
}
function dsHTML(d, as) {
  const ds = demandeScore(d, as);
  return `<div class="row" style="justify-content:space-between"><h3>Score de la demande</h3><span class="verdict ${ds.verdict.k}">${ds.verdict.l} · ${Math.round(ds.total)}</span></div>
    <div class="mrow"><span>Complétude</span><div class="bar"><i style="width:${ds.compl}%"></i></div><span class="num">${Math.round(ds.compl)}</span></div>
    <div class="mrow"><span>Réalisme budget</span><div class="bar"><i style="width:${ds.real}%"></i></div><span class="num">${Math.round(ds.real)}</span></div>
    <div class="mrow"><span>Vivier de profils</span><div class="bar red"><i style="width:${as.length ? ds.best : 0}%"></i></div><span class="num">${as.length ? Math.round(ds.best) : '—'}</span></div>
    <p class="small muted" style="margin:10px 0 0">Repère marché ${ds.lvl.label.toLowerCase()} : ~${eur(ds.lvl.ref)} HT/j. Chance de placement du meilleur profil : <b>${as.length ? Math.round(ds.bestP) + ' %' : '—'}</b>.</p>
    ${ds.qs.length ? `<div class="eyebrow" style="margin-top:12px">À demander au client</div><ul class="qs">${ds.qs.map(q => `<li>${esc(q)}</li>`).join('')}</ul>` : `<p class="small" style="margin:10px 0 0;color:var(--ok)">${ic('check').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} Besoin complet, prêt à sourcer.</p>`}`;
}
function renderMain(keepDetail) {
  const d = curDem(); const as = d.candidats.map(c => ({ c, A: analyse(d, c) }));
  $('#ds-area').innerHTML = dsHTML(d, as.map(x => x.A));
  const sorted = as.slice().sort((x, y) => y.A.global - x.A.global);
  const main = $('#mainc');
  const head = `<div class="toolbar"><h3>Profils positionnés <span class="muted">(${as.length})</span></h3><div class="row">
      <div class="seg" role="group" aria-label="Affichage"><button data-act="mode" data-m="rank" aria-pressed="${U.mode === 'rank'}">Classement</button><button data-act="mode" data-m="matrix" aria-pressed="${U.mode === 'matrix'}">Matrice</button></div>
      <button class="btn primary" data-act="add-cv">${ic('up')}Ajouter des CV</button></div></div>`;
  let body = '';
  if (!as.length) body = `<div class="card empty"><p>Aucun CV sur cette demande.<br>Importez des CV (PDF, Word, texte) pour obtenir un score et une probabilité de placement.</p><button class="btn primary" data-act="add-cv">${ic('up')}Ajouter des CV</button></div>`;
  else if (U.mode === 'matrix') body = matrixHTML(d, sorted);
  else body = `<div class="clist" id="rank">${rankHTML(d, sorted)}</div>`;
  const existing = keepDetail && $('#detail');
  main.innerHTML = head + body + `<div id="detail-slot"></div>`;
  if (as.length) renderDetail(existing);
}
function rankHTML(d, sorted) {
  return sorted.map(({ c, A }, i) => {
    const pr = A.proba;
    const span = 15 * 12; const segs = A.exps.slice().reverse().map(e => {
      const a = Math.max(ym(e.debut), NOW_M - span), b = Math.min(ym(e.fin), NOW_M); if (b < a) return '';
      return `<i style="width:${(b - a + 1) / span * 100}%;margin-left:0;background:var(--red);opacity:${recencyWeight((NOW_M - (a + b) / 2) / 12).toFixed(2)}"></i>`;
    }).join('');
    const crit = A.alertes.filter(a => a.t === 'crit').length, warn = A.alertes.filter(a => a.t === 'warn').length;
    return `<button class="card ccard" data-act="sel-cand" data-id="${c.id}" aria-selected="${c.id === U.candId}">
      <span class="rank">${i + 1}</span><span class="av" style="background:${avColor(d.candidats.indexOf(c))}">${initials(c)}</span>
      <span style="min-width:0"><span class="cname">${esc(c.prenom)} ${esc(c.nom)}</span> <span class="chip ${c.statut === 'freelance' ? 'info' : ''}" style="margin-left:4px">${c.statut === 'freelance' ? 'Freelance' : 'Salarié'}</span>
        <span class="ctitle" style="display:block">${esc(c.titre || '')} · ${A.level.label} · ${A.effYears.toFixed(1).replace('.', ',')} ans utiles</span>
        <span class="tl-mini" style="margin-top:6px" title="Parcours sur 15 ans (opacité = récence)">${segs}</span></span>
      <span class="hide-m small" style="min-width:0">${crit ? `<span class="chip crit">${crit} bloquant${crit > 1 ? 's' : ''}</span> ` : ''}${warn ? `<span class="chip warn">${warn} vigilance</span>` : ''}${!crit && !warn ? '<span class="chip ok">RAS</span>' : ''}
        <span style="display:block;margin-top:4px" class="muted">${CAND_STATUS[c.pipeline || 'qualifier']}</span></span>
      ${ring(A.global)}
      <span class="mini"><b style="color:var(--${scoreCls(pr + 10)})">${Math.round(pr)} %</b>réussite</span>
      <span class="mini hide-s"><b class="num">${eur(A.tjm)}</b>${eur(A.cout)} → ${Math.round(A.margePct)} %</span>
    </button>`;
  }).join('');
}
function matrixHTML(d, sorted) {
  const cell = (k) => {
    if (k.etat === 'absent') return `<div style="background:var(--crit-soft);color:var(--crit)">absent</div>`;
    const bg = k.etat === 'ancien' ? 'var(--warn-soft)' : `color-mix(in srgb, var(--ok) ${Math.round(12 + k.score * 50)}%, var(--surface))`;
    const fg = k.etat === 'ancien' ? 'var(--warn)' : k.score > 0.7 ? '#fff' : 'var(--ink)';
    return `<div style="background:${bg};color:${fg}"><b>${k.eff.toFixed(1).replace('.', ',')} a</b><br><span style="opacity:.8">${k.lastYear || ''}</span></div>`;
  };
  const axes = [['competences', 'Compétences'], ['experience', 'Expérience'], ['secteur', 'Secteur'], ['cout', 'Coût']];
  return `<div class="card"><div class="two"><div class="radar">${radarSVG(sorted.map(x => x.A), axes, sorted.map(x => CAND_COLORS[d.candidats.indexOf(x.c) % 5]))}
      <div class="legend" style="justify-content:center;margin-top:6px">${sorted.map(x => `<span><i style="background:${CAND_COLORS[d.candidats.indexOf(x.c) % 5]}"></i>${esc(x.c.prenom)} ${esc((x.c.nom || '')[0] || '')}.</span>`).join('')}</div></div>
    <div><h3>Lecture</h3><p class="small muted">Chaque case donne les années de pratique <b>pondérées par la récence</b> et l'année de dernière utilisation. Une expérience de plus de 5 ans est signalée en orange : elle compte, mais moins qu'une expérience récente.</p>
    <div class="legend"><span><i style="background:color-mix(in srgb, var(--ok) 60%, var(--surface))"></i>Maîtrisé et récent</span><span><i style="background:var(--warn-soft)"></i>Ancien (&gt; 5 ans)</span><span><i style="background:var(--crit-soft)"></i>Absent</span></div></div></div>
    <div class="tbl-wrap" style="margin-top:14px"><table class="t mx"><thead><tr><th>Compétence</th>${sorted.map(x => `<th style="text-align:center">${esc(x.c.prenom)}</th>`).join('')}</tr></thead><tbody>
    ${(d.competences || []).map((k, i) => `<tr><td><b>${esc(k.nom)}</b> ${k.obligatoire ? '<span class="chip must">oblig.</span>' : ''}</td>${sorted.map(x => `<td class="c">${cell(x.A.skills[i])}</td>`).join('')}</tr>`).join('')}
    <tr><td><b>Score global</b></td>${sorted.map(x => `<td class="c"><b>${Math.round(x.A.global)}</b></td>`).join('')}</tr>
    <tr><td><b>Réussite estimée</b></td>${sorted.map(x => `<td class="c"><b>${Math.round(x.A.proba)} %</b></td>`).join('')}</tr>
    <tr><td><b>Coût → TJM</b></td>${sorted.map(x => `<td class="c">${eur(x.A.cout)}<br>→ ${eur(x.A.tjm)}</td>`).join('')}</tr>
    </tbody></table></div></div>`;
}
function radarSVG(As, axes, colors) {
  const cx = 170, cy = 150, R = 92, n = axes.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  let g = '';
  for (const lv of [0.25, 0.5, 0.75, 1]) g += `<polygon points="${axes.map((_, i) => pt(i, lv).join(',')).join(' ')}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
  axes.forEach((a, i) => { const [x, y] = pt(i, 1); const [lx, ly] = pt(i, 1.3); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/><text x="${lx}" y="${ly + 4}" text-anchor="middle">${a[1]}</text>`; });
  As.forEach((A, j) => { g += `<polygon points="${axes.map((a, i) => pt(i, Math.max(0.03, A.s[a[0]] / 100)).join(',')).join(' ')}" fill="${colors[j]}" fill-opacity=".12" stroke="${colors[j]}" stroke-width="2"/>`; });
  return `<svg viewBox="0 0 340 300" role="img" aria-label="Comparaison des profils">${g}</svg>`;
}

/* ---------- Détail candidat ---------- */
function renderDetail() {
  const d = curDem(); const c = curCand(d); const slot = $('#detail-slot'); if (!c) { slot.innerHTML = ''; return; }
  const A = analyse(d, c);
  slot.innerHTML = `<div class="card detail" id="detail">
    <div class="dhead"><span class="av" style="width:48px;height:48px;font-size:17px;background:${avColor(d.candidats.indexOf(c))}">${initials(c)}</span>
      <div style="flex:1;min-width:180px"><h2>${esc(c.prenom)} ${esc(c.nom)}</h2><div class="small muted">${esc(c.titre || '')} · ${esc(c.ville || '')} · dispo ${fmtDate(c.dispo)}</div></div>
      <div class="row"><select id="cand-pipe" class="btn sm" aria-label="Statut du candidat">${Object.entries(CAND_STATUS).map(([k, v]) => `<option value="${k}" ${(c.pipeline || 'qualifier') === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="btn dark" data-act="interview">${ic('chat')}Entretien</button><button class="btn primary" data-act="export">${ic('dl')}Exporter PDF</button>
        <button class="btn" data-act="mail">${ic('mail')}Mail client</button><button class="btn ghost sm" data-act="edit-cand" title="Modifier le profil">${ic('edit')}</button><button class="btn ghost sm" data-act="del-cand" title="Retirer ce profil">${ic('trash')}</button></div></div>
    <div class="tabs" role="tablist">${[['adequation', 'Adéquation'], ['parcours', 'Parcours & durée'], ['marge', 'Marge & TJM'], ['cv', 'CV source']].map(([k, l]) => `<button role="tab" data-act="tab" data-t="${k}" aria-selected="${U.tab === k}">${l}</button>`).join('')}</div>
    <div class="dbody" id="tabbody">${tabHTML(d, c, A)}</div></div>`;
}
function tabHTML(d, c, A) {
  if (U.tab === 'parcours') return parcoursHTML(d, c, A);
  if (U.tab === 'marge') return margeHTML(d, c, A);
  if (U.tab === 'cv') return `<div class="row" style="justify-content:space-between"><span class="small muted">Texte extrait du CV importé</span><button class="btn sm" data-act="reparse">${ic('spark')}Ré-analyser ce CV</button></div><div class="srcbox">${esc(c.cvText || 'Aucun texte source.')}</div>`;
  const etat = { ok: ['ok', 'Validé'], faible: ['warn', 'Limité'], ancien: ['warn', 'Ancien'], absent: ['crit', 'Absent'] };
  return `<div class="two"><div>
      <div class="row" style="gap:16px">${ring(A.global, 76)}<div><div class="eyebrow">Score d'adéquation</div><div style="font-family:var(--f-display);font-weight:900;font-size:20px">${A.global >= 75 ? 'Très bon match' : A.global >= 55 ? 'Match partiel' : 'Match faible'}</div>
        <div class="small muted">Probabilité de placement estimée : <b style="color:var(--ink)">${Math.round(A.proba)} %</b> au TJM de ${eur(A.tjm)}</div></div></div>
      ${[['competences', 'Compétences'], ['experience', 'Expérience'], ['secteur', 'Secteur'], ['cout', 'Coût / marge']].map(([k, l]) => `<div class="mrow"><span>${l} <span class="muted small">×${d.poids[k]}</span></span><div class="bar ${k === 'cout' ? 'red' : ''}"><i style="width:${A.s[k]}%"></i></div><span class="num">${Math.round(A.s[k])}</span></div>`).join('')}
    </div><div><h3>Points d'attention</h3><div class="alerts" style="margin-top:8px">${A.alertes.length ? A.alertes.map(a => `<div class="alert ${a.t}">${ic(a.t === 'info' ? 'info' : 'alert')}<span>${esc(a.m)}</span></div>`).join('') : `<div class="alert info">${ic('check')}<span>Aucun écart notable avec la demande.</span></div>`}</div>
      ${interviewScore(c) != null ? `<p class="small" style="margin-top:10px">Évaluation d'entretien : <b>${Math.round(interviewScore(c))}/100</b> (intégrée à la probabilité)</p>` : ''}</div></div>
    <div class="tbl-wrap"><table class="t"><thead><tr><th>Compétence</th><th>Exigence</th><th>Pratique</th><th>Pondérée récence</th><th>Dernière utilisation</th><th>Couverture</th><th>Statut</th></tr></thead><tbody>
    ${A.skills.map(k => `<tr><td><b>${esc(k.nom)}</b></td><td>${k.obligatoire ? '<span class="chip must">Obligatoire</span>' : '<span class="chip">Appréciée</span>'}</td>
      <td class="num">${k.months ? yearsLabel(k.months) : '—'}</td><td class="num">${k.eff.toFixed(1).replace('.', ',')} an</td><td class="num">${k.lastYear || '—'}</td>
      <td style="min-width:90px"><div class="bar"><i style="width:${k.score * 100}%;background:var(--${etat[k.etat][0]})"></i></div></td><td><span class="chip ${etat[k.etat][0]}">${etat[k.etat][1]}</span></td></tr>`).join('')}
    </tbody></table></div>`;
}
function parcoursHTML(d, c, A) {
  const exps = A.exps; if (!exps.length) return '<p class="muted">Aucune expérience renseignée.</p>';
  const start = Math.min(...exps.map(e => ym(e.debut))), span = NOW_M - start + 1;
  const y0 = Math.floor(start / 12), y1 = Math.floor(NOW_M / 12); const step = (y1 - y0) > 12 ? 3 : (y1 - y0) > 6 ? 2 : 1;
  const ticks = []; for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) ticks.push(y);
  const req = d.competences || [];
  return `<div class="row" style="gap:28px">
      <div><div class="eyebrow">Expérience totale</div><div style="font-family:var(--f-display);font-weight:900;font-size:26px">${yearsLabel(Math.round(A.rawYears * 12))}</div></div>
      <div><div class="eyebrow">Expérience utile pondérée</div><div style="font-family:var(--f-display);font-weight:900;font-size:26px;color:var(--red)">${A.effYears.toFixed(1).replace('.', ',')} ans</div></div>
      <div><div class="eyebrow">Niveau estimé</div><div style="font-family:var(--f-display);font-weight:900;font-size:26px">${A.level.label}</div></div>
      <div><div class="eyebrow">Demandé</div><div style="font-family:var(--f-display);font-weight:900;font-size:26px">${A.xpMin} ans</div></div></div>
    <p class="small muted" style="margin:0">En informatique, une expérience compte pleinement pendant 3 ans, puis perd environ 7 % de poids par an (50 % à 10 ans, 20 % au-delà de 15 ans). Les postes sans lien avec les compétences demandées comptent pour moitié, les alternances et stages aussi.</p>
    <div class="tl">${exps.map(e => {
      const a = ym(e.debut), b = Math.min(ym(e.fin), NOW_M);
      const rel = req.some(r => (e.technos || []).some(t => skillMatches(r.nom, t) > 0));
      const w = recencyWeight((NOW_M - (a + b) / 2) / 12);
      return `<div class="tl-row"><div class="lbl"><b title="${esc(e.poste)}">${esc(e.poste)}</b><span class="muted">${esc(e.entreprise)} · ${fmtYM(e.debut)} → ${fmtYM(e.fin)}</span></div>
        <div class="tl-track"><div class="tl-bar" style="left:${(a - start) / span * 100}%;width:${(b - a + 1) / span * 100}%;background:${rel ? 'var(--red)' : 'var(--muted)'};opacity:${Math.max(.25, w).toFixed(2)}" title="${esc(e.secteur || '')} · poids ${Math.round(w * 100)} %">${yearsLabel(monthsOf(e))}</div></div></div>`;
    }).join('')}
      <div class="tl-axis"><span></span><div class="ax">${ticks.map(y => `<span style="left:${(y * 12 - start) / span * 100}%">${y}</span>`).join('')}</div></div></div>
    <div class="legend"><span><i></i>Expérience en lien avec la demande</span><span><i style="background:var(--muted)"></i>Autre expérience</span><span>Opacité = poids de récence</span></div>
    <div class="tbl-wrap"><table class="t"><thead><tr><th>Période</th><th>Durée</th><th>Poste</th><th>Secteur</th><th>Environnement</th><th>Poids</th></tr></thead><tbody>
      ${exps.map(e => { const w = weightedMonths(e) / monthsOf(e); return `<tr><td class="num" style="white-space:nowrap">${fmtYM(e.debut)} – ${fmtYM(e.fin)}</td><td class="num" style="white-space:nowrap">${yearsLabel(monthsOf(e))}</td><td><b>${esc(e.poste)}</b><br><span class="muted small">${esc(e.entreprise)}</span></td><td>${esc(e.secteur || '—')}</td><td class="small">${(e.technos || []).map(esc).join(', ')}</td><td class="num">${Math.round(w * 100)} %</td></tr>`; }).join('')}
    </tbody></table></div>
    ${(c.certifications || []).length ? `<div><div class="eyebrow">Certifications</div><div class="row" style="margin-top:6px">${c.certifications.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div></div>` : ''}`;
}
function margeHTML(d, c, A) {
  const budget = +d.budgetTJM || 0; const lo = Math.round((A.cout || 300) * 0.92 / 5) * 5; const hi = Math.round(Math.max(budget * 1.2, (A.cout || 300) * 1.7) / 5) * 5;
  return `<div class="fgrid three">
      <div class="field"><label for="c-statut">Statut</label><select id="c-statut"><option value="freelance" ${c.statut === 'freelance' ? 'selected' : ''}>Indépendant (freelance)</option><option value="salarie" ${c.statut !== 'freelance' ? 'selected' : ''}>Salarié</option></select></div>
      <div class="field"><label for="c-cout">${c.statut === 'freelance' ? 'Prix du freelance = votre CJM' : 'CJM (coût journalier)'} (€)</label><input id="c-cout" type="number" min="0" step="5" value="${c.cout || ''}"><span class="hint">${c.statut === 'freelance' ? 'Son TJM est votre coût d\'achat.' : 'Coût chargé par jour travaillé.'}</span></div>
      ${c.statut !== 'freelance' ? `<div class="field"><label for="c-sal">Salaire brut annuel (€)</label><div class="row" style="flex-wrap:nowrap"><input id="c-sal" type="number" min="0" step="1000" value="${c.salaire || ''}" style="flex:1"><button class="btn sm" data-act="calc-cjm">Calculer</button></div><span class="hint">CJM ≈ brut × 1,45 ÷ 209 jours</span></div>` : '<div></div>'}
    </div>
    <div class="tjm-slider"><div class="row" style="justify-content:space-between"><label for="tjm" style="font-weight:800">TJM proposé au client</label><span><b class="num" id="tjm-v" style="font-family:var(--f-display);font-size:24px;font-weight:900">${eur(A.tjm)}</b> <span class="muted">HT / jour</span></span></div>
      <input type="range" id="tjm" min="${lo}" max="${hi}" step="5" value="${A.tjm}" aria-describedby="tjm-help">
      <div class="tjm-scale">${[[A.cout, 'Coût'], [A.tjmCible, 'Marge cible'], [budget, 'Budget client']].filter(x => x[0] >= lo && x[0] <= hi).map(([v, l]) => `<span style="left:${(v - lo) / (hi - lo) * 100}%">▲ ${l} ${eur(v)}</span>`).join('')}</div>
      <div class="row" style="margin-top:12px"><button class="btn sm" data-act="tjm-set" data-v="cible">Appliquer la marge cible (${d.marge} %)</button>${budget ? `<button class="btn sm" data-act="tjm-set" data-v="budget">Caler sur le budget</button>` : ''}<button class="btn sm primary" data-act="tjm-set" data-v="optimal">${ic('spark')}TJM optimal</button></div></div>
    <div id="marge-live">${margeLive(d, c, A)}</div>`;
}
function margeLive(d, c, A) {
  const days = +d.duree || 0; const sim = simulate(d, c);
  const over = A.budget && A.tjm > A.budget;
  return `<div class="money">
      <div class="card"><div class="l">Marge / jour</div><div class="v" style="color:${A.margeJour < 0 ? 'var(--crit)' : 'inherit'}">${eur(A.margeJour)}</div></div>
      <div class="card"><div class="l">Taux de marge</div><div class="v" style="color:var(--${A.margePct >= d.marge ? 'ok' : A.margePct >= d.marge - 8 ? 'warn' : 'crit'})">${A.margePct.toFixed(1).replace('.', ',')} %</div></div>
      <div class="card"><div class="l">Marge sur ${days || '?'} j</div><div class="v">${eur(A.margeJour * days)}</div></div>
      <div class="card"><div class="l">Réussite estimée</div><div class="v" style="color:var(--${scoreCls(A.proba + 10)})">${Math.round(A.proba)} %</div></div></div>
    ${over ? `<div class="alert warn">${ic('alert')}<span>Le TJM dépasse le budget du client de ${eur(A.tjm - A.budget)} : les chances chutent fortement.</span></div>` : ''}
    ${A.cout > A.coutMax && A.budget ? `<div class="alert info">${ic('info')}<span>Pour tenir le budget de ${eur(A.budget)}, votre marge maximale sur ce profil est de ${((A.budget - A.cout) / A.budget * 100).toFixed(1).replace('.', ',')} %. À vous d'arbitrer entre marge et chance de placement.</span></div>` : ''}
    ${sim ? `<div class="chart"><div class="row" style="justify-content:space-between"><h3>Simulation : prix ↔ chance ↔ marge</h3><span class="small muted">TJM optimal : <b style="color:var(--ink)">${eur(sim.best.tjm)}</b> · ${Math.round(sim.best.p * 100)} % · espérance ${eur(sim.best.esp)}</span></div>${simSVG(sim, A.tjm)}
      <div class="legend"><span><i style="background:var(--ink)"></i>Probabilité de placement</span><span><i style="background:var(--red);opacity:.5"></i>Espérance de marge (marge × probabilité)</span><span><i style="background:var(--ok)"></i>Optimum</span></div></div>` : ''}`;
}
function simSVG(sim, cur) {
  const W = 640, H = 220, L = 44, Rr = 58, T = 14, B = 30;
  const x = t => L + (t - sim.lo) / (sim.hi - sim.lo) * (W - L - Rr);
  const maxE = Math.max(...sim.pts.map(p => p.esp)) || 1;
  const yP = p => T + (1 - p) * (H - T - B), yE = e => T + (1 - e / maxE) * (H - T - B);
  const lineP = sim.pts.map((p, i) => (i ? 'L' : 'M') + x(p.tjm).toFixed(1) + ',' + yP(p.p).toFixed(1)).join('');
  const areaE = 'M' + x(sim.pts[0].tjm) + ',' + yE(0) + sim.pts.map(p => 'L' + x(p.tjm).toFixed(1) + ',' + yE(p.esp).toFixed(1)).join('') + 'L' + x(sim.pts.at(-1).tjm) + ',' + yE(0) + 'Z';
  let g = '';
  for (const v of [0, .25, .5, .75, 1]) g += `<line x1="${L}" x2="${W - Rr}" y1="${yP(v)}" y2="${yP(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${yP(v) + 4}" text-anchor="end">${v * 100}%</text>`;
  for (const v of [0, .5, 1]) g += `<text x="${W - Rr + 6}" y="${yE(v * maxE) + 4}">${Math.round(v * maxE / 1000)} k€</text>`;
  const step = Math.ceil((sim.hi - sim.lo) / 6 / 50) * 50;
  for (let t = Math.ceil(sim.lo / step) * step; t <= sim.hi; t += step) g += `<text x="${x(t)}" y="${H - 10}" text-anchor="middle">${t} €</text>`;
  g += `<path d="${areaE}" fill="var(--red)" fill-opacity=".14" stroke="var(--red)" stroke-opacity=".6" stroke-width="1.5"/>`;
  g += `<path d="${lineP}" fill="none" stroke="var(--ink)" stroke-width="2.2"/>`;
  if (sim.budget >= sim.lo && sim.budget <= sim.hi) g += `<line x1="${x(sim.budget)}" x2="${x(sim.budget)}" y1="${T}" y2="${H - B}" stroke="var(--ink-2)" stroke-dasharray="4 4"/><text x="${x(sim.budget) + 4}" y="${T + 10}">budget</text>`;
  const cc = Math.max(sim.lo, Math.min(sim.hi, cur));
  g += `<line x1="${x(cc)}" x2="${x(cc)}" y1="${T}" y2="${H - B}" stroke="var(--red)" stroke-width="2"/><text x="${x(cc) - 4}" y="${H - B - 6}" text-anchor="end" style="fill:var(--red);font-weight:700">votre TJM</text>`;
  g += `<circle cx="${x(sim.best.tjm)}" cy="${yE(sim.best.esp)}" r="5.5" fill="var(--ok)" stroke="var(--surface)" stroke-width="2"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Probabilité et espérance de marge selon le TJM">${g}</svg>`;
}
function refreshLive() {
  const d = curDem(); const c = curCand(d); if (!c) return;
  const A = analyse(d, c);
  const lv = $('#marge-live'); if (lv) lv.innerHTML = margeLive(d, c, A);
  const tv = $('#tjm-v'); if (tv) tv.textContent = eur(A.tjm);
  const sorted = d.candidats.map(c => ({ c, A: analyse(d, c) })).sort((x, y) => y.A.global - x.A.global);
  const rk = $('#rank'); if (rk) rk.innerHTML = rankHTML(d, sorted);
  $('#ds-area').innerHTML = dsHTML(d, sorted.map(x => x.A));
}

function render() {
  renderTop();
  if (U.view === 'dem') renderDem(); else renderDash();
}
