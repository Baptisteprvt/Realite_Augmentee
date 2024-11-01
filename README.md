# Skelguessr

## Description du projet
Skelguessr est un jeu éducatif interactif visant à améliorer vos connaissances de l'anatomie osseuse humaine.
Le joueur explore un modèle 3D de l'anatomie humaine et tente d'identifier correctement les os mis en évidence à travers un système de questions à choix multiples (QCM).
Le jeu combine des éléments d'apprentissage et d'amusement pour rendre l'étude de l'anatomie plus engageante et immersive.

## Objectif
L'objectif de ce projet est de créer un outil éducatif interactif utilisant `THREE.js` pour permettre aux utilisateurs d'apprendre l'anatomie humaine de manière ludique.
En utilisant la visualisation 3D, nous visons à rendre l'apprentissage plus intuitif et engageant.
Ce projet se veut une ressource pour les étudiants, les enseignants, ou toute personne souhaitant approfondir ses connaissances en anatomie.

## Mode d'emploi
1. **Démarrage du jeu** : Cliquez sur "Start" pour commencer le jeu. Les contrôles de la caméra seront activés pour vous permettre de visualiser le modèle en 3D.
2. **Répondre aux questions** : Un os sera mis en évidence, et plusieurs réponses seront proposées sous forme de boutons QCM. Cliquez sur le bouton qui correspond à l'os en question. Les boutons sont dans la scène, sur le mur à gauche du squelette.
3. **Points et feedback** : Si vous choisissez la bonne réponse, l'os clignotera en vert et vous gagnerez un point. Sinon, l'os se brisera, et vous passerez au prochain os.
4. **Complétez tous les os** : Continuez jusqu'à ce que vous ayez identifié tous les os. Votre score final sera affiché à la fin du jeu, une animation se lance après avoir passé tous les os.

## Illustration
- Lien de la video de présentation : https://youtu.be/iMDvhn_VX90

## Lien de démo
-

## Membres du groupe
- **Baptiste PREVOT**
- **Todd TAVERNIER**

## Répartition des rôles
- **Développement 3D avec THREE.js** : Baptiste PREVOT
- **UI/UX** : Todd TAVERNIER

## Sources d'inspiration et ressources
- **THREE.js Examples** : Exploration des exemples sur THREE.js (https://threejs.org/examples/).
- **Documentation THREE.js** : Utilisé pour apprendre à utiliser et découvrir les outils disponibles en three.js (https://threejs.org/manual/).
- **Modèles 3D** : Le modèle 3D de la carte est : https://www.cgtrader.com/product/hospital-room-84be45b6-579d-4b24-ab62-8f3e9c394d26 Elle à été legerement modifiée sur Blender (Ajout de porte, changement des couleurs, ...)
                   Le modèle 3D du squelette vient de [ce site] et à été modifié via un script, pour enlever les informations en trop. L'echelle à été modifiée sur l'editeur threejs (https://threejs.org/editor/).

Merci d'avoir essayé Skelguessr !

Petit tips pour s'éviter 206 os : cliquer sur le petit carré vert au dessus du lit passera jusque à la fin et lancera l'animation de fin de partie. C'est une option de debug laissée volontairement pour aider à la correction.
