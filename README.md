# 🦴 Projet jeu QCM sur un modèle de squelette

Ce projet utilise **Three.js** et **Cannon.js** pour créer une scène 3D interactive permettant aux utilisateurs de répondre à un QCM sur le nom des os. Le modèle 3D inclut des animations et des effets physiques pour offrir une expérience d'apprentissage immersive.

## 📋 Fonctionnalités

- **Visualisation 3D** : Le modèle de squelette est affiché en 3D, avec la possibilité de zoomer et de pivoter autour de l'objet.
- **Interactions Utilisateur** : Les utilisateurs peuvent répondre à des questions à choix multiples et obtenir un score basé sur leurs réponses. Les questions qcm sont affichées en fonction de l'os mis en avant.
- **Effets d'Animation** : Lorsqu'un utilisateur se trompe dans sa réponse, des animations et effets visuels sont déclenchés, rendant l'expérience plus engageante.
- **Physique des Objets** : Utilisation de **Cannon.js** pour simuler des interactions physiques avec le modèle (explosions d'os, gravité).

## 🎮 Commandes Utilisateur

### Boutons d'interface

- **JOUER** : Démarre la partie en affichant le modèle et en activant les interactions.
- **SKIP** : Passe à l'os suivant dans le questionnaire, plutôt à but de test.
- **REJOUER** : Réinitialise la partie et le score.

### Interactions avec le modèle

- **Sélection d'os** : Un os est choisit automatiquement après chaque réponse. L'utilisateur doit dire de quel os il s'agit.
- **Réponses aux questions** : L’utilisateur peut choisir la réponse correcte en cliquant sur l'un des boutons de réponse inclu dans la scène.
- **Animations de Réponse** : Réponses correctes et incorrectes déclenchent respectivement une animation de succès et une animation d’explosion de l’os.

## 🛠️ Installation et Dépendances

1. **Prérequis** : Avoir Node.js installé pour utiliser un serveur local. J'ai pour ma part utilisé Live Server sur VS Code pour ce projet.
2. **Installation des packages** : Téléchargez les packages nécessaires pour utiliser Three.js et Cannon.js.

### Frameworks et Librairies Utilisés

- **Three.js** : Pour le rendu 3D, les contrôles, et la manipulation de la scène.
- **Cannon.js** : Pour les effets physiques appliqués aux os et aux objets de la scène.

## 📂 Structure des Fichiers

- **index.html** : Contient la structure HTML, les boutons d'interface utilisateur et le chargement des scripts.
- **script.js** : Script principal qui initialise la scène, les contrôles, et gère les interactions avec les os et les boutons de questions.
- **style.css** : Feuille de style pour la mise en page et le design de l'interface utilisateur.
- **Objects/** : Dossier contenant les modèles 3D, les textures, et les fichiers de configuration pour le chargement des objets.

## 🚀 Démarrage du Projet

1. **Lancer un serveur local** : Servez le projet localement pour éviter les erreurs de chargement de ressources, par exemple avec Live Server sur VS Code.
2. **Accéder à `index.html`** : Ouvrez `index.html` dans votre navigateur.
3. **Jouer au jeu** : Cliquez sur le bouton "JOUER" pour commencer à répondre aux questions et explorer le modèle de squelette.

## ⚙️ Fonctionnalités Techniques

### Initialisation de la Scène et du Modèle

- **Caméra** : Perspective placée à une certaine distance pour une vue d'ensemble du squelette.
- **Contrôles** : **OrbitControls** permet de manipuler la caméra pour voir le modèle sous différents angles.
- **Chargement du modèle** : Utilisation de `OBJLoader` et `MTLLoader` pour charger un modèle OBJ avec des textures.
- **Animation** : Gérée par `AnimationMixer` pour créer des animations. Entre autre une animation de danse à la fin de la partie.

---
**Profitez de votre exploration du squelette !** 🦴