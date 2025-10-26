let map;
let marker;
let watchID;
let deviceId;
let markers = {};

// Configuration Firebase
const firebaseConfig = {
    apiKey: "VOTRE_CLE_FIREBASE",
    authDomain: "votre-projet.firebaseapp.com",
    databaseURL: "https://votre-projet-default-rtdb.firebaseio.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "votre-id",
    appId: "votre-app-id"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Générer un ID unique pour cet appareil s'il n'existe pas
function generateDeviceId() {
    if (!localStorage.getItem('deviceId')) {
        localStorage.setItem('deviceId', 'device_' + Math.random().toString(36).substr(2, 9));
    }
    return localStorage.getItem('deviceId');
}

function initMap() {
    // Options par défaut de la carte
    const defaultPosition = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: defaultPosition
    });

    deviceId = generateDeviceId();
    document.getElementById('deviceIdText').textContent = deviceId;

    // Écouter les mises à jour de position des autres appareils
    database.ref('positions').on('value', (snapshot) => {
        const positions = snapshot.val() || {};
        updateMarkers(positions);
    });

    // Démarrer le suivi de la position
    startTracking();
}

function copyDeviceId() {
    navigator.clipboard.writeText(deviceId);
    alert('ID copié dans le presse-papiers !');
}

function startTracking() {
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        watchID = navigator.geolocation.watchPosition(
            updatePosition,
            handleLocationError,
            options
        );
    } else {
        alert("La géolocalisation n'est pas supportée par votre navigateur");
    }
}

function updatePosition(position) {
    const currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now()
    };

    // Mettre à jour la position dans Firebase
    database.ref('positions/' + deviceId).set(currentPosition);

    // Centrer la carte sur notre position
    if (!map.getCenter().equals(currentPosition)) {
        map.setCenter(currentPosition);
    }
}

function updateMarkers(positions) {
    // Mettre à jour ou créer les marqueurs pour chaque position
    Object.keys(positions).forEach(id => {
        const pos = positions[id];
        
        // Vérifier si la position n'est pas trop vieille (plus de 5 minutes)
        if (Date.now() - pos.timestamp > 300000) {
            if (markers[id]) {
                markers[id].setMap(null);
                delete markers[id];
            }
            return;
        }

        if (!markers[id]) {
            markers[id] = new google.maps.Marker({
                position: { lat: pos.lat, lng: pos.lng },
                map: map,
                title: 'Appareil: ' + id,
                label: id === deviceId ? 'Vous' : 'Autre'
            });
        } else {
            markers[id].setPosition({ lat: pos.lat, lng: pos.lng });
        }
    });
}

function handleLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("L'utilisateur a refusé la demande de géolocalisation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("L'information de localisation n'est pas disponible.");
            break;
        case error.TIMEOUT:
            alert("La demande de localisation a expiré.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Une erreur inconnue s'est produite.");
            break;
    }
}