/* ====== Fenêtres ====== */
function openModal(html, cls = '') {
  closeModal();
  const ov = document.createElement('div'); ov.className = 'ov'; ov.id = 'ov';
  ov.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  ov.addEventListener('mousedown', e => { if (e.target === ov) closeModal(); });
  document.body.appendChild(ov); document.body.style.overflow = 'hidden';
  const f = ov.querySelector('input,textarea,select,button.primary'); if (f) setTimeout(() => f.focus(), 30);
  return ov;
}
function closeModal() { const o = $('#ov'); if (o) o.remove(); document.body.style.overflow = ''; stopDictation(); }
const mhead = (t, sub) => `<div class="mhead"><div style="flex:1;min-width:0"><h2>${t}</h2>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><button class="btn ghost sm" data-act="close" aria-label="Fermer">${ic('x')}</button></div>`;
function confirmBox(msg, yes, onYes) {
  const ov = openModal(mhead('Confirmer') + `<div class="mbody"><p style="margin:0">${msg}</p></div><div class="mfoot"><button class="btn" data-act="close">Annuler</button><button class="btn primary" id="yes">${yes}</button></div>`, 'narrow');
  $('#yes', ov).onclick = () => { closeModal(); onYes(); };
}

/* ---------- Profil commercial ---------- */
function modalProfile(first) {
  const p = S.profile;
  const f = (id, l, v, t = 'text', ph = '') => `<div class="field"><label for="p-${id}">${l}</label><input id="p-${id}" type="${t}" value="${esc(v || '')}" placeholder="${ph}"></div>`;
  const ov = openModal(mhead(first ? 'Bienvenue ! Présentez-vous' : 'Mes informations commerciales', 'Ces informations figurent sur les propositions PDF et les mails que vous envoyez à vos clients.') + `<div class="mbody">
    <div class="eyebrow">Vous</div>
    <div class="fgrid">${f('prenom', 'Prénom', p.prenom, 'text', 'Camille')}${f('nom', 'Nom', p.nom, 'text', 'Durand')}${f('fonction', 'Fonction', p.fonction, 'text', "Ingénieure d'affaires")}${f('tel', 'Téléphone', p.tel, 'tel', '06 12 34 56 78')}
      <div class="span2">${f('email', 'Adresse e-mail', p.email, 'email', 'camille.durand@ma-structure.fr')}</div></div>
    <div class="eyebrow" style="margin-top:6px">Votre structure</div>
    <div class="fgrid">${f('structure', 'Nom de votre structure', p.structure, 'text', 'Nom de votre ESN')}${f('site', 'Site web', p.site, 'text', 'www.ma-structure.fr')}<div class="span2">${f('adresse', 'Adresse', p.adresse, 'text', '12 rue de la Paix, 75002 Paris')}</div>
      <div class="field"><label>Logo sur les PDF</label><div class="row"><span class="logo-tile"><img id="p-logo-prev" src="${logoSrc()}" alt=""></span>
        <label class="btn sm" for="p-logo">${ic('up')}Importer mon logo</label><input id="p-logo" type="file" accept="image/png,image/jpeg" hidden>
        ${p.logo && !p.useDefaultLogo ? `<button class="btn sm ghost" id="p-logo-reset">Logo par défaut</button>` : ''}</div></div>
      <div class="field"><label>Couleurs de la structure</label><div class="colorpick"><input type="color" id="p-couleur" value="${esc(p.couleur || '#D7141F')}" aria-label="Couleur principale"><input type="color" id="p-couleur2" value="${esc(p.couleur2 || '#2E3336')}" aria-label="Couleur secondaire"><span class="small muted">principale · secondaire</span></div></div>
      <div class="field"><label for="p-marge">Marge cible par défaut (%)</label><input id="p-marge" type="number" min="0" max="60" value="${p.marge ?? 25}"></div>
      <div class="field span2"><label>Vidéo d'introduction</label><div class="row"><label class="toggle"><input type="checkbox" id="p-intro" ${p.intro !== false ? 'checked' : ''}>Afficher la vidéo au démarrage</label><button class="btn sm" data-act="replay-intro">Revoir la vidéo</button></div></div>
    </div>
    <details style="margin-top:6px" ${p.apiKey ? 'open' : ''}><summary class="eyebrow" style="cursor:pointer">Assistant IA (facultatif)</summary>
      <p class="small muted" style="margin:8px 0">Avec votre clé API Claude, l'outil analyse les besoins et les CV plus finement, rédige les synthèses et des questions d'entretien sur-mesure. Sans clé, l'analyse par mots-clés fonctionne. La clé reste uniquement dans ce navigateur : ne l'enregistrez pas sur un ordinateur partagé.</p>
      <div class="fgrid"><div class="field"><label for="p-apiKey">Clé API Claude</label><input id="p-apiKey" type="password" autocomplete="off" value="${esc(p.apiKey || '')}" placeholder="sk-ant-…"></div>
      <div class="field"><label for="p-apiModel">Modèle</label><input id="p-apiModel" value="${esc(p.apiModel || 'claude-sonnet-4-5')}"><span class="hint">Identifiant de modèle de votre console Anthropic</span></div></div></details>
    <details style="margin-top:2px"><summary class="eyebrow" style="cursor:pointer">Sauvegarde de mes données</summary>
      <p class="small muted" style="margin:8px 0">Vos demandes et CV sont enregistrés dans ce navigateur. Sauvegardez-les régulièrement en fichier, ou pour passer sur un autre ordinateur.</p>
      <div class="row"><button class="btn sm" data-act="backup">${ic('dl')}Sauvegarder (.json)</button><label class="btn sm" for="p-restore">${ic('up')}Restaurer</label><input id="p-restore" type="file" accept=".json,application/json" hidden></div></details>
    </div>
    <div class="mfoot">${first ? '<button class="btn" data-act="close">Plus tard</button>' : '<button class="btn" data-act="close">Annuler</button>'}<button class="btn primary" id="p-save">Enregistrer</button></div>`, 'narrow');
  let newLogo = null, reset = false;
  $('#p-logo', ov).onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    newLogo = await shrinkImage(file, 360); $('#p-logo-prev', ov).src = newLogo; reset = false;
  };
  $('#p-restore', ov).onchange = e => { const f = e.target.files[0]; if (f) importBackup(f).then(closeModal).catch(err => toast('Restauration impossible : ' + err.message)); };
  const rs = $('#p-logo-reset', ov); if (rs) rs.onclick = () => { reset = true; newLogo = null; $('#p-logo-prev', ov).src = LOGO; };
  $('#p-save', ov).onclick = () => {
    for (const k of ['prenom', 'nom', 'fonction', 'tel', 'email', 'structure', 'site', 'adresse', 'couleur', 'couleur2', 'apiKey', 'apiModel']) p[k] = $('#p-' + k, ov).value.trim();
    p.marge = +$('#p-marge', ov).value || 25; p.intro = $('#p-intro', ov).checked;
    if (newLogo) { p.logo = newLogo; p.useDefaultLogo = false; }
    if (reset) { p.useDefaultLogo = true; p.logo = null; }
    p.onboarded = true; saveProfile(); closeModal(); render(); toast('Informations enregistrées');
  };
}
function shrinkImage(file, max) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)); const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
      const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = rej; img.src = url;
  });
}

/* ---------- Nouvelle demande ---------- */
const SRC_TABS = [
  ['mail', 'Mail reçu', 'Collez ici le mail du client (ou glissez un fichier .eml, .txt)…'],
  ['fiche', 'Fiche de poste', 'Importez la fiche de poste (PDF, Word, texte) ou collez son contenu…'],
  ['dictee', 'Dicter', 'Cliquez sur « Dicter » et racontez le besoin comme vous l\'avez compris : client, poste, compétences, budget, dates…'],
  ['notes', "Notes d'appel", "Écrivez ce que vous avez compris suite à l'appel : « Appel avec Claire, besoin DevOps senior AWS, budget 700 €, démarrage janvier… »"]
];
function modalNewDemande() {
  let tab = 'mail';
  const ov = openModal(mhead('Nouvelle demande client', "Importez le besoin sous n'importe quelle forme : l'analyse remplit la fiche pour vous.") + `<div class="mbody">
    <div class="seg" role="tablist" id="src-tabs" style="align-self:start;flex-wrap:wrap">${SRC_TABS.map(([k, l]) => `<button data-k="${k}" aria-pressed="${k === tab}">${l}</button>`).join('')}</div>
    <div class="drop" id="src-drop" tabindex="0">${ic('up').replace('<svg', '<svg style="width:22px;height:22px"')}<div><b>Glissez un fichier ici</b> ou cliquez pour choisir</div><div class="small">PDF, Word (.docx), e-mail (.eml), texte</div><input type="file" id="src-file" accept=".pdf,.docx,.txt,.md,.eml,.html,.htm" hidden></div>
    <div class="row" id="dict-row" hidden><button class="btn" id="dict-btn">${ic('mic')}Dicter</button><span class="small muted" id="dict-msg">Parlez naturellement, le texte s'écrit ci-dessous.</span></div>
    <div class="field"><label for="src-text">Contenu du besoin</label><textarea id="src-text" rows="12" placeholder="${SRC_TABS[0][2]}"></textarea></div>
    <div id="src-note"></div></div>
    <div class="mfoot"><button class="btn" id="src-manual">Saisir manuellement</button><button class="btn primary" id="src-go">${ic('spark')}Analyser le besoin</button></div>`, 'wide');
  const ta = $('#src-text', ov);
  const setTab = k => { tab = k; $$('#src-tabs button', ov).forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k)); ta.placeholder = SRC_TABS.find(t => t[0] === k)[2];
    $('#src-drop', ov).hidden = (k === 'dictee' || k === 'notes'); $('#dict-row', ov).hidden = k !== 'dictee'; if (k !== 'dictee') stopDictation(); };
  $$('#src-tabs button', ov).forEach(b => b.onclick = () => setTab(b.dataset.k));
  wireDrop($('#src-drop', ov), $('#src-file', ov), async files => { const t = await readFileText(files[0]); ta.value = t.trim(); toast('Fichier importé : ' + files[0].name); });
  $('#dict-btn', ov).onclick = () => toggleDictation(ta, $('#dict-btn', ov), $('#dict-msg', ov));
  $('#src-manual', ov).onclick = () => modalDemForm(newDemande({ sourceType: tab, sourceText: ta.value }), true);
  $('#src-go', ov).onclick = async () => {
    const text = ta.value.trim(); if (text.length < 20) { toast('Ajoutez un peu plus de contenu à analyser'); return; }
    const btn = $('#src-go', ov); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Analyse en cours…';
    let parsed, via = 'ia';
    try { parsed = await aiParseBesoin(text); if (!parsed || typeof parsed !== 'object') throw 0; }
    catch (e) { parsed = localParseBesoin(text); via = 'local'; }
    stopDictation();
    modalDemForm(newDemande(Object.assign({ sourceType: tab, sourceText: text }, cleanBesoin(parsed))), true, via);
  };
}
function cleanBesoin(p) {
  const o = {};
  for (const k of ['client', 'contact', 'titre', 'secteur', 'lieu', 'teletravail', 'langues', 'contexte']) if (p[k]) o[k] = String(p[k]);
  for (const k of ['demarrage', 'echeance']) if (p[k] && /^\d{4}-\d{2}-\d{2}/.test(p[k])) o[k] = p[k].slice(0, 10);
  for (const k of ['duree', 'budgetTJM', 'xpMin']) if (p[k] != null && !isNaN(+p[k]) && +p[k] > 0) o[k] = +p[k];
  if (p.seniorite) o.seniorite = levelById(p.seniorite).id;
  if (Array.isArray(p.competences)) o.competences = p.competences.filter(k => k && k.nom).map(k => ({ nom: String(k.nom), obligatoire: !!k.obligatoire, poids: clamp(+k.poids || (k.obligatoire ? 3 : 1), 1, 3) }));
  return o;
}
function newDemande(o) {
  return Object.assign({ id: uid('dem'), createdAt: new Date().toISOString().slice(0, 10), statut: 'qualif', client: '', titre: '', secteur: '', lieu: '', teletravail: '', demarrage: '', duree: null,
    budgetTJM: null, seniorite: 'confirme', xpMin: null, echeance: '', competences: [], langues: '', contexte: '', marge: S.profile.marge ?? 25,
    poids: { competences: 40, experience: 25, secteur: 15, cout: 20 }, candidats: [] }, o);
}
function modalDemForm(d, isNew, via) {
  const f = (id, l, v, t = 'text', extra = '') => `<div class="field"><label for="d-${id}">${l}</label><input id="d-${id}" type="${t}" value="${esc(v ?? '')}" ${extra}></div>`;
  const ov = openModal(mhead(isNew ? 'Vérifiez la fiche du besoin' : 'Modifier la demande', isNew ? 'Corrigez ou complétez avant de créer la demande.' : esc(d.client)) + `<div class="mbody">
    ${via === 'ia' ? `<div class="ai-note">${ic('spark')}Fiche pré-remplie par l'IA à partir de votre texte. Vérifiez les champs.</div>` : via === 'local' ? `<div class="ai-note">${ic('info')}Analyse automatique par mots-clés. Vérifiez attentivement les champs (ajoutez une clé API Claude dans « Mes informations » pour une analyse plus fine).</div>` : ''}
    <div class="fgrid three">${f('client', 'Client', d.client)}${f('contact', 'Interlocuteur', d.contact)}${f('secteur', "Secteur d'activité", d.secteur, 'text', 'list="sect-list"')}
      <div class="span2">${f('titre', 'Intitulé du poste', d.titre)}</div>
      <div class="field"><label for="d-seniorite">Séniorité</label><select id="d-seniorite">${Object.entries(SEN).map(([k, v]) => `<option value="${k}" ${d.seniorite === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      ${f('budgetTJM', 'TJM max client (€ HT)', d.budgetTJM, 'number', 'min="0" step="5"')}${f('xpMin', "Années d'expérience min.", d.xpMin, 'number', 'min="0"')}${f('duree', 'Durée (jours)', d.duree, 'number', 'min="0"')}
      ${f('demarrage', 'Démarrage', d.demarrage, 'date')}${f('echeance', 'Réponse attendue avant', d.echeance, 'date')}${f('lieu', 'Lieu', d.lieu)}
      ${f('teletravail', 'Télétravail', d.teletravail)}<div class="span2">${f('langues', 'Langues', d.langues)}</div>
      <div class="field span3"><label for="d-contexte">Contexte et enjeux</label><textarea id="d-contexte" rows="3">${esc(d.contexte || '')}</textarea></div></div>
    <datalist id="sect-list">${SECTORS.map(s => `<option value="${s[0]}">`).join('')}</datalist>
    <div><div class="row" style="justify-content:space-between"><div class="eyebrow">Compétences recherchées</div><button class="btn sm" id="sk-add">${ic('plus')}Ajouter</button></div>
      <div class="skedit" id="sk-list" style="margin-top:8px"></div></div></div>
    <div class="mfoot">${!isNew ? `<button class="btn ghost" id="d-del" style="margin-right:auto;color:var(--crit)">${ic('trash')}Supprimer</button>` : ''}<button class="btn" data-act="close">Annuler</button><button class="btn primary" id="d-save">${isNew ? 'Créer la demande' : 'Enregistrer'}</button></div>`, 'wide');
  const skills = (d.competences || []).map(k => ({ ...k }));
  const drawSk = () => {
    $('#sk-list', ov).innerHTML = skills.map((k, i) => `<div class="r"><input value="${esc(k.nom)}" data-i="${i}" data-f="nom" aria-label="Compétence"><label class="toggle"><input type="checkbox" data-i="${i}" data-f="obligatoire" ${k.obligatoire ? 'checked' : ''}>Obligatoire</label>
      <select data-i="${i}" data-f="poids" aria-label="Importance"><option value="1" ${k.poids == 1 ? 'selected' : ''}>Bonus</option><option value="2" ${k.poids == 2 ? 'selected' : ''}>Important</option><option value="3" ${k.poids == 3 ? 'selected' : ''}>Cœur</option></select>
      <button class="btn ghost sm" data-rm="${i}" aria-label="Retirer">${ic('x')}</button></div>`).join('') || '<p class="small muted" style="margin:0">Aucune compétence : ajoutez-en au moins 3 pour un scoring pertinent.</p>';
  };
  drawSk();
  $('#sk-list', ov).addEventListener('input', e => { const i = e.target.dataset.i; if (i == null) return; const fld = e.target.dataset.f; skills[i][fld] = fld === 'obligatoire' ? e.target.checked : fld === 'poids' ? +e.target.value : e.target.value; });
  $('#sk-list', ov).addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { skills.splice(+b.dataset.rm, 1); drawSk(); } });
  $('#sk-add', ov).onclick = () => { skills.push({ nom: '', obligatoire: false, poids: 1 }); drawSk(); const ins = $$('#sk-list input[data-f=nom]', ov); ins.at(-1).focus(); };
  const del = $('#d-del', ov); if (del) del.onclick = () => confirmBox(`Supprimer la demande « ${esc(d.titre)} » et ses ${d.candidats.length} profil(s) ?`, 'Supprimer', () => { deleteDemande(d); U.view = 'dash'; render(); toast('Demande supprimée'); });
  $('#d-save', ov).onclick = () => {
    for (const k of ['client', 'contact', 'secteur', 'titre', 'lieu', 'teletravail', 'langues', 'demarrage', 'echeance']) d[k] = $('#d-' + k, ov).value.trim();
    d.contexte = $('#d-contexte', ov).value.trim(); d.seniorite = $('#d-seniorite', ov).value;
    for (const k of ['budgetTJM', 'xpMin', 'duree']) { const v = $('#d-' + k, ov).value; d[k] = v === '' ? null : +v; }
    d.competences = skills.filter(k => k.nom.trim()).map(k => ({ ...k, nom: k.nom.trim() }));
    if (!d.titre) { toast("Indiquez l'intitulé du poste"); return; }
    if (isNew) { S.demandes.unshift(d); U.candId = null; }
    saveDemande(d); closeModal(); U.view = 'dem'; U.demId = d.id; render(); toast(isNew ? 'Demande créée' : 'Demande mise à jour');
  };
}
function modalSource(d) {
  openModal(mhead('Source du besoin', { mail: 'Mail reçu', fiche: 'Fiche de poste', dictee: 'Dictée', notes: "Notes d'appel" }[d.sourceType] || '') + `<div class="mbody"><div class="srcbox">${esc(d.sourceText)}</div></div>`, 'wide');
}

/* ---------- Dictée ---------- */
let _rec = null;
function stopDictation() { if (_rec) { try { _rec.stop(); } catch (e) { } _rec = null; } }
function toggleDictation(ta, btn, msg) {
  if (_rec) { stopDictation(); btn.classList.remove('mic-on'); btn.innerHTML = ic('mic') + 'Dicter'; return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const tip = (err) => { msg.innerHTML = (err === 'not-allowed' || err === 'service-not-allowed' ? `Le micro est bloqué : autorisez-le dans la barre d'adresse du navigateur, puis réessayez. ` : `Ce navigateur ne propose pas la dictée intégrée (elle fonctionne avec Chrome, Edge et Safari). `) + `Autre solution : <b>sur Mac</b>, cliquez dans la zone de texte puis appuyez deux fois sur la touche <b>Fn</b> (ou la touche micro) ; <b>sur iPhone</b>, touchez le micro du clavier.`; ta.focus(); btn.classList.remove('mic-on'); btn.innerHTML = ic('mic') + 'Dicter'; _rec = null; };
  if (!SR) return tip();
  try {
    const base = ta.value ? ta.value.trimEnd() + '\n' : '';
    _rec = new SR(); _rec.lang = 'fr-FR'; _rec.continuous = true; _rec.interimResults = true;
    _rec.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; ta.value = base + t; };
    _rec.onerror = (ev) => { if (ev.error !== 'no-speech' && ev.error !== 'aborted') tip(ev.error); }; _rec.onend = () => { if (_rec) { btn.classList.remove('mic-on'); btn.innerHTML = ic('mic') + 'Dicter'; _rec = null; } };
    _rec.start(); btn.classList.add('mic-on'); btn.innerHTML = ic('mic') + 'Arrêter'; msg.textContent = 'Je vous écoute…';
  } catch (e) { tip(); }
}
function wireDrop(zone, input, onFiles) {
  zone.onclick = () => input.click();
  zone.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } };
  input.onchange = () => { if (input.files.length) onFiles([...input.files]).catch(err => toast('Lecture impossible : ' + (err.message || err))); input.value = ''; };
  zone.ondragover = e => { e.preventDefault(); zone.classList.add('on'); };
  zone.ondragleave = () => zone.classList.remove('on');
  zone.ondrop = e => { e.preventDefault(); zone.classList.remove('on'); if (e.dataTransfer.files.length) onFiles([...e.dataTransfer.files]).catch(err => toast('Lecture impossible : ' + (err.message || err))); };
}

/* ---------- Ajout de CV ---------- */
function modalAddCV(d) {
  const items = []; // {name, text, cand, state}
  const ov = openModal(mhead('Ajouter des CV', esc(d.titre)) + `<div class="mbody">
    <div class="drop" id="cv-drop" tabindex="0">${ic('up').replace('<svg', '<svg style="width:22px;height:22px"')}<div><b>Glissez un ou plusieurs CV</b> ou cliquez pour choisir</div><div class="small">PDF, Word (.docx), texte</div><input type="file" id="cv-file" multiple accept=".pdf,.docx,.txt,.md,.html,.htm" hidden></div>
    <div class="field"><label for="cv-text">…ou collez le texte d'un CV</label><textarea id="cv-text" rows="5" placeholder="Copiez-collez le contenu du CV ici"></textarea><div><button class="btn sm" id="cv-paste">${ic('plus')}Ajouter ce texte</button></div></div>
    <div id="cv-items" class="xpedit"></div></div>
    <div class="mfoot"><button class="btn" data-act="close">Annuler</button><button class="btn primary" id="cv-ok" disabled>Ajouter les profils</button></div>`, 'wide');
  const draw = () => {
    $('#cv-items', ov).innerHTML = items.map((it, i) => it.state !== 'ok' ? `<div class="xpbox"><div class="row"><span class="spin"></span><b>${esc(it.name)}</b><span class="muted small">${it.state === 'read' ? 'lecture du fichier…' : 'analyse du CV…'}</span></div></div>` : `
      <div class="xpbox"><div class="row" style="justify-content:space-between"><div><b>${esc(it.cand.prenom)} ${esc(it.cand.nom)}</b> <span class="muted small">· ${esc(it.cand.titre || '')} · ${it.cand.experiences.length} expérience(s) · ${it.via === 'ia' ? 'analysé par IA' : 'analyse par mots-clés'}</span></div><button class="btn ghost sm" data-rmi="${i}" aria-label="Retirer">${ic('x')}</button></div>
        <div class="fgrid three"><div class="field"><label>Statut</label><select data-i="${i}" data-f="statut"><option value="freelance" ${it.cand.statut === 'freelance' ? 'selected' : ''}>Freelance</option><option value="salarie" ${it.cand.statut !== 'freelance' ? 'selected' : ''}>Salarié</option></select></div>
          <div class="field"><label>${it.cand.statut === 'freelance' ? 'TJM du freelance = votre CJM (€)' : 'CJM (€)'}</label><input type="number" data-i="${i}" data-f="cout" value="${it.cand.cout || ''}" placeholder="obligatoire"></div>
          <div class="field"><label>Disponibilité</label><input type="date" data-i="${i}" data-f="dispo" value="${it.cand.dispo || ''}"></div></div></div>`).join('');
    $('#cv-ok', ov).disabled = !items.length || items.some(it => it.state !== 'ok');
  };
  const process = async (name, text) => {
    const it = { name, state: 'parse' }; items.push(it); draw();
    try { const p = await aiParseCV(text); it.cand = cleanCand(p); it.via = 'ia'; if (!it.cand.experiences.length) throw 0; }
    catch (e) { it.cand = cleanCand(localParseCV(text)); it.via = 'local'; }
    it.cand.cvText = text; it.state = 'ok'; draw();
  };
  wireDrop($('#cv-drop', ov), $('#cv-file', ov), async files => {
    await Promise.all(files.map(async f => { const t = await readFileText(f); return process(f.name, t); }));
  });
  $('#cv-paste', ov).onclick = () => { const t = $('#cv-text', ov).value.trim(); if (t.length < 40) { toast('Le texte du CV semble trop court'); return; } $('#cv-text', ov).value = ''; process('CV collé', t); };
  $('#cv-items', ov).addEventListener('input', e => { const i = e.target.dataset.i; if (i == null) return; const f = e.target.dataset.f; items[i].cand[f] = f === 'cout' ? +e.target.value || null : e.target.value; if (f === 'statut') draw(); });
  $('#cv-items', ov).addEventListener('click', e => { const b = e.target.closest('[data-rmi]'); if (b) { items.splice(+b.dataset.rmi, 1); draw(); } });
  $('#cv-ok', ov).onclick = () => {
    if (items.some(it => !it.cand.cout)) { toast('Renseignez le coût (TJM ou CJM) de chaque profil'); return; }
    for (const it of items) d.candidats.push(it.cand);
    U.candId = items[0].cand.id; saveDemande(d); closeModal(); renderMain(); toast(items.length + ' profil(s) ajouté(s)');
  };
}
function cleanCand(p) {
  const c = { id: uid('cand'), prenom: String(p.prenom || 'Candidat'), nom: String(p.nom || ''), titre: String(p.titre || ''), statut: /free|ind/i.test(p.statut || '') ? 'freelance' : 'salarie',
    cout: +p.cout || null, salaire: +p.salaire || null, dispo: /^\d{4}-\d{2}-\d{2}/.test(p.dispo || '') ? p.dispo.slice(0, 10) : '', ville: String(p.ville || ''), email: String(p.email || ''), tel: String(p.tel || ''),
    pipeline: 'qualifier', competences: [].concat(p.competences || []).map(String), certifications: [].concat(p.certifications || []).map(String), formation: [].concat(p.formation || []).map(String), langues: [].concat(p.langues || []).map(String) };
  if (c.statut === 'salarie' && !c.cout && c.salaire) c.cout = cjmFromSalary(c.salaire);
  c.experiences = (p.experiences || []).filter(e => e && e.debut).map(e => ({ poste: String(e.poste || ''), entreprise: String(e.entreprise || ''), secteur: String(e.secteur || ''),
    debut: String(e.debut).slice(0, 7), fin: e.fin ? String(e.fin).slice(0, 7) : null, type: String(e.type || 'cdi'), technos: [].concat(e.technos || []).map(String), description: String(e.description || '') }));
  return c;
}

/* ---------- Modifier un candidat ---------- */
function modalCandForm(d, c) {
  const f = (id, l, v, t = 'text') => `<div class="field"><label for="c-${id}">${l}</label><input id="c-${id}" type="${t}" value="${esc(v ?? '')}"></div>`;
  const exps = (c.experiences || []).map(e => ({ ...e, technos: (e.technos || []).slice() }));
  const ov = openModal(mhead('Modifier le profil', esc(c.prenom + ' ' + c.nom)) + `<div class="mbody">
    <div class="fgrid three">${f('prenom', 'Prénom', c.prenom)}${f('nom', 'Nom', c.nom)}${f('titre', 'Titre', c.titre)}${f('ville', 'Ville', c.ville)}${f('email', 'E-mail', c.email, 'email')}${f('tel', 'Téléphone', c.tel)}
      ${f('dispo', 'Disponibilité', c.dispo, 'date')}<div class="span2">${f('competences', 'Autres compétences (séparées par des virgules)', (c.competences || []).join(', '))}</div>
      <div class="field span3"><label for="c-certifications">Certifications (une par ligne)</label><textarea id="c-certifications" rows="2">${esc((c.certifications || []).join('\n'))}</textarea></div>
      <div class="field"><label for="c-formation">Formation (une par ligne)</label><textarea id="c-formation" rows="2">${esc((c.formation || []).join('\n'))}</textarea></div>
      <div class="field span2"><label for="c-langues">Langues (séparées par des virgules)</label><input id="c-langues" value="${esc((c.langues || []).join(', '))}"></div></div>
    <div><div class="row" style="justify-content:space-between"><div class="eyebrow">Expériences</div><button class="btn sm" id="xp-add">${ic('plus')}Ajouter</button></div><div class="xpedit" id="xp-list" style="margin-top:8px"></div></div></div>
    <div class="mfoot"><button class="btn" data-act="close">Annuler</button><button class="btn primary" id="c-save">Enregistrer</button></div>`, 'wide');
  const draw = () => {
    $('#xp-list', ov).innerHTML = exps.map((e, i) => `<div class="xpbox"><div class="r"><input data-i="${i}" data-f="poste" value="${esc(e.poste)}" placeholder="Poste" aria-label="Poste"><input data-i="${i}" data-f="entreprise" value="${esc(e.entreprise)}" placeholder="Entreprise" aria-label="Entreprise">
      <input data-i="${i}" data-f="secteur" value="${esc(e.secteur)}" placeholder="Secteur" list="sect-list2" aria-label="Secteur"><input data-i="${i}" data-f="debut" type="month" value="${esc(e.debut)}" aria-label="Début"><input data-i="${i}" data-f="fin" type="month" value="${esc(e.fin || '')}" aria-label="Fin (vide = en cours)" title="Laisser vide si en cours"><button class="btn ghost sm" data-rmx="${i}" aria-label="Retirer">${ic('x')}</button>
      <input class="r2" data-i="${i}" data-f="technos" value="${esc(e.technos.join(', '))}" placeholder="Technologies (séparées par des virgules)" aria-label="Technologies">
      <select data-i="${i}" data-f="type" aria-label="Type de contrat">${['cdi', 'freelance', 'alternance', 'stage'].map(t => `<option ${e.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>`).join('') + `<datalist id="sect-list2">${SECTORS.map(s => `<option value="${s[0]}">`).join('')}</datalist>`;
  };
  draw();
  $('#xp-list', ov).addEventListener('input', e => { const i = e.target.dataset.i; if (i == null) return; const fl = e.target.dataset.f; exps[i][fl] = fl === 'technos' ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : fl === 'fin' ? (e.target.value || null) : e.target.value; });
  $('#xp-list', ov).addEventListener('click', e => { const b = e.target.closest('[data-rmx]'); if (b) { exps.splice(+b.dataset.rmx, 1); draw(); } });
  $('#xp-add', ov).onclick = () => { exps.unshift({ poste: '', entreprise: '', secteur: '', debut: '', fin: null, type: 'cdi', technos: [], description: '' }); draw(); };
  $('#c-save', ov).onclick = () => {
    for (const k of ['prenom', 'nom', 'titre', 'ville', 'email', 'tel', 'dispo']) c[k] = $('#c-' + k, ov).value.trim();
    c.competences = $('#c-competences', ov).value.split(',').map(s => s.trim()).filter(Boolean);
    c.langues = $('#c-langues', ov).value.split(',').map(s => s.trim()).filter(Boolean);
    c.certifications = $('#c-certifications', ov).value.split('\n').map(s => s.trim()).filter(Boolean);
    c.formation = $('#c-formation', ov).value.split('\n').map(s => s.trim()).filter(Boolean);
    c.experiences = exps.filter(e => e.debut);
    saveDemande(d); closeModal(); renderMain(); toast('Profil mis à jour');
  };
}

/* ---------- Entretien ---------- */
function modalInterview(d, c) {
  const A = analyse(d, c);
  c.entretien = c.entretien || {};
  if (!c.entretien.questions) { c.entretien.questions = buildLocalInterview(d, c, A); c.entretien.source = 'local'; c.entretien.ratings = c.entretien.ratings || {}; c.entretien.notes = c.entretien.notes || {}; }
  const E = c.entretien;
  const ov = openModal(mhead('Grille d\'entretien · ' + esc(c.prenom + ' ' + c.nom), `${esc(d.titre)} — questions ajustées au niveau ${A.level.label.toLowerCase()} du candidat et aux exigences du client`) + `<div class="mbody">
    <div class="row" style="justify-content:space-between"><div class="row"><span class="chip">${A.level.label} · ${A.effYears.toFixed(1).replace('.', ',')} ans utiles</span><span class="chip">${SEN[d.seniorite] || ''} demandé</span><span class="chip ${E.source === 'ia' ? 'info' : 'ex'}">${E.source === 'ia' ? 'Questions sur-mesure (IA)' : 'Banque de questions'}</span></div>
      <div class="row"><button class="btn sm" id="iv-ai">${ic('spark')}Questions sur-mesure (IA)</button><button class="btn sm" id="iv-copy">${ic('copy')}Copier la grille</button></div></div>
    <div id="iv-score"></div><div id="iv-list" style="display:grid;gap:10px"></div></div>
    <div class="mfoot"><span class="small muted" style="margin-right:auto">Notez chaque réponse de 1 à 5 : la note met à jour la probabilité de placement.</span><button class="btn primary" data-act="close">Terminer</button></div>`, 'wide');
  const drawScore = () => { const s = interviewScore(c); const A2 = analyse(d, c); $('#iv-score', ov).innerHTML = s == null ? '' : `<div class="alert info">${ic('check')}<span>Évaluation : <b>${Math.round(s)}/100</b> sur ${Object.values(E.ratings).filter(v => v > 0).length} réponse(s) notée(s) · probabilité de placement : <b>${Math.round(A2.proba)} %</b></span></div>`; };
  const draw = () => {
    let cat = '';
    $('#iv-list', ov).innerHTML = E.questions.map(q => {
      const h = q.cat !== cat ? `<div class="qcat">${esc(q.cat)}</div>` : ''; cat = q.cat;
      return h + `<div class="qcard"><div class="qhead"><span class="chip ${q.cat === 'Points de vigilance' ? 'warn' : ''}">${esc(q.skill || q.cat)}</span>${q.niveau && q.niveau !== '—' ? `<span class="chip ex">${esc(q.niveau)}</span>` : ''}</div>
        <div class="qtext">${esc(q.q)}</div>${q.why ? `<div class="why">${esc(q.why)}</div>` : ''}
        <div class="pistes"><h5>Pistes de bonne réponse</h5><ul>${(q.pistes || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
        ${(q.alertes || []).length ? `<div class="redflags"><h5>Signaux d'alerte</h5><ul>${q.alertes.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
        <div class="row" style="justify-content:space-between"><div class="rate" role="group" aria-label="Note">${[1, 2, 3, 4, 5].map(n => `<button data-q="${q.id}" data-n="${n}" aria-pressed="${E.ratings[q.id] === n}">${n}</button>`).join('')}</div></div>
        <div class="field"><textarea rows="2" data-note="${q.id}" placeholder="Notes sur la réponse du candidat" aria-label="Notes">${esc(E.notes[q.id] || '')}</textarea></div></div>`;
    }).join('');
    drawScore();
  };
  draw();
  $('#iv-list', ov).addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b) return; const id = b.dataset.q, n = +b.dataset.n; E.ratings[id] = E.ratings[id] === n ? 0 : n;
    $$(`[data-q="${id}"]`, ov).forEach(x => x.setAttribute('aria-pressed', E.ratings[id] === +x.dataset.n)); drawScore(); saveDemande(d); });
  $('#iv-list', ov).addEventListener('input', e => { const id = e.target.dataset.note; if (id) { E.notes[id] = e.target.value; saveDemande(d); } });
  $('#iv-ai', ov).onclick = async () => {
    const b = $('#iv-ai', ov); b.disabled = true; b.innerHTML = '<span class="spin"></span> Génération…';
    try {
      const qs = await aiInterview(d, c, A); if (!Array.isArray(qs) || !qs.length) throw 0;
      E.questions = qs.filter(q => q && q.q).map((q, i) => ({ id: 'ia' + i, cat: String(q.cat || 'Technique'), skill: String(q.skill || ''), niveau: String(q.niveau || ''), q: String(q.q), why: String(q.why || ''), pistes: [].concat(q.pistes || []).map(String), alertes: [].concat(q.alertes || []).map(String) }));
      E.source = 'ia'; E.ratings = {}; E.notes = {}; saveDemande(d); modalInterview(d, c); toast('Questions sur-mesure générées');
    } catch (e) { b.disabled = false; b.innerHTML = ic('spark') + 'Questions sur-mesure (IA)'; toast(e && e.code === 'unavailable' ? "Ajoutez votre clé API Claude dans « Mes informations » pour des questions sur-mesure" : "La génération n'a pas abouti, réessayez dans un instant"); }
  };
  $('#iv-copy', ov).onclick = () => {
    const t = `Entretien – ${c.prenom} ${c.nom} – ${d.titre}\n\n` + E.questions.map((q, i) => `${i + 1}. [${q.cat}] ${q.q}\n   Pistes : ${(q.pistes || []).join(' ; ')}\n   Note : ${E.ratings[q.id] || '-'} /5 ${E.notes[q.id] ? '– ' + E.notes[q.id] : ''}`).join('\n\n');
    copyText(t);
  };
  ov.querySelector('[data-act=close].primary').addEventListener('click', () => { renderMain(); });
}
function copyText(t) {
  navigator.clipboard.writeText(t).then(() => toast('Copié dans le presse-papiers')).catch(() => {
    const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copié dans le presse-papiers'); } catch (e) { toast('Copie impossible : sélectionnez le texte manuellement'); } ta.remove();
  });
}

/* ---------- Mail client ---------- */
function mailText(d, c, A, o) {
  const p = S.profile; const name = o.anon ? `un(e) consultant(e) (réf. ${refCode(c)})` : `${c.prenom} ${c.nom}`;
  const top = A.skills.filter(k => k.score >= 0.6).map(k => k.nom);
  const civ = (d.contact || '').split(/[–-]/)[0].trim();
  return `Objet : Proposition de profil – ${d.titre}

Bonjour${civ ? ' ' + civ.split(' ')[0] : ''},

Suite à votre demande, j'ai le plaisir de vous proposer ${name}${c.titre ? ' (' + c.titre + ')' : ''}, qui cumule ${Math.round(A.rawYears)} ans d'expérience, dont ${A.effYears.toFixed(1).replace('.', ',')} ans sur des missions directement comparables.

Points forts pour votre besoin :
${top.slice(0, 5).map(t => '• ' + t).join('\n') || '• (à compléter)'}
${A.sectBest && A.s.secteur >= 50 ? `• Expérience récente dans le secteur ${d.secteur || ''}\n` : ''}
Disponibilité : ${c.dispo ? fmtDate(c.dispo) : 'à confirmer'}
Tarif : ${eur(o.tjm)} HT par jour

Vous trouverez son dossier de compétences en pièce jointe. Je reste à votre disposition pour organiser un entretien dans les meilleurs délais.

Bien cordialement,

${[p.prenom + ' ' + p.nom, p.fonction, p.structure, p.tel, p.email].filter(x => x && x.trim()).join('\n')}`;
}
function modalMail(d, c) {
  const A = analyse(d, c);
  const ov = openModal(mhead('Mail de proposition', 'À copier dans votre messagerie, avec le PDF en pièce jointe') + `<div class="mbody">
    <label class="toggle"><input type="checkbox" id="m-anon" checked>Anonymiser le candidat</label>
    <div class="field"><textarea id="m-text" rows="20" aria-label="Texte du mail"></textarea></div></div>
    <div class="mfoot"><button class="btn" data-act="close">Fermer</button><button class="btn primary" id="m-copy">${ic('copy')}Copier le mail</button></div>`);
  const upd = () => $('#m-text', ov).value = mailText(d, c, A, { anon: $('#m-anon', ov).checked, tjm: A.tjm });
  upd(); $('#m-anon', ov).onchange = upd;
  $('#m-copy', ov).onclick = () => copyText($('#m-text', ov).value);
}
