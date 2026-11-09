/* ====== Banque de questions d'entretien (générateur local) ======
   f = fondamentaux (junior / confirmé), a = avancé (senior / expert) */
const QBANK = {
  kubernetes: {
    f: { q: "Expliquez la différence entre un Deployment, un StatefulSet et un DaemonSet. Dans quel cas utilisez-vous chacun ?",
      p: ["Deployment : pods sans état, interchangeables, rolling update", "StatefulSet : identité stable, volumes persistants dédiés (bases, Kafka…)", "DaemonSet : un pod par nœud (agents de logs, monitoring, CNI)", "Cite un exemple concret de son propre projet"],
      a: ["Confond Deployment et ReplicaSet sans savoir expliquer", "Aucun exemple vécu"] },
    a: { q: "Un pod critique redémarre en boucle en production (CrashLoopBackOff) un vendredi soir. Décrivez votre démarche, pas à pas.",
      p: ["kubectl describe / logs --previous, events du namespace", "Vérifie probes (liveness trop agressive), limites mémoire (OOMKilled), config/secrets manquants", "Rollback rapide (kubectl rollout undo / ArgoCD) avant l'analyse de fond", "Communication incident, post-mortem, ajout d'alerte ou de test"],
      a: ["Supprime le pod sans analyser", "Ne pense pas au rollback ni à la communication"] }
  },
  terraform: {
    f: { q: "Qu'est-ce que le state Terraform, où le stockez-vous et comment évitez-vous les modifications concurrentes ?",
      p: ["Le state décrit l'état réel des ressources gérées", "Backend distant (S3 + DynamoDB pour le verrou, GitLab, Terraform Cloud)", "Chiffrement du state (il peut contenir des secrets)", "Jamais de state local partagé sur un poste"],
      a: ["State commité dans Git", "Ne connaît pas le verrouillage"] },
    a: { q: "Comment structurez-vous un code Terraform pour 3 environnements et 15 équipes, et comment gérez-vous la dérive (drift) ?",
      p: ["Modules versionnés et réutilisables, registre interne", "Séparation des states par environnement / domaine (blast radius)", "Plan systématique en CI, revue de code, policy as code (OPA, Sentinel, Checkov)", "Détection de drift planifiée, import ou correction des changements manuels"],
      a: ["Un seul gros state pour tout", "Applique depuis son poste en production"] }
  },
  aws: {
    f: { q: "Décrivez une architecture AWS que vous avez déployée : réseau, calcul, stockage. Pourquoi ces choix ?",
      p: ["VPC multi-AZ, sous-réseaux publics/privés, NAT, security groups", "Choix argumenté EC2 / ECS / EKS / Lambda", "IAM au moindre privilège, rôles plutôt que clés", "Notion de coût (instances réservées, Savings Plans, tagging)"],
      a: ["Reste théorique ou ne parle que de la console", "Clés d'accès en dur"] },
    a: { q: "Comment garantir la résilience d'une plateforme de paiement sur AWS (objectifs de type DORA) ?",
      p: ["Multi-AZ systématique, réflexion multi-région selon RTO/RPO", "Sauvegardes testées, plans de reprise documentés et exercés", "Chaos engineering / tests de résilience, game days", "Observabilité, SLO, gestion des dépendances tierces"],
      a: ["Confond haute disponibilité et sauvegarde", "Aucune notion de RTO / RPO"] }
  },
  'gitlab ci': {
    f: { q: "Décrivez un pipeline GitLab CI que vous avez écrit : étapes, déclencheurs, gestion des secrets.",
      p: ["Stages build / test / scan / deploy, règles (rules) par branche", "Variables protégées et masquées, ou coffre (Vault) via OIDC", "Cache et artefacts pour accélérer", "Runners dédiés selon les environnements"],
      a: ["Secrets en clair dans le .gitlab-ci.yml", "N'a jamais écrit de pipeline lui-même"] },
    a: { q: "Comment industrialisez-vous les pipelines de 40 microservices sans dupliquer le code CI ?",
      p: ["Templates partagés (include, extends), composants CI/CD versionnés", "Pipelines parent-enfant, déclenchements multi-projets", "Approche GitOps : la CI construit, ArgoCD/Flux déploie", "Indicateurs DORA : fréquence de déploiement, lead time, MTTR"],
      a: ["Copie-colle le même fichier dans chaque projet"] }
  },
  'ci/cd': null,
  python: {
    f: { q: "Montrez-moi un script Python d'automatisation que vous avez écrit : quel problème résolvait-il ?",
      p: ["Problème concret et gain mesuré (temps, erreurs)", "Bibliothèques adaptées (boto3, requests, click…)", "Gestion des erreurs, logs, idempotence", "Code versionné et testé"],
      a: ["Uniquement des scripts copiés d'Internet"] },
    a: { q: "Comment rendez-vous un outil Python interne maintenable par toute l'équipe ?",
      p: ["Packaging, dépendances figées (poetry, uv, requirements)", "Tests unitaires, lint, typage", "CI dédiée, documentation, revue de code", "Distribution (image Docker, CLI interne)"],
      a: ["Aucun test ni versionnement"] }
  },
  ansible: {
    f: { q: "Qu'est-ce que l'idempotence dans Ansible et comment la vérifiez-vous ?",
      p: ["Rejouer un playbook ne change rien si l'état est déjà conforme", "Modules plutôt que shell/command", "Mode --check et --diff", "Rôles réutilisables, inventaires par environnement"],
      a: ["Tout en tâches shell"] },
    a: { q: "Comment organisez-vous Ansible à grande échelle (centaines de serveurs, plusieurs équipes) ?",
      p: ["Collections et rôles versionnés, Galaxy interne", "AWX / Ansible Automation Platform, RBAC", "Ansible Vault ou coffre externe pour les secrets", "Tests avec Molecule"],
      a: ["Exécution depuis son poste uniquement"] }
  },
  prometheus: {
    f: { q: "Quelles métriques surveillez-vous en priorité sur un service web et comment les alertez-vous ?",
      p: ["Méthodes RED (taux, erreurs, durée) ou USE (ressources)", "Alertes sur symptômes utilisateurs plutôt que sur causes", "Tableaux de bord Grafana partagés", "Éviter le bruit : seuils, durée, routage Alertmanager"],
      a: ["Alerte sur chaque métrique CPU", "Pas de notion de seuil ni de priorité"] },
    a: { q: "Comment définissez-vous et suivez-vous des SLO avec un budget d'erreur ?",
      p: ["SLI mesurable (disponibilité, latence p99)", "SLO négocié avec le métier, budget d'erreur", "Alertes multi-fenêtres sur le taux de consommation (burn rate)", "Utilisation du budget pour arbitrer vitesse / stabilité"],
      a: ["Confond SLA et SLO"] }
  },
  devsecops: {
    f: { q: "Comment intégrez-vous la sécurité dans une chaîne CI/CD ?",
      p: ["Scan de dépendances (SCA) et de code (SAST)", "Scan d'images (Trivy, Grype) avant déploiement", "Gestion des secrets hors du code (Vault, Secrets Manager)", "Images minimales et signées"],
      a: ["La sécurité, c'est l'équipe sécu"] },
    a: { q: "Comment sécurisez-vous un cluster Kubernetes en production ?",
      p: ["RBAC au moindre privilège, Pod Security Standards", "Network Policies, chiffrement des secrets (KMS)", "Admission control (Kyverno, OPA Gatekeeper)", "Audit logs, détection d'exécution (Falco), mises à jour régulières"],
      a: ["Tous les pods en root sans le savoir"] }
  },
  docker: {
    f: { q: "Comment réduisez-vous la taille et la surface d'attaque d'une image Docker ?",
      p: ["Build multi-étapes", "Image de base minimale (distroless, alpine)", "Utilisateur non root", "Ordre des couches pour profiter du cache"],
      a: ["Images de plusieurs Go sans s'en préoccuper"] },
    a: { q: "Quelle est votre stratégie de gestion des images à l'échelle (registre, versions, vulnérabilités) ?",
      p: ["Registre privé, politique de rétention", "Tags immuables, digest, signature (cosign)", "Scan continu et reconstruction automatique", "Images de base communes maintenues"],
      a: ["Tag latest en production"] }
  },
  linux: {
    f: { q: "Un serveur Linux est lent : quelles commandes lancez-vous en premier ?",
      p: ["top/htop, load average, vmstat", "Disque (df, iostat), mémoire (free), réseau (ss)", "Journaux (journalctl, /var/log)", "Raisonne du symptôme vers la cause"],
      a: ["Redémarre directement le serveur"] },
    a: { q: "Comment automatisez-vous le durcissement et la mise à jour d'un parc Linux ?",
      p: ["Référentiel CIS / ANSSI", "Automatisation (Ansible, images dorées)", "Patch management planifié avec fenêtres", "Conformité vérifiée en continu"],
      a: ["Mises à jour manuelles serveur par serveur"] }
  },
  azure: {
    f: { q: "Quels services Azure avez-vous utilisés et comment gérez-vous les identités ?",
      p: ["Ressources concrètes (AKS, App Service, Storage…)", "Entra ID, identités managées", "RBAC Azure, groupes de ressources", "Notion de coûts"],
      a: ["Ne connaît que le portail"] },
    a: { q: "Comment transposeriez-vous votre expérience Azure vers un autre cloud ?",
      p: ["Correspondance des services (AKS/EKS, Key Vault/Secrets Manager…)", "Concepts communs : IAM, réseau, IaC", "Plan de montée en compétence, certifications", "Recul sur les différences"],
      a: ["Pense que tout est identique"] }
  },
  gcp: {
    f: { q: "Quels services GCP utilisez-vous et comment gérez-vous les projets et les droits ?",
      p: ["Hiérarchie organisation / dossiers / projets", "IAM, comptes de service", "GKE, Cloud Storage, Cloud SQL…", "Facturation et budgets"],
      a: ["Comptes de service avec droits Owner"] },
    a: { q: "Quelles différences majeures voyez-vous entre GCP et AWS pour une plateforme Kubernetes ?",
      p: ["GKE Autopilot vs EKS (gestion du plan de contrôle, add-ons)", "Réseau (VPC global GCP vs régional AWS)", "IAM : Workload Identity vs IRSA / Pod Identity", "Transférabilité des compétences"],
      a: ["Aucune vision comparative"] }
  },
  java: {
    f: { q: "Décrivez une application Java sur laquelle vous avez travaillé : architecture, frameworks, tests.",
      p: ["Spring Boot, couches, API REST", "Tests unitaires et d'intégration", "Build Maven/Gradle", "Version de Java"], a: ["Versions très anciennes uniquement"] },
    a: { q: "Comment diagnostiquez-vous une fuite mémoire sur une application Java en production ?",
      p: ["Analyse du heap dump, GC logs", "Outils : JFR, VisualVM, MAT", "Hypothèses : caches, connexions non fermées", "Correction et test de charge"], a: ["Augmente simplement la mémoire"] }
  }
};

const SECTOR_Q = [
  { re: /banque|finance|paiement|fintech|assurance/i, q: "Quelles contraintes spécifiques au secteur financier avez-vous rencontrées (DORA, PCI-DSS, gestion des changements, auditabilité) ?",
    p: ["Cite DORA (résilience opérationnelle) et/ou PCI-DSS pour les paiements", "Processus de changement formalisés (CAB, ITIL)", "Traçabilité, séparation des environnements, habilitations", "Astreintes et gestion d'incidents majeurs"], a: ["Ne voit pas en quoi c'est différent d'une startup"] },
  { re: /sant|pharma|hôp|medical/i, q: "Comment avez-vous pris en compte les données de santé (HDS, RGPD) dans vos projets ?",
    p: ["Hébergement certifié HDS", "Chiffrement, journalisation des accès", "Minimisation et pseudonymisation", "Rôle du DPO"], a: ["Ignore la certification HDS"] },
  { re: /retail|commerce|distrib/i, q: "Comment préparez-vous une plateforme pour un pic de charge (soldes, Black Friday) ?",
    p: ["Tests de charge en amont", "Autoscaling, cache, CDN", "Gel des mises en production", "Plan de crise et supervision renforcée"], a: ["Aucune anticipation"] },
  { re: /public|administration|defense|état|etat/i, q: "Quelles exigences du secteur public connaissez-vous (RGS, SecNumCloud, marchés publics) ?",
    p: ["RGS et homologation de sécurité", "Qualification SecNumCloud", "Souveraineté des données", "Délais et formalisme des marchés"], a: ["Aucune notion"] }
];

const SOFT_Q = [
  { q: "Racontez une situation où vous avez dû dire non à un client ou à un chef de projet. Comment l'avez-vous géré ?",
    p: ["Argumente avec des faits (risque, coût, délai)", "Propose une alternative", "Reste dans une posture de conseil, sans conflit", "Résultat concret"], a: ["Subit toujours, ou entre en conflit"] },
  { q: "Vous intégrez une équipe de 9 personnes en cours de projet : que faites-vous pendant vos deux premières semaines ?",
    p: ["Écoute, lecture de la documentation, prise en main des accès", "Rencontre les interlocuteurs clés", "Premières contributions rapides et visibles", "Pose des questions plutôt que de tout changer"], a: ["Veut tout refaire dès le premier jour"] }
];

function levelBucket(levelId) { return (levelId === 'senior' || levelId === 'expert') ? 'a' : 'f'; }

function buildLocalInterview(dem, c, A) {
  const out = [];
  const candB = levelBucket(A.level.id);
  const demB = levelBucket(levelById(dem.seniorite || 'confirme').id);
  const sorted = A.skills.slice().sort((x, y) => (y.obligatoire - x.obligatoire) || (y.poids - x.poids));
  for (const k of sorted.slice(0, 6)) {
    let key = canon(k.nom); if (key === 'ci/cd') key = 'gitlab ci';
    const bank = QBANK[key];
    // Le niveau suit le candidat ; si la demande est plus exigeante sur une compétence obligatoire, on teste au niveau demandé
    const b = (k.obligatoire && demB === 'a') ? 'a' : candB;
    let why = `Compétence ${k.obligatoire ? 'obligatoire' : 'appréciée'} · ${k.eff >= 0.1 ? k.eff.toFixed(1) + ' an(s) de pratique pondérée' : 'non trouvée dans le CV'}${k.lastYear ? ', dernière utilisation ' + k.lastYear : ''}`;
    if (bank && bank[b]) out.push({ cat: 'Technique', skill: k.nom, niveau: b === 'a' ? 'Avancé' : 'Fondamentaux', q: bank[b].q, pistes: bank[b].p, alertes: bank[b].a, why });
    else out.push({ cat: 'Technique', skill: k.nom, niveau: b === 'a' ? 'Avancé' : 'Fondamentaux',
      q: b === 'a' ? `Quel est le sujet le plus complexe que vous avez résolu avec ${k.nom} ? Quelles alternatives avez-vous écartées et pourquoi ?` : `Décrivez un projet récent où vous avez utilisé ${k.nom} : votre rôle exact, ce que vous avez construit, ce que vous referiez autrement.`,
      pistes: ['Contexte précis, rôle personnel (« je » plutôt que « on »)', 'Chiffres : volumétrie, taille d\'équipe, gains', 'Recul : limites, alternatives, erreurs corrigées', 'Vocabulaire technique juste et naturel'],
      alertes: ['Réponse vague ou purement théorique'], why });
  }
  // Vérification des écarts détectés
  for (const k of A.skills.filter(s => s.etat === 'ancien' || (s.obligatoire && (s.etat === 'absent' || s.etat === 'faible')))) {
    out.push({ cat: 'Points de vigilance', skill: k.nom, niveau: 'Vérification',
      q: k.etat === 'ancien' ? `Votre expérience ${k.nom} date de ${k.lastYear}. Qu'avez-vous fait depuis pour rester à jour, et en combien de temps seriez-vous opérationnel(le) ?`
        : k.etat === 'absent' ? `Le client attend ${k.nom}, que je ne vois pas dans votre parcours. Avez-vous une expérience même partielle, ou une technologie équivalente ?`
          : `Votre pratique de ${k.nom} est récente. Jusqu'où êtes-vous autonome aujourd'hui ?`,
      pistes: ['Honnêteté sur son niveau réel', 'Équivalences crédibles (outil voisin, certification, projet personnel)', 'Plan de montée en compétence concret', 'Délai réaliste pour être autonome'],
      alertes: ['Survend une compétence qu\'il ne peut pas illustrer'], why: 'Écart détecté entre le CV et la demande' });
  }
  if (A.effYears < A.xpMin) out.push({ cat: 'Points de vigilance', skill: 'Expérience', niveau: 'Vérification',
    q: `Le client demande ${A.xpMin} ans d'expérience. Quelle réalisation montre que vous pouvez tenir ce niveau d'autonomie ?`,
    pistes: ['Responsabilités au-delà de son ancienneté', 'Situations de production gérées seul(e)', 'Références vérifiables'], alertes: ['Dépend fortement d\'un référent'], why: `${A.effYears.toFixed(1)} ans d'expérience utile` });
  const sq = SECTOR_Q.find(s => s.re.test(dem.secteur || ''));
  if (sq) out.push({ cat: 'Secteur', skill: dem.secteur, niveau: A.s.secteur >= 50 ? 'Approfondissement' : 'Découverte', q: sq.q, pistes: sq.p, alertes: sq.a,
    why: A.s.secteur >= 50 ? 'Expérience sectorielle à valoriser' : 'Pas d\'expérience récente dans ce secteur' });
  if (/astreinte/i.test(dem.contexte || '') || /astreinte/i.test(dem.sourceText || '')) out.push({ cat: 'Contexte mission', skill: 'Astreintes', niveau: '—',
    q: "La mission comprend des astreintes. Avez-vous déjà été d'astreinte et comment s'est passé votre incident le plus marquant ?",
    pistes: ['Accepte clairement le principe', 'Exemple d\'incident vécu, gestion du stress', 'Réflexes : diagnostic, escalade, communication, post-mortem'], alertes: ['Refus ou réticence forte'], why: 'Exigence du client' });
  SOFT_Q.forEach(s => out.push({ cat: 'Savoir-être', skill: 'Posture conseil', niveau: '—', q: s.q, pistes: s.p, alertes: s.a, why: 'Intégration chez le client' }));
  out.push({ cat: 'Commercial', skill: 'Conditions', niveau: '—',
    q: c.statut === 'freelance' ? 'Confirmez-vous votre TJM, votre date de disponibilité et avez-vous d\'autres propositions en cours ?' : 'Quelle est votre date de disponibilité réelle (préavis) et vos attentes de rémunération ?',
    pistes: ['Disponibilité compatible avec le ' + fmtDate(dem.demarrage), 'Prix stable, pas de surenchère en fin d\'entretien', 'Transparence sur les autres process', 'Accord pour être présenté(e) en exclusivité sur ce besoin'],
    alertes: ['Plusieurs ESN le/la positionnent déjà chez ce client'], why: 'Sécuriser la proposition' });
  return out.map((x, i) => ({ id: 'q' + i, ...x }));
}
