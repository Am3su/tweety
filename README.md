# Tweety

Outil pour commerciale en ESN : qualifier un besoin client, scorer les CV, piloter la marge (CJM → TJM), préparer l'entretien et envoyer une proposition PDF anonymisée aux couleurs de sa structure.

## Mise en ligne sur GitHub Pages

1. Sur GitHub, créez un dépôt (par exemple `tweety`).
2. Cliquez sur **Add file › Upload files** et glissez tous les fichiers. Validez avec **Commit changes**.
3. Allez dans **Settings › Pages**, choisissez **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Après une à deux minutes, l'outil est disponible à l'adresse `https://<votre-identifiant>.github.io/tweety/`.

L'outil fonctionne aussi en ouvrant simplement `index.html` sur votre ordinateur (la dictée vocale demande en revanche l'adresse https de GitHub Pages).

## Organisation des fichiers

Tous les fichiers sont à la racine du dépôt.

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'application |
| `style.css` | Couleurs, typographie, mise en page |
| `data.js` | Exemple : besoin Crédit Horizon (fictif) et 3 CV |
| `engine.js` | Calculs : durée et récence d'expérience, scores, probabilité, marge, simulation |
| `questions.js` | Banque de questions d'entretien et pistes de réponse |
| `ai.js` | Lecture des fichiers (PDF, Word, e-mail), analyse par mots-clés, IA facultative |
| `store.js` | Enregistrement dans le navigateur, sauvegarde / restauration |
| `ui.js`, `modals.js`, `main.js` | Écrans et actions |
| `export.js` | Génération du PDF de proposition |
| `intro.mp4` | Vidéo d'introduction jouée à l'ouverture (désactivable dans « Mes informations ») |
| `logo.js`, `logo.jpg` | Logo |
| `jspdf.umd.min.js`, `pdf.min.js`, `pdf.worker.min.js`, `mammoth.browser.min.js` | Bibliothèques incluses (création de PDF, lecture de PDF et de Word) |

## Données

Tout est enregistré **dans votre navigateur** (rien n'est envoyé sur GitHub). Utilisez **Mes informations › Sauvegarde de mes données** pour exporter un fichier `.json` régulièrement, ou pour passer sur un autre ordinateur.

## Assistant IA (facultatif)

Sans configuration, les besoins et CV sont analysés par mots-clés. Pour une analyse plus fine, des synthèses rédigées et des questions d'entretien sur-mesure, saisissez une clé API Claude dans **Mes informations › Assistant IA**. La clé reste dans le navigateur et n'est jamais incluse dans les sauvegardes.

## Règles de calcul

- **Récence** : une expérience compte à 100 % pendant 3 ans, puis perd environ 7 % par an (50 % à 10 ans, 20 % minimum au-delà de 15 ans). Les postes sans lien avec les compétences demandées, les alternances et les stages comptent pour moitié.
- **Score d'adéquation** : moyenne pondérée par les curseurs (compétences, expérience, secteur, coût). Une compétence obligatoire absente pénalise le score de 15 %.
- **Coût** : pour un freelance, son TJM est votre CJM. Pour un salarié, CJM ≈ salaire brut annuel × 1,45 ÷ 209 jours.
- **Marge** : taux de marge = (TJM − CJM) ÷ TJM.
- **Probabilité de placement** : adéquation × positionnement prix par rapport au budget × disponibilité × note d'entretien. Le « TJM optimal » maximise l'espérance de marge (marge × probabilité × durée).

Ces estimations sont des aides à la décision, à ajuster avec votre connaissance du client.
