/* ====== Stockage dans le navigateur + sauvegarde / restauration en fichier ====== */
const LS_KEY = 'esn-commercial-v1';
const S = { profile: null, demandes: [] };
let _lsWarned = false;

function defaultProfile() {
  return { prenom: '', nom: '', fonction: "Ingénieure d'affaires", email: '', tel: '', structure: '', adresse: '', site: '',
    couleur: '#D7141F', couleur2: '#2E3336', logo: null, useDefaultLogo: true, marge: 25, onboarded: false, intro: true, signature: '', apiKey: '', apiModel: 'claude-sonnet-4-5' };
}
function lsWrite() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ profile: S.profile, demandes: S.demandes, savedAt: new Date().toISOString() })); }
  catch (e) { if (!_lsWarned) { _lsWarned = true; toast('Stockage du navigateur indisponible : pensez à sauvegarder vos données en fichier'); } }
}
function initStore() {
  let l = null; try { const r = localStorage.getItem(LS_KEY); l = r ? JSON.parse(r) : null; } catch (e) { }
  S.profile = Object.assign(defaultProfile(), l && l.profile || {});
  S.demandes = l && Array.isArray(l.demandes) ? l.demandes : [exampleDemande()];
}
let _t; function saveProfile() { clearTimeout(_t); _t = setTimeout(lsWrite, 300); }
function saveDemande() { clearTimeout(_t); _t = setTimeout(lsWrite, 300); }
function deleteDemande(d) { S.demandes = S.demandes.filter(x => x !== d); lsWrite(); }

function downloadBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function exportBackup() {
  const p = Object.assign({}, S.profile, { apiKey: '' }); // la clé API n'est jamais exportée
  const data = JSON.stringify({ format: 'esn-commercial', version: 1, exportedAt: new Date().toISOString(), profile: p, demandes: S.demandes }, null, 1);
  downloadBlob(new Blob([data], { type: 'application/json' }), `sauvegarde-propositions-${new Date().toISOString().slice(0, 10)}.json`);
  toast('Sauvegarde téléchargée');
}
function importBackup(file) {
  return file.text().then(t => {
    const j = JSON.parse(t); if (!j || !Array.isArray(j.demandes)) throw new Error('fichier non reconnu');
    const key = S.profile.apiKey;
    S.profile = Object.assign(defaultProfile(), j.profile || {}, { apiKey: key }); S.demandes = j.demandes;
    lsWrite(); U.view = 'dash'; render(); toast(`${j.demandes.length} demande(s) restaurée(s)`);
  });
}
