/* ====== IA (capability sample) + analyse locale de secours ====== */
/* L'analyse IA utilise votre propre clé API Claude (facultative), saisie dans « Mes informations ».
   Elle reste uniquement dans ce navigateur. Sans clé, l'analyse par mots-clés prend le relais. */
async function getSample() {
  const key = (S.profile && S.profile.apiKey || '').trim();
  if (!key) return null;
  const model = (S.profile.apiModel || 'claude-sonnet-4-5').trim();
  const call = async (prompt, opts = {}) => {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model, max_tokens: opts.max || 4000, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) { let m = ''; try { m = (await r.json()).error.message; } catch (e) { } throw { code: r.status === 401 ? 'bad_key' : 'api_error', message: m || ('Erreur ' + r.status) }; }
    const j = await r.json();
    return { text: (j.content || []).map(b => b.text || '').join('') };
  };
  const sample = (prompt, opts) => call(prompt, opts);
  sample.json = async (prompt, opts) => {
    const { text } = await call(prompt + '\n\nRéponds uniquement avec le JSON demandé, sans texte autour.', opts);
    let t = text.trim(); const f = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) t = f[1];
    const a = Math.min(...['{', '['].map(ch => { const i = t.indexOf(ch); return i < 0 ? 1e9 : i; })); const b = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    return JSON.parse(t.slice(a, b + 1));
  };
  return sample;
}

const TECHS = ['Kubernetes', 'EKS', 'AKS', 'GKE', 'OpenShift', 'Docker', 'Terraform', 'Ansible', 'Puppet', 'Chef', 'Pulumi', 'AWS', 'Azure', 'GCP', 'Scaleway', 'OVH', 'OpenStack', 'VMware',
  'GitLab CI', 'GitLab', 'Jenkins', 'GitHub Actions', 'Azure DevOps', 'ArgoCD', 'Flux', 'Helm', 'Prometheus', 'Grafana', 'Loki', 'ELK', 'Elasticsearch', 'Kibana', 'Datadog', 'Dynatrace', 'Splunk',
  'Vault', 'DevSecOps', 'SonarQube', 'Trivy', 'Linux', 'Windows', 'Bash', 'PowerShell', 'Python', 'Go', 'Java', 'Spring', 'Spring Boot', 'Kotlin', 'Scala', 'C#', '.NET', 'C++', 'PHP', 'Symfony', 'Laravel',
  'Ruby', 'Rust', 'JavaScript', 'TypeScript', 'Node.js', 'React', 'Angular', 'Vue.js', 'Next.js', 'HTML', 'CSS', 'SQL', 'PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Redis', 'Cassandra',
  'Kafka', 'RabbitMQ', 'Spark', 'Hadoop', 'Airflow', 'dbt', 'Snowflake', 'Databricks', 'BigQuery', 'Power BI', 'Tableau', 'Talend', 'SAP', 'Salesforce', 'ServiceNow', 'ITIL', 'Scrum', 'SAFe', 'Jira',
  'Django', 'Flask', 'FastAPI', 'TensorFlow', 'PyTorch', 'MLOps', 'LLM', 'Selenium', 'Cypress', 'iOS', 'Android', 'Swift', 'Flutter', 'Active Directory', 'Cisco', 'Fortinet', 'Palo Alto', 'TCP/IP', 'CI/CD'];
const MONTHS = { janv: 1, janvier: 1, jan: 1, fev: 2, fevr: 2, fevrier: 2, feb: 2, mars: 3, mar: 3, avr: 4, avril: 4, apr: 4, mai: 5, may: 5, juin: 6, jun: 6, juil: 7, juillet: 7, jul: 7, aout: 8, aug: 8,
  sept: 9, sep: 9, septembre: 9, oct: 10, octobre: 10, nov: 11, novembre: 11, dec: 12, decembre: 12 };
const SECTORS = [['Banque / Finance', /banque|bancaire|finance|bourse|crédit|credit/i], ['Paiement / Fintech', /paiement|fintech/i], ['Assurance', /assurance|mutuelle/i], ['Santé', /santé|sante|hôpital|hopital|clinique|pharma|médical/i],
  ['Retail / E-commerce', /retail|e-commerce|ecommerce|distribution|magasin/i], ['Industrie', /industrie|industriel|usine|automobile|aéronautique/i], ['Énergie', /énergie|energie|nucléaire|pétrole/i],
  ['Secteur public', /ministère|ministere|public|collectivité|administration|défense/i], ['Télécom', /télécom|telecom|opérateur/i], ['Transport / Logistique', /transport|logistique|ferroviaire|aérien/i]];

function findTechs(text) {
  const out = [];
  for (const t of TECHS) {
    const re = new RegExp('(^|[^a-z0-9+#.])' + t.replace(/[.+#/]/g, m => '\\' + m) + '(?![a-z0-9+#])', 'i');
    if (re.test(text) && !out.some(o => canon(o) === canon(t))) out.push(t);
  }
  return out;
}
function guessSector(text) { for (const [s, re] of SECTORS) if (re.test(text)) return s; return ''; }
function parseFrDate(s) {
  if (!s) return null;
  let m = s.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = norm(s).match(/(\d{1,2})?(?:er)?\s*([a-z]+)\.?\s+(\d{4})/);
  if (m && MONTHS[m[2]]) return `${m[3]}-${String(MONTHS[m[2]]).padStart(2, '0')}-${String(m[1] || 1).padStart(2, '0')}`;
  return null;
}

function localParseBesoin(text) {
  const t = text, n = norm(text);
  const g = (re) => { const m = t.match(re); return m ? m[1].trim() : ''; };
  const d = {};
  d.client = g(/client\s*:\s*([^\n–\-]+)/i) || g(/^De\s*:.*@([a-z0-9-]+)\./im).replace(/-/g, ' ');
  d.titre = g(/(?:objet|poste|intitulé)\s*:\s*(.+)/i).replace(/^(re|tr|fwd)\s*:\s*/i, '').replace(/^besoin( urgent)?\s*[–-]\s*/i, '') || (t.split('\n').find(l => l.trim().length > 8) || '').trim().slice(0, 90);
  if (!d.client) { const m = t.match(/(?:chez|de la|du|de l'|de l’|pour)\s+((?:[A-ZÉ][\wÀ-ÿ'’&-]*\s?){1,4})/); if (m) d.client = m[1].trim(); }
  { const m = t.match(/besoin\s+(?:urgent\s+)?d['’]?(?:un|une|e)?\s*(?:\(e\)\s*)?([^,.;:\n]{6,80})/i); if (m && (!d.titre || d.titre.length > 70)) d.titre = m[1].trim().replace(/^./, ch => ch.toUpperCase()); }
  d.lieu = g(/lieu\s*:\s*([^,\n]+)/i) || g(/localisation\s*:\s*([^,\n]+)/i);
  const tt = t.match(/(\d)\s*(?:jours?|j)\s*(?:de\s*)?t[ée]l[ée]travail/i); d.teletravail = tt ? tt[1] + ' j / semaine' : (/full remote|100 ?% t[ée]l[ée]travail/i.test(t) ? '100 % remote' : '');
  const b = t.match(/(?:tjm|budget|tarif)[^\n\d]{0,40}(\d{3,4})\s*(?:€|eur)/i) || t.match(/(\d{3,4})\s*(?:€|eur)\s*(?:ht)?\s*(?:\/|par)\s*j/i); d.budgetTJM = b ? +b[1] : null;
  d.demarrage = parseFrDate(g(/d[ée]marrage\s*:\s*(.+)/i) || g(/d[ée]but\s*(?:de mission)?\s*:\s*(.+)/i) || g(/d[ée]marrage\s*(?:le|au|en|pr[ée]vu|souhait[ée])?\s*([^,.;\n]{4,30})/i));
  if (!d.demarrage && /asap|d[eè]s que possible|imm[ée]diat/i.test(t)) d.demarrage = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  const dj = t.match(/(\d{2,3})\s*jours/i), dm = t.match(/dur[ée]e[^\n\d]{0,20}(\d{1,2})\s*mois/i) || t.match(/(\d{1,2})\s*mois/i);
  d.duree = dj ? +dj[1] : dm ? Math.round(+dm[1] * 18.3) : null;
  const xp = t.match(/(\d{1,2})\s*(?:\+\s*)?ans?\s*(?:minimum|min\.?|d'exp|d’exp|et plus)/i) || t.match(/(?:minimum|au moins)\s*(\d{1,2})\s*ans/i); d.xpMin = xp ? +xp[1] : null;
  d.seniorite = /expert|lead|architecte/i.test(t) ? 'expert' : /senior/i.test(t) ? 'senior' : /junior|d[ée]butant/i.test(t) ? 'junior' : 'confirme';
  if (d.xpMin) d.seniorite = d.xpMin >= 10 ? 'expert' : d.xpMin >= 5 ? 'senior' : d.xpMin >= 2 ? 'confirme' : 'junior';
  d.secteur = guessSector(t);
  const ech = g(/(?:d'ici|avant)\s+le\s+(\d{1,2}\s+[a-zéû]+(?:\s+\d{4})?)/i); d.echeance = ech ? parseFrDate(/\d{4}/.test(ech) ? ech : ech + ' ' + NOW.getFullYear()) : null;
  // compétences : obligatoires si dans un bloc "obligatoire/indispensable", sinon souhaitées
  const lines = t.split('\n'); let mode = null; const comp = [];
  const mk = x => /obligatoire|indispensable|requis|imp[ée]ratif|must|exig/i.test(x) ? 'o' : /appr[ée]ci|souhait|\bun plus\b|nice to have|bonus|optionnel|serait bien/i.test(x) ? 's' : null;
  const add = (tech, m) => {
    if (norm(tech) !== canon(tech)) tech = TECHS.find(x => norm(x) === canon(tech)) || tech;
    const ex = comp.find(c => canon(c.nom) === canon(tech));
    if (!ex) comp.push({ nom: tech, obligatoire: m === 'o', poids: m === 'o' ? 3 : m === 's' ? 1 : 2 });
    else if (m === 'o' && !ex.obligatoire) { ex.obligatoire = true; ex.poids = 3; }
  };
  for (const l of lines) {
    const lt = l.trim();
    if (!lt) continue;
    const heading = /:\s*$/.test(lt) || (lt.length < 45 && mk(lt) && !findTechs(lt).length);
    if (heading) { mode = mk(lt); continue; }
    if (/^[A-ZÉ][^:]{2,40}:/.test(lt) && !mk(lt.split(':')[0])) mode = mode && /^[-•*·]/.test(lt) ? mode : null;
    for (const clause of lt.split(/[,;]|\bet\b/)) { const m = mk(clause) || mode; for (const tech of findTechs(clause)) add(tech, m); }
  }
  if (comp.some(c => c.nom === 'Spring Boot')) { const i = comp.findIndex(c => c.nom === 'Spring'); if (i >= 0) comp.splice(i, 1); }
  if (comp.some(c => canon(c.nom) === 'gitlab ci')) { const i = comp.findIndex(c => c.nom === 'CI/CD'); if (i >= 0) comp.splice(i, 1); }
  comp.sort((a, b) => b.obligatoire - a.obligatoire);
  if (!comp.some(c => c.obligatoire)) comp.slice(0, 3).forEach(c => { c.obligatoire = true; c.poids = 3; });
  d.competences = comp.slice(0, 12);
  d.langues = /anglais/i.test(t) ? (g(/(anglais[^\n,;(]*)/i) || 'Anglais').trim() : '';
  d.contexte = (g(/contexte\s*:\s*\n?([\s\S]{20,400}?)\n\s*\n/i) || '').replace(/\s+/g, ' ');
  d.contact = (g(/^De\s*:\s*([^<\n]+)/im) || '').trim();
  return d;
}

function localParseCV(text) {
  const lines = text.split('\n').map(l => l.trim());
  const c = { experiences: [], competences: [], certifications: [], formation: [], langues: [] };
  const first = lines.find(l => l.length > 2) || '';
  const parts = first.replace(/[^A-Za-zÀ-ÿ' -]/g, '').trim().split(/\s+/);
  if (parts.length >= 2 && parts.length <= 4) {
    const up = parts.filter(p => p === p.toUpperCase() && p.length > 1);
    if (up.length && up.length < parts.length) { c.nom = up.join(' '); c.prenom = parts.filter(p => !up.includes(p)).join(' '); }
    else { c.prenom = parts[0]; c.nom = parts.slice(1).join(' '); }
    const cap = s => s.toLowerCase().replace(/(^|[\s-])\S/g, m => m.toUpperCase());
    c.prenom = cap(c.prenom); c.nom = cap(c.nom);
  }
  const idx = lines.indexOf(first);
  c.titre = (lines.slice(idx + 1).find(l => l.length > 3 && !/@|\d{2} ?\d{2}/.test(l)) || '').split(/[—–|]/)[0].trim();
  const em = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/); c.email = em ? em[0] : '';
  const tel = text.match(/(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/); c.tel = tel ? tel[0] : '';
  c.statut = /freelance|ind[ée]pendant|tjm|portage/i.test(text) ? 'freelance' : 'salarie';
  const tj = text.match(/tjm[^\d\n]{0,15}(\d{3,4})/i); if (tj) c.cout = +tj[1];
  const sal = text.match(/(\d{2,3})\s*k\s*€?/i); if (sal && c.statut === 'salarie') { c.salaire = +sal[1] * 1000; c.cout = cjmFromSalary(c.salaire); }
  const dispo = text.match(/disponib[a-z]*\s*(?:le|:|à partir du)?\s*([^\n·(]+)/i);
  c.dispo = dispo ? (/imm[ée]diat/i.test(dispo[1]) ? new Date().toISOString().slice(0, 10) : parseFrDate(dispo[1])) : null;
  const city = text.match(/([A-ZÉ][a-zéèê-]+(?:[- ][A-ZÉ][a-zéèê-]+)*)\s*\((\d{2,3})\)/); c.ville = city ? city[0] : '';
  // Expériences : lignes contenant une période
  const M = '(?:janv(?:ier)?|f[ée]vr?(?:ier)?|mars|avr(?:il)?|mai|juin|juil(?:let)?|ao[uû]t|sept(?:embre)?|oct(?:obre)?|nov(?:embre)?|d[ée]c(?:embre)?)\\.?';
  const P = new RegExp(`((?:${M}\\s+)?(?:\\d{1,2}/)?\\d{4})\\s*(?:-|–|—|à|au)\\s*((?:${M}\\s+)?(?:\\d{1,2}/)?\\d{4}|aujourd'hui|aujourd’hui|pr[ée]sent|ce jour|maintenant|en cours|now|present)`, 'i');
  const toYM = (s, end) => {
    if (/aujourd|pr[ée]sent|ce jour|maintenant|en cours|now|present/i.test(s)) return null;
    let m = s.match(/(\d{1,2})\/(\d{4})/); if (m) return `${m[2]}-${m[1].padStart(2, '0')}`;
    m = norm(s).match(/([a-z]+)\.?\s+(\d{4})/); if (m && MONTHS[m[1]]) return `${m[2]}-${String(MONTHS[m[1]]).padStart(2, '0')}`;
    m = s.match(/(\d{4})/); return m ? `${m[1]}-${end ? '12' : '01'}` : null;
  };
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]; const m = l.match(P);
    if (m) {
      if (cur) c.experiences.push(cur);
      const rest = l.replace(m[0], '').replace(/^[\s·|:,–—-]+/, '').split(/\s*[·|@]\s*|\s+[–—-]\s+|\s+chez\s+/).filter(Boolean);
      const ent = rest[1] || '';
      const sect = (ent.match(/\(([^)]+)\)/) || [])[1] || '';
      cur = { poste: (rest[0] || 'Poste').trim(), entreprise: ent.replace(/\(.*\)/, '').trim(), secteur: sect ? (guessSector(sect) || sect) : guessSector(l), debut: toYM(m[1]), fin: toYM(m[2], true),
        type: /altern|apprenti/i.test(l) ? 'alternance' : /stage/i.test(l) ? 'stage' : /freelance|ind[ée]pendant/i.test(l) ? 'freelance' : 'cdi', technos: [], description: '' };
    } else if (cur) {
      if (/^(formation|certifications?|langues|comp[ée]tences|dipl[oô]mes?|centres d'int)/i.test(l)) { c.experiences.push(cur); cur = null; continue; }
      cur.technos.push(...findTechs(l).filter(t => !cur.technos.includes(t)));
      if (l && !/^environnement/i.test(l) && cur.description.length < 300) cur.description += (cur.description ? ' ' : '') + l;
      if (!cur.secteur) cur.secteur = guessSector(l);
    }
  }
  if (cur) c.experiences.push(cur);
  const sec = (name, split = true) => { const i = lines.findIndex(l => new RegExp('^' + name, 'i').test(l)); if (i < 0) return []; const out = []; for (let j = i + 1; j < lines.length && lines[j] && !/^[A-ZÉ ]{5,}$/.test(lines[j]); j++) out.push(...(split ? lines[j].split(/\s*·\s*/) : [lines[j].replace(/^(\d{4})\s*·\s*(.*)$/, '$2 ($1)')])); return out.filter(Boolean); };
  c.certifications = sec('certifications?'); c.formation = sec('formation', false); c.langues = sec('langues');
  c.competences = findTechs(text).filter(t => !c.experiences.some(e => e.technos.includes(t)));
  return c;
}
function cjmFromSalary(brut, coef = 1.45, jours = 209) { return Math.round(brut * coef / jours); }

/* ---- Prompts IA ---- */
async function aiParseBesoin(text) {
  const sample = await getSample(); if (!sample) throw { code: 'unavailable' };
  return sample.json(`Tu es assistant(e) d'une commerciale en ESN (société de services informatiques). Analyse ce besoin client (mail, fiche de poste ou notes d'appel) et réponds UNIQUEMENT avec un objet JSON :
{"client":"", "contact":"", "titre":"intitulé court du poste", "secteur":"secteur d'activité du client (ex: Banque / Finance, Santé, Retail / E-commerce, Industrie, Secteur public, Assurance, Énergie, Télécom)", "lieu":"", "teletravail":"ex: 2 j / semaine", "demarrage":"YYYY-MM-DD ou null", "duree": nombre de jours ouvrés ou null (12 mois ≈ 220), "budgetTJM": nombre € HT ou null, "seniorite":"junior|confirme|senior|expert", "xpMin": années ou null, "echeance":"YYYY-MM-DD date limite de réponse ou null", "langues":"", "contexte":"2-3 phrases sur l'enjeu", "competences":[{"nom":"nom court de la techno","obligatoire":true,"poids":1-3}]}
Règles : 4 à 12 compétences, noms courts et standards (ex "Kubernetes", "Terraform", "AWS", "GitLab CI"). Obligatoire = explicitement exigée. Poids 3 = cœur du poste. Date du jour : ${NOW.toISOString().slice(0, 10)}.

TEXTE :
"""${text.slice(0, 60000)}"""`);
}
async function aiParseCV(text) {
  const sample = await getSample(); if (!sample) throw { code: 'unavailable' };
  return sample.json(`Analyse ce CV d'informaticien et réponds UNIQUEMENT avec un objet JSON :
{"prenom":"","nom":"","titre":"","statut":"freelance|salarie","cout": TJM en € si freelance sinon null, "salaire": salaire brut annuel en € si mentionné sinon null, "dispo":"YYYY-MM-DD ou null","ville":"","email":"","tel":"",
"experiences":[{"poste":"","entreprise":"","secteur":"secteur d'activité de l'entreprise (ex: Banque / Finance, Santé, Retail / E-commerce, Industrie, Assurance, Secteur public, ESN / Services IT)","debut":"YYYY-MM","fin":"YYYY-MM ou null si en cours","type":"cdi|freelance|alternance|stage","technos":["noms courts standards"],"description":"1 phrase"}],
"competences":["autres compétences"],"certifications":[""],"formation":[""],"langues":[""]}
Liste les expériences de la plus récente à la plus ancienne. Date du jour : ${NOW.toISOString().slice(0, 10)}.

CV :
"""${text.slice(0, 60000)}"""`);
}
async function aiInterview(dem, c, A) {
  const sample = await getSample(); if (!sample) throw { code: 'unavailable' };
  const ctx = {
    poste: dem.titre, client_secteur: dem.secteur, contexte: dem.contexte, seniorite_demandee: dem.seniorite, xp_min: dem.xpMin,
    competences: A.skills.map(k => ({ nom: k.nom, obligatoire: k.obligatoire, annees_ponderees: +k.eff.toFixed(1), derniere_utilisation: k.lastYear, etat: k.etat })),
    candidat: { titre: c.titre, niveau_estime: A.level.label, experience_utile_ans: +A.effYears.toFixed(1), statut: c.statut,
      experiences: A.exps.slice(0, 5).map(e => ({ poste: e.poste, secteur: e.secteur, periode: `${e.debut} → ${e.fin || 'aujourd\'hui'}`, technos: e.technos })) },
    alertes: A.alertes.map(a => a.m)
  };
  return sample.json(`Tu prépares une commerciale d'ESN (non technique) à mener un entretien de qualification. Génère 10 à 12 questions adaptées au NIVEAU RÉEL du candidat et aux exigences du client, avec sous chaque question les pistes de bonnes réponses (ce qu'un bon candidat doit citer, en termes simples à repérer) et les signaux d'alerte.
Catégories à couvrir : "Technique" (une question par compétence obligatoire, niveau ajusté), "Points de vigilance" (écarts et compétences anciennes), "Secteur", "Contexte mission", "Savoir-être", "Commercial".
Réponds UNIQUEMENT avec un tableau JSON : [{"cat":"","skill":"","niveau":"Fondamentaux|Avancé|Vérification|—","q":"question","why":"pourquoi cette question (1 phrase)","pistes":["3-5 éléments"],"alertes":["1-2 signaux"]}]

CONTEXTE :
${JSON.stringify(ctx)}`);
}
async function aiSynthese(dem, c, A, anon) {
  const sample = await getSample(); if (!sample) throw { code: 'unavailable' };
  const r = await sample(`Rédige en français une synthèse commerciale de 4 à 5 phrases (90 mots max) présentant ce consultant pour le besoin "${dem.titre}" (secteur ${dem.secteur || 'non précisé'}). Ton professionnel et factuel, à la 3e personne, ${anon ? "sans nom ni nom d'entreprise (anonymisé)" : 'avec son prénom'}. Mets en avant l'expérience récente pertinente, la durée d'expérience, les compétences clés demandées. N'invente rien. Réponds avec la synthèse seule.
Données : ${JSON.stringify({ titre: c.titre, prenom: c.prenom, experience_utile: A.effYears.toFixed(1), experience_totale: A.rawYears.toFixed(1), competences: A.skills.filter(k => k.eff > 0.2).map(k => k.nom + ' (' + k.eff.toFixed(1) + ' ans, dernière utilisation ' + k.lastYear + ')'), experiences: A.exps.slice(0, 4).map(e => ({ poste: e.poste, secteur: e.secteur, debut: e.debut, fin: e.fin, technos: e.technos })), certifications: c.certifications })}`, { max: 800 });
  return r.text.trim();
}
function localSynthese(dem, c, A, anon) {
  const top = A.skills.filter(k => k.score >= 0.6).map(k => k.nom).slice(0, 5);
  const recent = A.exps[0];
  const who = anon ? 'Ce consultant' : (c.prenom || 'Ce consultant');
  let s = `${who}${c.titre ? ' (' + c.titre + ')' : ''} cumule ${Math.round(A.rawYears)} ans d'expérience, dont ${A.effYears.toFixed(1).replace('.', ',')} ans d'expérience récente et directement utile sur ce type de mission.`;
  if (recent) s += ` Actuellement ${recent.poste}${recent.secteur ? ' dans le secteur ' + recent.secteur : ''}, il/elle intervient sur ${(recent.technos || []).slice(0, 5).join(', ')}.`;
  if (top.length) s += ` Ses compétences clés pour ce besoin : ${top.join(', ')}.`;
  if (A.sectBest && A.s.secteur >= 50) s += ` Sa connaissance du secteur ${dem.secteur} est un atout pour une prise de poste rapide.`;
  if ((c.certifications || []).length) s += ` Certifications : ${c.certifications.slice(0, 3).map(x => x.replace(/\s*\(.*?\)/, '')).join(', ')}.`;
  return s;
}

/* ---- Lecture de fichiers (PDF, Word, texte, e-mail) ---- */
const LIBS = { // bibliothèques incluses dans le dépôt (aucune dépendance en ligne)
  pdf: ['pdf.min.js', 'pdf.worker.min.js'],
  mammoth: ['mammoth.browser.min.js'],
  jspdf: ['jspdf.umd.min.js']
};
const _loaded = {};
function loadLib(name) {
  if (_loaded[name]) return _loaded[name];
  _loaded[name] = LIBS[name].reduce((p, src) => p.then(() => new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Chargement impossible : ' + src)); document.head.appendChild(s);
  })), Promise.resolve());
  return _loaded[name];
}
async function readFileText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    await loadLib('pdf');
    const buf = await file.arrayBuffer();
    const doc = await window.pdfjsLib.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const pg = await doc.getPage(i); const tc = await pg.getTextContent();
      let lastY = null;
      for (const it of tc.items) { const y = it.transform[5]; if (lastY !== null && Math.abs(y - lastY) > 4) out += '\n'; else if (lastY !== null) out += ' '; out += it.str; lastY = y; }
      out += '\n\n';
    }
    return out.replace(/[ \t]+/g, ' ');
  }
  if (name.endsWith('.docx')) {
    await loadLib('mammoth');
    const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return r.value;
  }
  let txt = await file.text();
  if (name.endsWith('.eml')) {
    const i = txt.search(/\r?\n\r?\n/); const head = txt.slice(0, i), body = txt.slice(i).trim();
    const subj = (head.match(/^Subject:\s*(.*)$/im) || [])[1] || ''; const from = (head.match(/^From:\s*(.*)$/im) || [])[1] || '';
    let b = body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
    try { b = decodeURIComponent(escape(b)); } catch (e) { }
    b = b.replace(/<[^>]+>/g, ' ').replace(/--[\w=_-]+.*$/gm, '').replace(/^Content-[^\n]*$/gim, '');
    txt = `De : ${from}\nObjet : ${subj}\n\n${b}`;
  }
  if (name.endsWith('.html') || name.endsWith('.htm')) { const d = new DOMParser().parseFromString(txt, 'text/html'); txt = d.body.innerText || d.body.textContent; }
  return txt;
}
