import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// Initialisation de la scène, de la caméra et de l'écouteur audio
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;
camera.position.y = 2;
const listener = new THREE.AudioListener();
camera.add(listener);

// Initialisation du rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles des zooms et déplacements
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.zoomToCursor = true;
controls.screenSpacePanning = false;
controls.enableRotate = false;

// Création du monde physique
const world = new CANNON.World();
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.gravity.set(0, -2, 0);
world.addBody(groundBody);

/*
    Variables : 
    - bonesGroup : Groupe d'os chargé depuis le fichier OBJ
    - selectedBoneIndex : Indice de l'os actuellement sélectionné
    - previousBone : Os précédemment sélectionné
    - clock : Horloge pour l'animation de clignotement
    - oscillationSpeed : Vitesse de clignotement
    - score : Score actuel
    - bonesOrder : Ordre aléatoire des os
    - elements : Tableau des éléments de la scène
    - mixer : Mixer pour les animations
    - raycaster : Raycaster pour les interactions avec la souris
    - mouse : Vecteur pour la position de la souris
    - buttonGeometry : Géométrie des boutons QCM
    - buttonMaterial : Matériau des boutons QCM
    - buttonMeshes : Meshes des boutons QCM
    - successSound : Son de succès
    - wrongSound : Son d'erreur
*/
let bonesGroup = new THREE.Group();
let selectedBoneIndex = 0;
let previousBone = null;
let clock = new THREE.Clock();
let oscillationSpeed = 5;
let score = 0;
let bonesOrder = [];
let elements = [];
let mixer;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const buttonGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.05);
const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
let buttonMeshes = [];
let successSound;
let wrongSound;
let gameStarted = false;


/*
    Fonctions : 
    - onMouseClick : Fonction pour gérer les clics de souris
        - event : Événement de clic de souris
    - handleObjectClick : Fonction pour gérer les clics sur les objets
        - object : Objet cliqué
    - createQCMButtons : Créer les boutons QCM pour les réponses
    - createTextTexture : Créer une texture de texte pour les boutons QCM
        - text : Texte à afficher sur le bouton
    - updateButtonLabels : Mettre à jour les labels des boutons QCM
        - labels : Labels des boutons
    - shuffleArray : Mélanger un tableau
        - array : Tableau à mélanger
    - generateBonesOrder : Générer un ordre aléatoire des os
    - nextBone : Passer à l'os suivant
    - animateColor : Animer la couleur d'un objet
        - object : Objet à animer
    - checkAnswer : Vérifier la réponse de l'utilisateur
        - button : Bouton cliqué
    - fillQCMButtons : Remplir les boutons QCM avec les réponses
    - triggerSuccessAnimation : Déclencher l'animation de succès
        - bone : Os à animer
    - getBoneBoundingBoxCenter : Obtenir le centre de la boîte englobante d'un os
        - bone : Os à analyser
    - triggerExplosionAnimation : Déclencher l'animation d'explosion
        - bone : Os à animer
    - addPhysicalBody : Ajouter un corps physique à un objet
        - object : Objet à analyser
        - mass : Masse de l'objet
    - createPhysicalPiece : Créer un morceau physique
        - piece : Morceau à analyser
        - vecSize : Taille du morceau
    - removeOldElements : Supprimer les anciens éléments de la scène
    - moveCameraToBone : Déplacer la caméra vers un os
        - bone : Os à analyser
*/
function onMouseClick(event) {
    if (!gameStarted) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        handleObjectClick(object);
    }
}

function handleObjectClick(object) {
    console.log('Objet cliqué:', object.name);

    if (object.name.startsWith('qcmButton')) {
        const index = parseInt(object.name.replace('qcmButton', ''));
        checkAnswer(buttonMeshes[index]);
        nextBone();
    }
    else if (object.name == "Enchufe") {
        if (pointLight2.intensity == 0) {
            pointLight2.intensity = 500;
            pointLight.intensity = 5;
        }
        else {
            pointLight2.intensity = 0;
            pointLight.intensity = 1;
        }
    }

    else if (object.name == "porte") {
        if (object.rotation.y == 0) {
            object.rotation.y = Math.PI / 2;
            object.position.x = (object.position.x - 780);
            object.position.z = (object.position.z - 235);
            // J'ai du hardcoder parce que la porte tourne autour du centre de la carte et pas de elle meme
        }
        else {
            object.rotation.y = 0;
            object.position.x = (object.position.x + 780);
            object.position.z = (object.position.z + 235);
        }
    }

    else if (object.name == "Enchufe.3") {       //Skip to last bone (for debugging)
        selectedBoneIndex = bonesOrder.length - 1;
        nextBone();
    }
}

function createQCMButtons() {
    if(!gameStarted) return;
    for (let i = 0; i < 2; i++) {
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial.clone());
        buttonMesh.rotation.y = Math.PI / 2;
        let z = -1.5 + i * 1.3;
        z = Math.round(z * 100) / 100;
        buttonMesh.position.set(-2.9, 1.2, z);
        buttonMesh.name = `qcmButton${i}`;
        buttonMeshes.push(buttonMesh);
        scene.add(buttonMesh);
    }
    for (let i = 2; i < 4; i++) {
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial.clone());
        buttonMesh.rotation.y = Math.PI / 2;
        let z = -1.5 + (i - 2) * 1.3;
        z = Math.round(z * 100) / 100;
        buttonMesh.position.set(-2.9, 1.8, z);
        buttonMesh.name = `qcmButton${i}`;
        buttonMeshes.push(buttonMesh);
        scene.add(buttonMesh);
    }
}

function createTextTexture(text) {
    text = text.toUpperCase();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.font = 'bold 20px Arial';
    //retour a la ligne si le texte est trop long
    if (text.length > 36) {
        //baisser la police et separer en deux a l'espace le plus proche a gauche
        context.font = 'bold 15px Arial';
        let text1 = text.substring(0, text.lastIndexOf(' ', 20));
        let text2 = text.substring(text.lastIndexOf(' ', 20) + 1);
        context.fillText(text1, 10, 25);
        context.fillText(text2, 10, 55);
    }
    else if (text.length > 18) {
        //separer en deux a l'espace le plus proche a gauche
        let text1 = text.substring(0, text.lastIndexOf(' ', 18));
        let text2 = text.substring(text.lastIndexOf(' ', 18) + 1);
        context.fillText(text1, 10, 25);
        context.fillText(text2, 10, 55);
    }
    else {
        context.fillText(text, 10, 40);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function updateButtonLabels(labels) {
    buttonMeshes.forEach((buttonMesh, index) => {
        const textTexture = createTextTexture(labels[index]);
        buttonMesh.material.map = textTexture;
        buttonMesh.material.needsUpdate = true;
        buttonMesh.name += labels[index];
    });
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateBonesOrder = () => {
    bonesOrder = [...Array(bonesGroup.children.length).keys()];
    bonesOrder = shuffleArray(bonesOrder);
    selectedBoneIndex = 0;
};

const nextBone = () => {
    if (bonesGroup && bonesOrder.length > 0) {
        // Réinitialiser la couleur de l'os précédent
        if (previousBone) {
            previousBone.material.color.setHex(0xffffff);
            previousBone.material.emissive.setHex(0x000000);
            previousBone.material.emissiveIntensity = 0;
        }

        const nextObject = bonesGroup.children[bonesOrder[selectedBoneIndex]];
        if (nextObject && nextObject.geometry) {
            nextObject.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xff0000),
                metalness: 0.6,
                roughness: 0.3,
                emissive: new THREE.Color(0x220000),
                emissiveIntensity: 0.5
            });

            previousBone = nextObject;

            // Fin de la partie
            console.log('selectedBoneIndex:', selectedBoneIndex);
            if (selectedBoneIndex >= bonesOrder.length - 1) {
                console.log('Tous les os ont été passés!');
                document.getElementById('restart').style.display = 'block';
                camera.position.z = 3;
                camera.position.y = 2;
                camera.position.x = 0;
                controls.target.set(0, 0, 0);
                controls.update();
                controls.enableRotate = false;
                controls.enableZoom = false;
                buttonMeshes.forEach(buttonMesh => {
                    buttonMesh.visible = false;
                });

                // Démarrer l'animation de danse
                if (mixer) {
                    const action = mixer.clipAction(bonesGroup.animations[0]);
                    action.play();
                }
                else {
                    console.error('Le mixer n\'a pas été défini.');
                }
            }
            else {
                fillQCMButtons();
                moveCameraToBone(nextObject);
            }
        }
        selectedBoneIndex++;

    }
};

const animateColor = (object) => {
    const time = clock.getElapsedTime();
    const minRed = 0.5;
    const maxRed = 1.0;
    const redValue = minRed + (Math.sin(time * oscillationSpeed) + 1) / 2 * (maxRed - minRed);
    const color = new THREE.Color(redValue, 0, 0);
    object.material.color.set(color);
    object.material.emissive.set(color);
    object.material.emissiveIntensity = redValue * 0.5;
};

const checkAnswer = (button) => {
    if (!previousBone) return;

    const correctAnswer = previousBone.name;
    const userAnswer = button.name;

    if (userAnswer.includes(correctAnswer)) {
        console.log('Bonne réponse!');
        score++;
        triggerSuccessAnimation(previousBone);
        document.getElementById('score').innerHTML = `Score: ${score}`;
    } else {
        console.log('Mauvaise réponse! La bonne réponse était:', correctAnswer);
        console.log('Votre réponse était:', userAnswer);
        triggerExplosionAnimation(previousBone);
        document.getElementById('score').innerHTML = `Score: ${score}`;
    }
};

const fillQCMButtons = () => {
    if (!previousBone) return;

    const correctAnswer = previousBone.name;

    // Sélectionner 3 autres os aléatoires pour les réponses
    let otherBones = bonesGroup.children.filter(bone => bone !== previousBone);
    otherBones = otherBones.sort(() => 0.5 - Math.random()).slice(0, 3);

    const otherAnswers = otherBones
        .filter(bone => bone.geometry && bone.name !== correctAnswer && bone.name !== undefined)
        .map(bone => bone.name);

    // Mélanger la bonne réponse avec les 3 autres
    const allAnswers = [correctAnswer, ...otherAnswers].sort(() => 0.5 - Math.random());

    updateButtonLabels(allAnswers);
};

const triggerSuccessAnimation = (bone) => {
    if (!bone) return;

    // Jouer le son de succès
    if (successSound) {
        successSound.play();
    }

    let startTime = performance.now();
    const duration = 1000; // Durée d'animation en millisecondes (1 seconde)

    const animateBone = () => {
        const elapsedTime = performance.now() - startTime;

        if (elapsedTime < duration) {
            const greenValue = Math.sin(elapsedTime / 100 * Math.PI * 2) * 0.5 + 0.5;
            bone.material.color.setRGB(0, greenValue, 0); // Osciller en vert
            bone.material.emissive.setRGB(0, greenValue, 0);
            bone.material.emissiveIntensity = 0.5;

            requestAnimationFrame(animateBone);

        } else {
            bone.material.color.setHex(0xffffff);
            bone.material.emissive.setHex(0x000000);
            bone.material.emissiveIntensity = 0;
        }
    };

    requestAnimationFrame(animateBone);
};

const getBoneBoundingBoxCenter = (bone) => {
    if (!bone.geometry) {
        console.error("L'os n'a pas de géométrie définie.");
        return new THREE.Vector3(0, 0, 0);
    }

    bone.geometry.computeBoundingBox();
    const boundingBox = bone.geometry.boundingBox;
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    bone.localToWorld(center);

    return center;
};

const triggerExplosionAnimation = (bone) => {
    const numPieces = 10;
    const explosionForce = 1;
    const bonePosition = new THREE.Vector3();
    bonePosition.copy(getBoneBoundingBoxCenter(bone));

    const pieces = [];
    const pieceSize = 0.05;

    bone.visible = false;

    if (wrongSound) {
        wrongSound.play();
    }

    for (let i = 0; i < numPieces; i++) {
        const vecSize = new CANNON.Vec3(Math.random() * pieceSize, Math.random() * pieceSize, Math.random() * pieceSize);
        const geometry = new THREE.BoxGeometry(vecSize.x, vecSize.y, vecSize.z);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const piece = new THREE.Mesh(geometry, material);
        piece.position.copy(bonePosition);
        scene.add(piece);

        // Corps physique pour chaque morceau
        const pieceBody = createPhysicalPiece(piece, vecSize);

        const force = new CANNON.Vec3(
            (Math.random() - 0.5) * explosionForce,
            (Math.random() - 0.5) * explosionForce,
            (Math.random() - 0.5) * explosionForce
        );
        pieceBody.applyImpulse(force, pieceBody.position);

        pieces.push({ mesh: piece, body: pieceBody });
    }

    elements.push(...pieces);

    if (elements.length > 100) {
        removeOldElements();
    }

    const animatePieces = () => {
        pieces.forEach((piece) => {
            piece.mesh.position.copy(piece.body.position);
            piece.mesh.quaternion.copy(piece.body.quaternion);
        });

        world.step(1 / 60);
        requestAnimationFrame(animatePieces);
    };

    animatePieces();
};

const addPhysicalBody = (object, mass = 0) => {
    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const body = new CANNON.Body({
        mass: mass,
        position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
        shape: shape
    });
    world.addBody(body);
    return body;
};

const createPhysicalPiece = (piece, vecSize) => {
    const pieceShape = new CANNON.Box(vecSize);
    const pieceBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(piece.position.x, piece.position.y, piece.position.z),
        shape: pieceShape
    });

    world.addBody(pieceBody);
    return pieceBody;
};

const removeOldElements = () => {
    for (let i = 0; i < 10; i++) {
        const oldestElement = elements.shift();
        if (oldestElement) {
            scene.remove(oldestElement.mesh);
            world.removeBody(oldestElement.body);
        }
    }
};

const moveCameraToBone = (bone) => {
    const bonePosition = new THREE.Vector3();
    bonePosition.copy(getBoneBoundingBoxCenter(bone));

    let polarité = 0;
    if (bone.name.includes('RIGHT')) {
        polarité = -0.8;
    }
    else if (bone.name.includes('LEFT')) {
        polarité = 0.8;
    }

    const targetPosition = new THREE.Vector3(
        bonePosition.x + polarité,
        bonePosition.y + 0.2,
        bonePosition.z + 0.8
    );

    const duration = 1;
    let startTime = performance.now();

    const animateCamera = () => {
        let elapsedTime = (performance.now() - startTime) / 1000;
        let t = Math.min(elapsedTime / duration, 1);

        camera.position.lerpVectors(camera.position, targetPosition, t);
        controls.target.lerpVectors(controls.target, bonePosition, t);

        controls.update();

        if (t < 1) {
            requestAnimationFrame(animateCamera);
        }
    };

    animateCamera();
};

// Initialisation des boutons
document.getElementById('restart').style.display = 'none';

/*
    Listeners :
    - help : Listener sur le bouton d'aide
    - close : Listener sur le bouton de fermeture de l'aide
    - click : Listener sur les clic
    - start : Appel des fonctions generateBonesOrder et nextBone pour démarrer la partie
    - restart : Réinitialisation de la partie
    - qcm-container button : Listener sur les boutons QCM pour vérifier la réponse de l'utilisateur
*/
document.getElementById('help').addEventListener('click', () => {
    document.getElementById('help-text').style.display = 'block';
});

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('help-text').style.display = 'none';
});

window.addEventListener('click', onMouseClick, false);

document.getElementById('start').addEventListener('click', () => {
    document.getElementById('start').style.display = 'none';
    controls.enableRotate = true;
    controls.enableZoom = true;
    generateBonesOrder();
    gameStarted = true;
    setTimeout(() => {
        createQCMButtons();
        nextBone();
    }, 100);
});

document.getElementById('restart').addEventListener('click', () => {
    score = 0;
    selectedBoneIndex = 0;
    controls.enableRotate = true;
    controls.enableZoom = true;
    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('restart').style.display = 'none';

    // Afficher tous les os
    bonesGroup.children.forEach(bone => {
        bone.visible = true;
    });

    generateBonesOrder();
    nextBone();

    //Effacer les morceaux d'os de la scène
    elements.forEach(element => {
        scene.remove(element.mesh);
        world.removeBody(element.body);
    });

    buttonMeshes.forEach(buttonMesh => {
        buttonMesh.visible = true;
    });

    if (mixer) {
        mixer.stopAllAction();
    }
    else {
        console.error('Le mixer n\'a pas été défini.');
    }
});

document.querySelectorAll('.qcm-container button').forEach(button => {
    button.addEventListener('click', () => {
        if(!gameStarted) return;
        checkAnswer(button);
        nextBone();
    });
});

// Ajout de lumières
const pointLight = new THREE.PointLight(0xffffff, 5);
pointLight.position.set(0, 1, 0);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 500);
pointLight2.position.set(10, 10, 10);
scene.add(pointLight2);

const spotLightBoard = new THREE.SpotLight(0xffffff, 2);
spotLightBoard.position.set(-2.7, 3, -1.5);
spotLightBoard.target.position.set(-3, 0, -5);
scene.add(spotLightBoard);


// Ajouter des corps physiques pour le squelette
bonesGroup.children.forEach(bone => {
    bone.body = addPhysicalBody(bone, 0);
});

/*
    Loader
    - audioLoader : Loader pour charger des fichiers audio
    - textureLoader : Loader pour charger un background 360
    - loadingManager : Manager pour le chargement des fichiers
    - onProgress : Fonction de progression du chargement
    - onLoad : Fonction de fin de chargement
    - mtlLoader : Loader pour charger le fichier MTL
    - loader : Loader pour charger le fichier OBJ
*/
const audioLoader = new THREE.AudioLoader();

audioLoader.load('./Augmented-Reality/Objects/correct-6033.mp3', (buffer) => {
    successSound = new THREE.Audio(listener);
    successSound.setBuffer(buffer);
    successSound.setLoop(false);
    successSound.setVolume(0.5);
});

audioLoader.load('./Augmented-Reality/Objects/wrong-47985.mp3', (buffer) => {
    wrongSound = new THREE.Audio(listener);
    wrongSound.setBuffer(buffer);
    wrongSound.setLoop(false);
    wrongSound.setVolume(0.5);
});


const textureLoader = new THREE.TextureLoader();
textureLoader.load('./Augmented-Reality/Objects/360.jpg', (texture) => {
    const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
    sphereGeometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
    });

    const sphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(sphere);
});

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (item, loaded, total) => {
    const progress = Math.floor((loaded / total) * 100);
    document.getElementById('loading-progress').textContent = progress;
};

loadingManager.onLoad = () => {
    document.getElementById('loading-screen').style.display = 'none';
};

const mtlLoader = new MTLLoader(loadingManager);
mtlLoader.load('./Augmented-Reality/Objects/colored_map.mtl', (materials) => {
    materials.preload();

    // Charger l'OBJ avec les matériaux
    const objLoader = new OBJLoader(loadingManager);
    objLoader.setMaterials(materials);
    objLoader.load('./Augmented-Reality/Objects/colored_map.obj', (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(0, -0.01, 0);
        scene.add(object);
    });
});


const OBJ_PATH = './Augmented-Reality/Objects/MacarenaDanceASCII.fbx';
// Charger le modèle avec animation
const loader = new FBXLoader(loadingManager);
loader.load(OBJ_PATH, (object) => {
    if (object) {
        object.scale.set(0.13, 0.13, 0.13);
        object.position.set(0, 0, 0);

        bonesGroup = object;
        // Changer le nom des os avec RIGHT et LEFT quand le nom fini par r ou l
        bonesGroup.children.forEach(bone => {
            bone.name = bone.name.replace(/_/g, ' ');
            let boneName = bone.name.slice(0, -1);
            if (bone.name.endsWith('r')) {
                bone.name = `${boneName} RIGHT`;
            } else if (bone.name.endsWith('l')) {
                bone.name = `${boneName} LEFT`;
            }
        });

        scene.add(bonesGroup);

        mixer = new THREE.AnimationMixer(bonesGroup);
    }
},
    undefined,
    (error) => {
        console.error('Erreur lors du chargement du fichier FBX:', error);
    }

);

// Animation de la scène
const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
};

animate();

/*
    Fonction de rendu
    - render : Fonction de rendu de la scène
*/
const render = () => {
    requestAnimationFrame(render);

    if (previousBone) {
        animateColor(previousBone);
    }
    if (controls.enableRotate) {
        controls.update();
    }
    renderer.render(scene, camera);
};

render();

// Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});