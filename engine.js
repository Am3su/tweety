/* ====== Moteur : dates, récence, scoring, marge ====== */
const NOW = new Date();
const NOW_M = NOW.getFullYear() * 12 + NOW.getMonth();

function ym(s) { // 'YYYY-MM' -> index de mois
  if (!s) return NOW_M;
  const m = String(s).match(/^(\d{4})-(\d{1,2})/);
  if (!m) { const y = String(s).match(/(\d{4})/); return y ? (+y[1]) * 12 : NOW_M; }
  return (+m[1]) * 12 + (+m[2] - 1);
}
function monthsOf(e) { return Math.max(1, ym(e.fin) - ym(e.debut) + 1); }
function yearsLabel(months) {
  const y = Math.floor(months / 12), m = months % 12;
  if (y === 0) return m + ' mois';
  return y + ' an' + (y > 1 ? 's' : '') + (m ? ' ' + m + ' m' : '');
}
function fmtYM(s) {
  if (!s) return "auj.";
  const i = ym(s); const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return mois[i % 12] + ' ' + Math.floor(i / 12);
}
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s); if (isNaN(d)) return s;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
const eur = n => (n == null || isNaN(n)) ? '—' : Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' €';
const pct = n => (n == null || isNaN(n)) ? '—' : Math.round(n) + ' %';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* Poids de récence d'un mois d'expérience selon son âge (années).
   0-3 ans : 100 % · 3-10 ans : décroît jusqu'à ~50 % · au-delà : jusqu'à 20 %. */
function recencyWeight(ageYears) {
  if (ageYears <= 3) return 1;
  if (ageYears <= 10) return 1 - (ageYears - 3) * 0.07;
  return Math.max(0.2, 0.51 - (ageYears - 10) * 0.04);
}
function weightedMonths(e, factor) {
  const a = ym(e.debut), b = Math.min(ym(e.fin), NOW_M);
  let s = 0;
  for (let m = a; m <= b; m++) s += recencyWeight((NOW_M - m) / 12);
  return s * (factor == null ? 1 : factor);
}
function typeFactor(e) { return /altern|stage|apprenti/i.test(e.type || e.poste || '') ? 0.5 : 1; }

/* ---- Normalisation des compétences ---- */
const SYN = {
  'k8s': 'kubernetes', 'eks': 'kubernetes', 'aks': 'kubernetes', 'gke': 'kubernetes', 'openshift': 'kubernetes', 'k3s': 'kubernetes',
  'amazon web services': 'aws', 'ec2': 'aws', 's3': 'aws', 'ecs': 'aws',
  'gitlab': 'gitlab ci', 'gitlab-ci': 'gitlab ci', 'gitlabci': 'gitlab ci', 'ci/cd': 'ci/cd', 'cicd': 'ci/cd',
  'prometheus/grafana': 'prometheus', 'grafana': 'prometheus', 'observabilite': 'prometheus', 'supervision': 'prometheus',
  'secops': 'devsecops', 'securite': 'devsecops', 'vault': 'devsecops',
  'google cloud': 'gcp', 'microsoft azure': 'azure', 'js': 'javascript', 'node': 'node.js', 'nodejs': 'node.js',
  'postgres': 'postgresql', 'reactjs': 'react', 'react.js': 'react', 'golang': 'go'
};
const CI_TOOLS = ['gitlab ci', 'jenkins', 'github actions', 'azure devops', 'circleci', 'argocd', 'tekton'];
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}
function canon(s) { const n = norm(s); return SYN[n] || n; }
function skillMatches(reqName, tech) {
  const r = canon(reqName), t = canon(tech);
  if (r === t) return 1;
  if (r === 'ci/cd' && CI_TOOLS.includes(t)) return 1;
  if (r === 'gitlab ci' && CI_TOOLS.includes(t)) return 0.6; // outil CI voisin
  if (r === 'prometheus' && /grafana|loki|datadog|elk|dynatrace/.test(t)) return 0.8;
  if (r.length > 3 && (t.includes(r) || r.includes(t) && t.length > 3)) return 0.9;
  return 0;
}

/* ---- Secteurs ---- */
const SECTOR_FAMILIES = [
  ['banque', 'finance', 'paiement', 'fintech', 'assurance', 'bourse', 'credit', 'neobanque', 'mutuelle'],
  ['sante', 'pharma', 'hopital', 'clinique', 'medical', 'biotech', 'recherche'],
  ['retail', 'e-commerce', 'ecommerce', 'distribution', 'commerce', 'luxe'],
  ['industrie', 'energie', 'automobile', 'aeronautique', 'transport', 'logistique'],
  ['public', 'administration', 'collectivite', 'defense', 'ministere', 'etat'],
  ['telecom', 'operateur', 'media', 'hebergement', 'cloud', 'agence', 'digital', 'esn', 'editeur', 'saas']
];
function sectorMatch(a, b) {
  const x = norm(a), y = norm(b);
  if (!x || !y) return 0;
  const tok = s => s.split(/[^a-z0-9-]+/).filter(w => w.length > 2);
  const tx = tok(x), tyy = tok(y);
  if (tx.some(w => tyy.includes(w))) return 1;
  const fam = s => SECTOR_FAMILIES.findIndex(f => f.some(k => s.includes(k)));
  const fx = fam(x), fy = fam(y);
  if (fx >= 0 && fx === fy) {
    // banque ↔ assurance : proche mais pas identique
    return 0.75;
  }
  return 0;
}

/* ---- Niveaux ---- */
const LEVELS = [
  { id: 'junior', label: 'Junior', min: 0, ref: 450 },
  { id: 'confirme', label: 'Confirmé', min: 3, ref: 570 },
  { id: 'senior', label: 'Senior', min: 6, ref: 680 },
  { id: 'expert', label: 'Expert', min: 10, ref: 820 }
];
function levelFromYears(y) { let l = LEVELS[0]; for (const L of LEVELS) if (y >= L.min) l = L; return l; }
function levelById(id) { return LEVELS.find(l => l.id === norm(id).replace('é', 'e')) || LEVELS.find(l => norm(id).startsWith(l.id.slice(0, 4))) || LEVELS[1]; }

/* ---- Analyse d'un candidat vs une demande ---- */
function analyse(dem, c, tjmOverride) {
  const exps = (c.experiences || []).slice().sort((a, b) => ym(b.debut) - ym(a.debut));
  // Durée brute (intervalles fusionnés)
  const iv = exps.map(e => [ym(e.debut), Math.min(ym(e.fin), NOW_M)]).sort((a, b) => a[0] - b[0]);
  let raw = 0, cur = null;
  for (const [a, b] of iv) { if (!cur || a > cur[1] + 1) { if (cur) raw += cur[1] - cur[0] + 1; cur = [a, b]; } else cur[1] = Math.max(cur[1], b); }
  if (cur) raw += cur[1] - cur[0] + 1;
  const req = dem.competences || [];
  // Pertinence d'une expérience : partage au moins une compétence demandée
  const relevance = e => {
    const hits = req.filter(r => (e.technos || []).some(t => skillMatches(r.nom, t) > 0)).length;
    return hits > 0 ? 1 : 0.5;
  };
  let effMonths = 0;
  for (const e of exps) effMonths += weightedMonths(e, typeFactor(e) * relevance(e));
  const effYears = effMonths / 12;
  const rawYears = raw / 12;
  const level = levelFromYears(effYears);
  const xpMin = +dem.xpMin || levelById(dem.seniorite).min || 3;

  // Compétences
  const skills = req.map(r => {
    let months = 0, wmonths = 0, last = null;
    for (const e of exps) {
      const m = Math.max(0, ...(e.technos || []).map(t => skillMatches(r.nom, t)));
      if (m > 0) {
        months += monthsOf(e) * m; wmonths += weightedMonths(e, m * typeFactor(e));
        const end = Math.min(ym(e.fin), NOW_M); if (last == null || end > last) last = end;
      }
    }
    const declared = (c.competences || []).some(t => skillMatches(r.nom, t) > 0) || (c.certifications || []).some(t => norm(t).includes(canon(r.nom)));
    if (wmonths === 0 && declared) { wmonths = 4; months = 4; }
    const target = r.obligatoire ? Math.max(2, xpMin * 0.6) : 1.5;
    const eff = wmonths / 12;
    let score = clamp(eff / target, 0, 1);
    const ageLast = last == null ? null : (NOW_M - last) / 12;
    if (ageLast != null && ageLast > 5) score *= 0.5; else if (ageLast != null && ageLast > 3) score *= 0.8;
    let etat = 'ok';
    if (eff < 0.15) etat = 'absent';
    else if (ageLast != null && ageLast > 5) etat = 'ancien';
    else if (score < 0.6) etat = 'faible';
    return { ...r, months: Math.round(months), eff, score, lastYear: last == null ? null : Math.floor(last / 12), ageLast, etat, declared };
  });
  const sw = skills.reduce((s, k) => s + (k.poids || 1), 0) || 1;
  let sComp = skills.reduce((s, k) => s + (k.poids || 1) * k.score, 0) / sw;
  const missingMand = skills.filter(k => k.obligatoire && k.score < 0.25).length;
  sComp *= Math.pow(0.85, missingMand);
  if (!skills.length) sComp = 0.6;

  // Expérience
  let sXp = effYears >= xpMin ? 1 : Math.pow(effYears / xpMin, 1.3);
  const overqualified = effYears > xpMin + 9;
  if (overqualified) sXp = 0.85;

  // Secteur (pondéré par la récence de l'expérience sectorielle)
  let sSect = 0.6, sectBest = null;
  if (dem.secteur) {
    sSect = 0;
    for (const e of exps) {
      const m = sectorMatch(dem.secteur, e.secteur || e.entreprise);
      if (m > 0) {
        const age = (NOW_M - Math.min(ym(e.fin), NOW_M)) / 12;
        const v = m * Math.pow(recencyWeight(age + 1), 1.5);
        if (v > sSect) { sSect = v; sectBest = e; }
      }
    }
  }

  // Coût / marge
  const marge = (dem.marge ?? 25) / 100;
  const cout = +c.cout || 0;
  const budget = +dem.budgetTJM || 0;
  const tjmCible = cout ? cout / (1 - marge) : 0;
  const coutMax = budget ? budget * (1 - marge) : 0;
  let sCout = 0.6;
  if (cout && budget) sCout = cout <= coutMax ? 1 : clamp(1 - (cout - coutMax) / (0.3 * coutMax), 0, 1);
  const tjm = tjmOverride ?? (c.tjmPropose || (budget ? Math.min(Math.round(tjmCible / 5) * 5, budget) : Math.round(tjmCible / 5) * 5));

  const w = dem.poids || { competences: 40, experience: 25, secteur: 15, cout: 20 };
  const W = (w.competences + w.experience + w.secteur + w.cout) || 1;
  const global = 100 * (w.competences * sComp + w.experience * sXp + w.secteur * sSect + w.cout * sCout) / W;

  const proba = successProba(dem, c, global, tjm);
  const margeJour = tjm - cout;
  const margePct = tjm ? margeJour / tjm * 100 : 0;

  // Alertes
  const alertes = [];
  skills.filter(k => k.obligatoire && k.etat === 'absent').forEach(k => alertes.push({ t: 'crit', m: `${k.nom} (obligatoire) absent du CV` }));
  skills.filter(k => k.etat === 'ancien').forEach(k => alertes.push({ t: 'warn', m: `${k.nom} : dernière pratique en ${k.lastYear}, compétence à rafraîchir` }));
  skills.filter(k => k.obligatoire && k.etat === 'faible').forEach(k => alertes.push({ t: 'warn', m: `${k.nom} : pratique récente limitée (${k.eff.toFixed(1)} an pondéré)` }));
  if (effYears < xpMin) alertes.push({ t: 'warn', m: `Expérience utile ${effYears.toFixed(1)} ans pour ${xpMin} ans demandés` });
  if (overqualified) alertes.push({ t: 'info', m: `Profil très expérimenté : vérifier la motivation et le coût` });
  if (dem.secteur && sSect < 0.3) alertes.push({ t: 'info', m: `Pas d'expérience récente dans le secteur ${dem.secteur}` });
  if (budget && cout > coutMax) alertes.push({ t: 'warn', m: `Coût ${eur(cout)} > coût max ${eur(coutMax)} pour tenir ${Math.round(marge * 100)} % de marge` });
  if (c.dispo && dem.demarrage) {
    const d = (new Date(c.dispo) - new Date(dem.demarrage)) / 864e5;
    if (d > 0) alertes.push({ t: d > 30 ? 'warn' : 'info', m: `Disponible ${Math.round(d)} jours après le démarrage souhaité` });
  }
  const shorts = exps.filter(e => e.fin && monthsOf(e) < 9 && !/freelance|mission/i.test(e.type || '')).length;
  if (shorts >= 2) alertes.push({ t: 'info', m: `${shorts} expériences de moins de 9 mois : comprendre les raisons` });
  for (let i = 0; i < exps.length - 1; i++) {
    const gap = ym(exps[i].debut) - ym(exps[i + 1].fin) - 1;
    if (gap >= 6) alertes.push({ t: 'info', m: `Période sans expérience de ${gap} mois avant ${fmtYM(exps[i].debut)}` });
  }

  return {
    exps, rawYears, effYears, level, xpMin, skills, missingMand,
    s: { competences: sComp * 100, experience: sXp * 100, secteur: sSect * 100, cout: sCout * 100 },
    sectBest, global, proba, tjm, tjmCible, coutMax, cout, margeJour, margePct, alertes, budget
  };
}

/* Probabilité de placement : adéquation × positionnement prix × dispo × entretien */
function successProba(dem, c, global, tjm) {
  let p = 0.9 / (1 + Math.exp(-(global - 62) / 8));
  const budget = +dem.budgetTJM || 0;
  if (budget && tjm) {
    const r = tjm / budget;
    p *= r <= 1 ? Math.min(1.08, 1 + (1 - r) * 0.5) : Math.exp(-Math.pow((r - 1) / 0.05, 1.3));
  }
  if (c.dispo && dem.demarrage) {
    const d = (new Date(c.dispo) - new Date(dem.demarrage)) / 864e5;
    if (d > 30) p *= 0.72; else if (d > 0) p *= 0.9;
  }
  const r = interviewScore(c);
  if (r != null) p *= 0.7 + (r / 100) * 0.45;
  return clamp(p * 100, 2, 95);
}
function interviewScore(c) {
  const rt = c.entretien && c.entretien.ratings ? Object.values(c.entretien.ratings).filter(v => v > 0) : [];
  if (!rt.length) return null;
  return (rt.reduce((a, b) => a + b, 0) / rt.length - 1) / 4 * 100;
}

/* Simulation : espérance de marge selon le TJM */
function simulate(dem, c) {
  const cout = +c.cout || 0; if (!cout) return null;
  const budget = +dem.budgetTJM || Math.round(cout * 1.45);
  const days = +dem.duree || 200;
  const base = analyse(dem, c);
  const lo = Math.round(cout * 1.02 / 5) * 5, hi = Math.round(Math.max(budget * 1.15, cout * 1.6) / 5) * 5;
  const pts = [];
  for (let t = lo; t <= hi; t += 5) {
    const p = successProba(dem, c, base.global, t) / 100;
    pts.push({ tjm: t, p, esp: p * (t - cout) * days, margePct: (t - cout) / t * 100 });
  }
  const best = pts.reduce((a, b) => b.esp > a.esp ? b : a, pts[0]);
  return { pts, best, lo, hi, cout, budget, days };
}

/* Score de la demande (qualification Go / No Go) */
function demandeScore(dem, analyses) {
  const checks = [
    ['budgetTJM', 'Budget / TJM maximum', 'Quel est le TJM maximum validé côté achats ?'],
    ['demarrage', 'Date de démarrage', 'Quelle est la date de démarrage au plus tôt / au plus tard ?'],
    ['duree', 'Durée de la mission', 'Quelle durée ferme, et quelle perspective de renouvellement ?'],
    ['secteur', "Secteur d'activité", "Dans quel contexte métier le consultant interviendra-t-il ?"],
    ['lieu', 'Lieu / télétravail', 'Quel rythme de présence sur site et de télétravail ?'],
    ['xpMin', "Années d'expérience", "Combien d'années d'expérience minimum sur le poste ?"],
    ['contexte', 'Contexte projet', "Quel est l'enjeu du projet, la taille de l'équipe, la méthode ?"],
    ['echeance', 'Date limite de réponse', 'Pour quand attendez-vous les profils ? Combien de fournisseurs consultés ?']
  ];
  const missing = checks.filter(([k]) => !dem[k]);
  const hasSkills = (dem.competences || []).length >= 3;
  const hasMand = (dem.competences || []).some(k => k.obligatoire);
  let compl = (checks.length - missing.length + (hasSkills ? 1 : 0) + (hasMand ? 1 : 0)) / (checks.length + 2) * 100;
  const qs = missing.map(m => m[2]);
  if (!hasMand) qs.push('Quelles compétences sont réellement éliminatoires (must-have) ?');
  const lvl = levelById(dem.seniorite || (dem.xpMin >= 10 ? 'expert' : dem.xpMin >= 6 ? 'senior' : dem.xpMin >= 3 ? 'confirme' : 'junior'));
  let real = 60;
  if (dem.budgetTJM) { const r = dem.budgetTJM / lvl.ref; real = r >= 1.05 ? 100 : r >= 0.95 ? 85 : r >= 0.85 ? 60 : r >= 0.75 ? 35 : 15; }
  const best = analyses.length ? Math.max(...analyses.map(a => a.global)) : 0;
  const bestP = analyses.length ? Math.max(...analyses.map(a => a.proba)) : 0;
  const total = 0.2 * compl + 0.25 * real + 0.55 * (analyses.length ? best : 40);
  const verdict = total >= 72 ? { k: 'go', l: 'GO' } : total >= 55 ? { k: 'mid', l: 'À creuser' } : { k: 'nogo', l: 'NO GO' };
  return { compl, real, best, bestP, total, verdict, qs, lvl };
}

/* ---- Utilitaires texte ---- */
function initials(c) { return ((c.prenom || '?')[0] + (c.nom || '?')[0]).toUpperCase(); }
function refCode(c) { let h = 0; for (const ch of (c.id || '') + (c.nom || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return initials(c) + '-' + String(h % 9000 + 1000); }
function uid(p) { return p + '-' + Math.random().toString(36).slice(2, 9); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
function anonEntreprise(e) {
  const s = e.secteur || '';
  const map = [[/banque|finance|neobanque/i, 'Établissement bancaire'], [/paiement|fintech/i, 'Fintech de paiement'], [/assurance/i, "Compagnie d'assurance"],
  [/sant|hôp|hop/i, 'Groupe de santé'], [/retail|commerce|distrib/i, 'Acteur de la distribution'], [/industr/i, 'Groupe industriel'],
  [/h[ée]bergement|cloud/i, 'Hébergeur cloud'], [/agence|digital/i, 'Agence digitale'], [/esn|services it/i, 'ESN'], [/public|administration/i, 'Organisme public'], [/telecom/i, 'Opérateur télécom'], [/energie|énergie/i, "Acteur de l'énergie"]];
  for (const [re, l] of map) if (re.test(s)) return l;
  return s ? 'Entreprise – ' + s : 'Entreprise (confidentiel)';
}

if (typeof module !== 'undefined') module.exports = { analyse, simulate, demandeScore, successProba, recencyWeight, ym, levelFromYears };
