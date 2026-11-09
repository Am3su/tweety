/* ====== Données d'exemple (fictives) ====== */
const EXAMPLE_MAIL = `De : Claire Vasseur <c.vasseur@credit-horizon.example>
Objet : Besoin urgent – Ingénieur DevOps / SRE AWS – Plateforme Paiements
Date : lun. 2 nov. 2026 09:14

Bonjour,

Suite à notre échange téléphonique de vendredi, je vous transmets le cahier des charges pour le renfort de l'équipe Plateforme Paiements (Direction des Systèmes de Paiement).

Nous cherchons un(e) Ingénieur(e) DevOps / SRE confirmé(e) à senior pour accompagner la migration de nos services de paiement instantané vers AWS (EKS).

— CAHIER DES CHARGES —
Client : Crédit Horizon – Direction des Systèmes de Paiement
Lieu : Paris – La Défense, 2 jours de télétravail par semaine
Démarrage : 4 janvier 2027
Durée : 12 mois renouvelables (environ 220 jours)
Budget : TJM maximum 720 € HT

Contexte :
La plateforme traite 4 millions de transactions par jour. Dans le cadre du règlement DORA, nous devons renforcer la résilience opérationnelle, industrialiser les déploiements et mettre en place une observabilité de bout en bout. Équipe de 9 personnes, organisation agile SAFe.

Missions :
- Concevoir et maintenir l'infrastructure AWS en Infrastructure as Code (Terraform)
- Administrer et sécuriser les clusters Kubernetes (EKS), mise en place de GitOps (ArgoCD)
- Industrialiser les pipelines CI/CD sous GitLab CI
- Mettre en place la supervision (Prometheus, Grafana) et les SLO
- Participer aux astreintes (1 semaine sur 5) et à la gestion des incidents de production
- Contribuer à la démarche DevSecOps (scan d'images, gestion des secrets)

Compétences obligatoires :
- Kubernetes (EKS idéalement)
- Terraform
- AWS
- GitLab CI / CI/CD

Compétences appréciées :
- Python (scripting, automatisation)
- Ansible
- Prometheus / Grafana
- DevSecOps
- Expérience dans le secteur bancaire ou des paiements
- Anglais professionnel (échanges avec l'équipe de Lisbonne)

Profil : 5 ans minimum d'expérience en DevOps/SRE.

Merci de nous transmettre vos meilleurs profils d'ici le 13 novembre.

Bien cordialement,
Claire Vasseur
Responsable Plateforme Paiements – Crédit Horizon`;

const CV_KARIM = `KARIM BENALI
Ingénieur DevOps / SRE Senior — Freelance
Paris (75) · karim.benali@mail.example · 06 11 22 33 44
TJM : 600 € HT · Disponible le 4 janvier 2027

EXPÉRIENCES
Mars 2023 – aujourd'hui · Lead DevOps · NeoBank Lumen (néobanque)
Migration de 40 microservices vers AWS EKS, IaC Terraform (modules partagés), GitOps ArgoCD, pipelines GitLab CI, observabilité Prometheus/Grafana/Loki, définition des SLO. Mise en conformité DORA (plans de reprise, tests de résilience). Astreintes.
Environnement : AWS, EKS, Kubernetes, Terraform, GitLab CI, ArgoCD, Helm, Prometheus, Grafana, Python, Vault

Juin 2020 – Février 2023 · Ingénieur DevOps · Paylane (fintech de paiement)
Construction de la plateforme Kubernetes de traitement des paiements carte, automatisation Terraform et Ansible, CI Jenkins puis GitLab CI, conformité PCI-DSS.
Environnement : AWS, Kubernetes, Terraform, Ansible, Jenkins, GitLab CI, Docker, Python

Septembre 2017 – Mai 2020 · Administrateur systèmes Linux · Assurances Méridien
Administration de 600 serveurs Linux, automatisation Ansible, virtualisation VMware.
Environnement : Linux, Ansible, VMware, Bash

Septembre 2015 – Août 2017 · Technicien support N2 · Infogérance Delta (ESN)
Support utilisateurs, Active Directory, postes Windows.

FORMATION
2015 · Licence pro Administration des réseaux — IUT de Villetaneuse

CERTIFICATIONS
CKA – Certified Kubernetes Administrator (2022) · AWS Solutions Architect Associate (2021) · HashiCorp Terraform Associate (2023)

LANGUES
Anglais courant (C1) · Arabe`;

const CV_SOPHIE = `SOPHIE MARCHAND
Ingénieure Cloud & DevOps — Salariée CDI
Lyon (69), mobile Paris · sophie.marchand@mail.example · 07 22 33 44 55
Disponible : 1er février 2027 (préavis en cours de négociation)

EXPÉRIENCES
Février 2024 – aujourd'hui · Cloud Engineer · Groupe Hospitalier Vallée (santé)
Hébergement HDS sur GCP, clusters GKE, Terraform, pipelines GitLab CI, supervision Prometheus/Grafana, scripts Python.
Environnement : GCP, GKE, Kubernetes, Terraform, GitLab CI, Python, Prometheus, Grafana

Septembre 2020 – Janvier 2024 · Ingénieure DevOps · Distrib'Plus (grande distribution)
Plateforme e-commerce sur Azure AKS, Terraform, Azure DevOps, Ansible, gestion des pics de charge (Black Friday).
Environnement : Azure, AKS, Kubernetes, Terraform, Azure DevOps, Ansible, Docker

Janvier 2017 – Août 2020 · Ingénieure d'exploitation · Nuvo Hébergement (hébergeur)
Cloud privé OpenStack, automatisation Ansible, premiers clusters Kubernetes en 2019.
Environnement : OpenStack, Linux, Ansible, Docker, Kubernetes

Mars 2013 – Décembre 2016 · Ingénieure système & Cloud · Banque Coopérative de l'Ouest (banque)
Premiers déploiements AWS (EC2, S3), industrialisation Puppet, intégration continue Jenkins.
Environnement : AWS, Linux, Puppet, Jenkins, Bash

Septembre 2009 – Février 2013 · Développeuse Java · Industries Rhône (industrie)
Développement d'applications de gestion de production.
Environnement : Java, Oracle, SQL

FORMATION
2009 · Diplôme d'ingénieur informatique — INSA Lyon

CERTIFICATIONS
Google Professional Cloud Architect (2024) · Microsoft Azure Administrator AZ-104 (2021)

LANGUES
Anglais professionnel (B2)`;

const CV_LUCAS = `LUCAS PETIT
Ingénieur DevOps — Freelance
Nanterre (92) · lucas.petit@mail.example · 06 55 44 33 22
TJM : 420 € HT · Disponible immédiatement

EXPÉRIENCES
Avril 2025 – aujourd'hui · Ingénieur DevOps · Agence Pixelia (agence web)
Mise en place de clusters Kubernetes (k3s) chez Scaleway, pipelines GitLab CI, conteneurisation Docker.
Environnement : Kubernetes, Scaleway, GitLab CI, Docker, Linux

Septembre 2023 – Mars 2025 · Développeur DevOps · Shopnest (e-commerce)
Déploiements sur AWS (ECS, EC2), premiers modules Terraform, GitHub Actions.
Environnement : AWS, Terraform, GitHub Actions, Docker, Python

Septembre 2021 – Août 2023 · Développeur Python (alternance) · Shopnest (e-commerce)
Développement d'API Python, scripts d'automatisation.
Environnement : Python, Django, PostgreSQL

FORMATION
2023 · Master Cloud Computing (alternance) — EFREI Paris

LANGUES
Anglais intermédiaire (B1)`;

function exampleDemande() {
  return {
    id: 'dem-exemple',
    exemple: true,
    createdAt: '2026-11-02',
    statut: 'sourcing',
    client: 'Crédit Horizon',
    contact: 'Claire Vasseur – Responsable Plateforme Paiements',
    titre: 'Ingénieur DevOps / SRE AWS – Plateforme Paiements',
    secteur: 'Banque / Finance',
    lieu: 'Paris – La Défense',
    teletravail: '2 j / semaine',
    demarrage: '2027-01-04',
    duree: 220,
    budgetTJM: 720,
    seniorite: 'senior',
    xpMin: 5,
    echeance: '2026-11-13',
    competences: [
      { nom: 'Kubernetes', obligatoire: true, poids: 3 },
      { nom: 'Terraform', obligatoire: true, poids: 3 },
      { nom: 'AWS', obligatoire: true, poids: 3 },
      { nom: 'GitLab CI', obligatoire: true, poids: 2 },
      { nom: 'Python', obligatoire: false, poids: 1 },
      { nom: 'Ansible', obligatoire: false, poids: 1 },
      { nom: 'Prometheus', obligatoire: false, poids: 1 },
      { nom: 'DevSecOps', obligatoire: false, poids: 1 }
    ],
    langues: 'Anglais professionnel',
    contexte: "Migration des services de paiement instantané vers AWS EKS. 4 M de transactions/jour. Résilience opérationnelle DORA, industrialisation des déploiements, observabilité de bout en bout, astreintes 1 semaine sur 5. Équipe de 9, agile SAFe.",
    sourceType: 'mail',
    sourceText: EXAMPLE_MAIL,
    marge: 25,
    poids: { competences: 40, experience: 25, secteur: 15, cout: 20 },
    candidats: [
      {
        id: 'cand-kb', prenom: 'Karim', nom: 'Benali', titre: 'Ingénieur DevOps / SRE Senior',
        statut: 'freelance', cout: 600, dispo: '2027-01-04', ville: 'Paris (75)',
        email: 'karim.benali@mail.example', tel: '06 11 22 33 44', pipeline: 'shortlist',
        experiences: [
          { poste: 'Lead DevOps', entreprise: 'NeoBank Lumen', secteur: 'Banque / Finance', debut: '2023-03', fin: null, type: 'cdi',
            technos: ['AWS', 'EKS', 'Kubernetes', 'Terraform', 'GitLab CI', 'ArgoCD', 'Helm', 'Prometheus', 'Grafana', 'Python', 'Vault', 'DevSecOps'],
            description: "Migration de 40 microservices vers AWS EKS, IaC Terraform, GitOps ArgoCD, observabilité et SLO, conformité DORA." },
          { poste: 'Ingénieur DevOps', entreprise: 'Paylane', secteur: 'Paiement / Fintech', debut: '2020-06', fin: '2023-02', type: 'cdi',
            technos: ['AWS', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'Docker', 'Python'],
            description: "Plateforme Kubernetes de traitement des paiements carte, automatisation Terraform/Ansible, conformité PCI-DSS." },
          { poste: 'Administrateur systèmes Linux', entreprise: 'Assurances Méridien', secteur: 'Assurance', debut: '2017-09', fin: '2020-05', type: 'cdi',
            technos: ['Linux', 'Ansible', 'VMware', 'Bash'], description: "Administration de 600 serveurs Linux, automatisation Ansible." },
          { poste: 'Technicien support N2', entreprise: 'Infogérance Delta', secteur: 'ESN / Services IT', debut: '2015-09', fin: '2017-08', type: 'cdi',
            technos: ['Windows', 'Active Directory'], description: "Support utilisateurs et postes de travail." }
        ],
        competences: ['Vault', 'Helm', 'Loki'],
        certifications: ['CKA – Certified Kubernetes Administrator (2022)', 'AWS Solutions Architect Associate (2021)', 'HashiCorp Terraform Associate (2023)'],
        formation: ['Licence pro Administration des réseaux – IUT de Villetaneuse (2015)'],
        langues: ['Anglais courant (C1)', 'Arabe'],
        cvText: CV_KARIM
      },
      {
        id: 'cand-sm', prenom: 'Sophie', nom: 'Marchand', titre: 'Ingénieure Cloud & DevOps',
        statut: 'salarie', cout: 480, salaire: 62000, dispo: '2027-02-01', ville: 'Lyon (69), mobile Paris',
        email: 'sophie.marchand@mail.example', tel: '07 22 33 44 55', pipeline: 'qualifier',
        experiences: [
          { poste: 'Cloud Engineer', entreprise: 'Groupe Hospitalier Vallée', secteur: 'Santé', debut: '2024-02', fin: null, type: 'cdi',
            technos: ['GCP', 'GKE', 'Kubernetes', 'Terraform', 'GitLab CI', 'Python', 'Prometheus', 'Grafana'],
            description: "Hébergement HDS sur GCP, clusters GKE, Terraform, pipelines GitLab CI." },
          { poste: 'Ingénieure DevOps', entreprise: "Distrib'Plus", secteur: 'Retail / E-commerce', debut: '2020-09', fin: '2024-01', type: 'cdi',
            technos: ['Azure', 'AKS', 'Kubernetes', 'Terraform', 'Azure DevOps', 'Ansible', 'Docker'],
            description: "Plateforme e-commerce sur Azure AKS, gestion des pics de charge." },
          { poste: "Ingénieure d'exploitation", entreprise: 'Nuvo Hébergement', secteur: 'Hébergement / Cloud', debut: '2017-01', fin: '2020-08', type: 'cdi',
            technos: ['OpenStack', 'Linux', 'Ansible', 'Docker', 'Kubernetes'], description: "Cloud privé OpenStack, premiers clusters Kubernetes." },
          { poste: 'Ingénieure système & Cloud', entreprise: "Banque Coopérative de l'Ouest", secteur: 'Banque / Finance', debut: '2013-03', fin: '2016-12', type: 'cdi',
            technos: ['AWS', 'Linux', 'Puppet', 'Jenkins', 'Bash'], description: "Premiers déploiements AWS (EC2, S3), industrialisation Puppet." },
          { poste: 'Développeuse Java', entreprise: 'Industries Rhône', secteur: 'Industrie', debut: '2009-09', fin: '2013-02', type: 'cdi',
            technos: ['Java', 'Oracle', 'SQL'], description: "Applications de gestion de production." }
        ],
        competences: [],
        certifications: ['Google Professional Cloud Architect (2024)', 'Microsoft Azure Administrator AZ-104 (2021)'],
        formation: ["Diplôme d'ingénieur informatique – INSA Lyon (2009)"],
        langues: ['Anglais professionnel (B2)'],
        cvText: CV_SOPHIE
      },
      {
        id: 'cand-lp', prenom: 'Lucas', nom: 'Petit', titre: 'Ingénieur DevOps',
        statut: 'freelance', cout: 420, dispo: '2026-11-16', ville: 'Nanterre (92)',
        email: 'lucas.petit@mail.example', tel: '06 55 44 33 22', pipeline: 'qualifier',
        experiences: [
          { poste: 'Ingénieur DevOps', entreprise: 'Agence Pixelia', secteur: 'Agence web / Digital', debut: '2025-04', fin: null, type: 'freelance',
            technos: ['Kubernetes', 'Scaleway', 'GitLab CI', 'Docker', 'Linux'], description: "Clusters Kubernetes k3s chez Scaleway, pipelines GitLab CI." },
          { poste: 'Développeur DevOps', entreprise: 'Shopnest', secteur: 'Retail / E-commerce', debut: '2023-09', fin: '2025-03', type: 'cdi',
            technos: ['AWS', 'Terraform', 'GitHub Actions', 'Docker', 'Python'], description: "Déploiements AWS (ECS, EC2), premiers modules Terraform." },
          { poste: 'Développeur Python (alternance)', entreprise: 'Shopnest', secteur: 'Retail / E-commerce', debut: '2021-09', fin: '2023-08', type: 'alternance',
            technos: ['Python', 'Django', 'PostgreSQL'], description: "API Python et scripts d'automatisation." }
        ],
        competences: [],
        certifications: [],
        formation: ['Master Cloud Computing (alternance) – EFREI Paris (2023)'],
        langues: ['Anglais intermédiaire (B1)'],
        cvText: CV_LUCAS
      }
    ]
  };
}
