let map;
let marker;
let watchID;

function initMap() {
    // Options par défaut de la carte
    const defaultPosition = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: defaultPosition
    });

    // Démarrer le suivi de la position
    startTracking();
}

function startTracking() {
    if (navigator.geolocation) {
        // Options de géolocalisation
        const options = {
            enableHighAccuracy: true, // Haute précision
            timeout: 5000, // Timeout après 5 secondes
            maximumAge: 0 // Ne pas utiliser de cache
        };

        // Surveiller la position avec une mise à jour toutes les secondes
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
        lng: position.coords.longitude
    };

    // Centrer la carte sur la nouvelle position
    map.setCenter(currentPosition);

    // Créer ou mettre à jour le marqueur
    if (!marker) {
        marker = new google.maps.Marker({
            position: currentPosition,
            map: map,
            title: 'Votre position'
        });
    } else {
        marker.setPosition(currentPosition);
    }

    // Afficher les coordonnées dans la console (pour le débogage)
    console.log(`Position mise à jour : ${position.coords.latitude}, ${position.coords.longitude}`);
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