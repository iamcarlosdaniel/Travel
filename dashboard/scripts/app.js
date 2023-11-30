// app.js

// Obtén una referencia a la base de datos Firestore
const db = firebase.firestore();

let userUid; // Variable global para almacenar el UID del usuario

firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        location.replace("../index.html");
    } else {
        userUid = user.uid;
        console.log(userUid);
        // Obtener nombre de usuario desde Firestore
        getUserName(userUid);
        getUserInformation(userUid);
    }
});

// Funciones y variables relacionadas con userSettings.js
var firstNameField = document.getElementById('firstNameSettingsForm');
var lastNameField = document.getElementById('lastNameSettingsForm');
var emailField = document.getElementById('emailSettingsForm');
var usernameField = document.getElementById('usernameSettingsForm');

const toastWarning = bootstrap.Toast.getOrCreateInstance(document.getElementById("toastWarning"));

function obtenerUbicacion() {
    // ...
    // Verificar si el navegador soporta la geolocalización
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          // Obtener la latitud y longitud
          var latitud = position.coords.latitude;
          var longitud = position.coords.longitude;
  
          // Construir la URL de la API de OpenStreetMap para geocodificación inversa
          var apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}`;
  
          // Realizar la solicitud de geocodificación inversa utilizando Fetch API
          fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
              // Imprime la respuesta completa en la consola
              console.log('Respuesta de la API:', data);
  
              // Intenta obtener la ciudad desde la respuesta de la API
              var city = data.address ? data.address.city : "No disponible";
              console.log('Ciudad:', city);
              document.getElementById("userLocation").innerHTML = '<i class="bi bi-geo-alt-fill"></i> ' + city;
            })
            .catch(error => {
              console.error('Error en la solicitud de geocodificación inversa:', error);
            });
        });
      } else {
        console.log('La geolocalización no está disponible en este navegador.');
      }
}

function getUserPlacesVisited() {
    document.getElementById("userPlacesVisited").innerHTML = '<i class="bi bi-map-fill"></i> ' + "210 Places Visited";
}

function getUserInformation(uid) {
    var usersRef = firebase.firestore().collection("users");

    usersRef.where("uid", "==", uid).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {

            var firstName = doc.data().firstName;
            var lastName = doc.data().lastName;
            var email = doc.data().email;
            var username = doc.data().username;

            firstNameField.value = firstName;
            lastNameField.value = lastName;
            emailField.value = email;
            usernameField.value = username;

            console.log("GetUserInformation\n" + firstName+ "\n" + lastName + "\n" + email + "\n" + username);
        })
    })
    .catch((error) => {
        console.log(error);
    })
}

function updateUserInformation() {
    const usersRef = firebase.firestore().collection('users').doc(userUid);

    // Actualiza el campo 'nombre'
    usersRef.update({
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        username: usernameField.value
    })
    .then(() => {
        console.log("Documento actualizado correctamente");
        console.log("UpdateUserInformation\n" + firstNameField.value + "\n" + lastNameField.value + "\n" + emailField.value + "\n" + usernameField.value);

        document.getElementById("toastMessage").innerHTML = "Your information has been updated.";
        toastWarning.show();

    })
    .catch((error) => {
        console.error("Error al actualizar el documento:", error);
    });
}

// Funciones y variables relacionadas con addNewRoute.js
var routeNameFormAddNewRoute = document.getElementById('routeNameFormAddNewRoute');
var routeDescriptionFormAddNewRoute = document.getElementById('routeDescriptionFormAddNewRoute');

let places = [];
var myModal = new bootstrap.Modal(document.getElementById('modalAddNewRouteSummary'));

function getPlaces() {
    console.log("getPlacesOnload");
    const listItem = document.getElementById('listPlacesSecondModal');

    // Referencia a la colección de lugares en Firebase
    const touristPlacesRef = db.collection('touristPlaces');

    // Limpiar contenido previo
    listItem.innerHTML = '';

    // Obtener documentos de la colección
    touristPlacesRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Crear un nuevo elemento de lista
            const listItemElement = document.createElement('li');
            listItemElement.className = 'list-group-item';

            // Rellena el contenido del elemento de lista con los datos del lugar
            listItemElement.innerHTML = `
                <div class="list-group list-group-horizontal">
                    <div class="list-group-item btn btn-outline-primary d-flex align-items-center justify-content-center" onclick="addPlace('${doc.id}')" id="${doc.id}">
                        <i class="bi bi-plus-circle fs-5 me-2"></i>
                        Add
                    </div>
                    <div class="list-group-item">
                        <p class="fs-5 mb-0">${doc.data().placeName}</p>
                        <p class="mb-1">${doc.data().description}</p>
                        <a href="" class="icon-link text-decoration-none" data-bs-toggle="modal" data-bs-target="#modalProfileSettings">
                            Learn more
                        </a>              
                    </div>
                </div>
            `;

            // Agregar el elemento de lista al contenedor
            listItem.appendChild(listItemElement);
        });
    });
}

function addPlace(placeId) {
    // Verificar si el lugar ya está en el array
    if (!places.includes(placeId)) {
        places.push(placeId);

        console.log("Nuevos Items");
        for (let i = 0; i < places.length; i++) {
            console.log(places[i]);
        }

        // Obtener el elemento con el mismo ID que el lugar y actualizar su contenido
        const addButton = document.getElementById(placeId);
        if (addButton) {
            addButton.innerHTML = '<i class="bi bi-check2-circle fs-4 me-2"></i>Added';
        }

        getListMyPlaces();
    } else {
        console.log("El lugar ya está en la lista.");
    }
}

const placeDataCache = {};

function getListMyPlaces() {
    const listItem = document.getElementById('listMyPlacesThridModal');
    listItem.innerHTML = ''; // Limpiar contenido previo

    places.forEach((placeId, index) => {
        // Comprueba si los datos del lugar ya están en el caché
        if (placeDataCache[placeId]) {
            // Si están en el caché, utiliza los datos almacenados en el caché
            renderPlaceMyPlacesSection(index, placeDataCache[placeId]);
        } else {
            // Si no están en el caché, realiza una solicitud a Firebase
            const touristPlacesRef = db.collection('touristPlaces').doc(placeId);

            touristPlacesRef.get().then((doc) => {
                if (doc.exists) {
                    const placeData = doc.data();

                    // Almacena los datos en el caché para futuras referencias
                    placeDataCache[placeId] = placeData;

                    // Utiliza los datos para renderizar el lugar
                    renderPlaceMyPlacesSection(index, placeData);
                } else {
                    console.log('El documento no existe.');
                }
            }).catch((error) => {
                console.error('Error obteniendo documento:', error);
            });
        }
    });
}

function renderPlaceMyPlacesSection(index, placeData) {
    // Crear un nuevo elemento de lista
    const listItemElement = document.createElement('li');
    listItemElement.className = 'list-group-item d-flex align-items-center';

    // Rellenar el contenido del elemento de lista con los datos del lugar
    listItemElement.innerHTML = `
        <div class="btn-group me-2" role="group" aria-label="Basic example">
            <button type="button" class="btn btn-outline-primary btn-lg" onclick="moveListPlace(${index}, 'up')">
                <i class="bi bi-arrow-up-circle"></i>
            </button>
            <button type="button" class="btn btn-outline-primary btn-lg" onclick="moveListPlace(${index}, 'down')">
                <i class="bi bi-arrow-down-circle"></i>
            </button>
        </div>
        <div class="ms-2 me-auto">
            <p class="fs-5 mb-0" style="max-height: 100px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;">${placeData.placeName}</p>
            <p class="mb-0"><i class="bi bi-clock"></i> ${placeData.duration}</p>
        </div>
        <button type="button" class="btn btn-outline-danger btn-lg" onclick="removePlace('${places[index]}')">
            <i class="bi bi-trash3"></i>
        </button>
    `;

    // Agregar el elemento de lista al contenedor
    document.getElementById('listMyPlacesThridModal').appendChild(listItemElement);
}

function removePlace(placeId) {
    // Encuentra la posición del lugar en el array
    const index = places.indexOf(placeId);

    // Si el lugar se encuentra en el array, elimínalo
    if (index !== -1) {
        places.splice(index, 1);

        // Obtener el elemento con el mismo ID que el lugar y actualizar su contenido
        const addButton = document.getElementById(placeId);
        if (addButton) {
            addButton.innerHTML = '<i class="bi bi-plus-circle fs-5 me-2"></i>Add';
        }

        // Vuelve a renderizar la lista
        getListMyPlaces();
    }
}

function moveListPlace(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < places.length) {
        const temp = places[index];
        places[index] = places[newIndex];
        places[newIndex] = temp;
        getListMyPlaces();
    }
}

function saveRoute() {
    // Obtener el usuario autenticado actualmente
    const user = firebase.auth().currentUser;

    // Obtener los valores de los campos de entrada
    const routeName = document.getElementById('routeNameFormAddNewRoute').value;
    const routeDescription = document.getElementById('routeDescriptionFormAddNewRoute').value;

    // Verificar que haya al menos un lugar y que los campos de entrada estén completos
    if (places.length > 0 && routeName.trim() !== '' && routeDescription.trim() !== '') {
        if (user) {
            // Crear una referencia a la colección "touristRoutes"
            const touristRoutesRef = db.collection('touristRoutes');

            // Crear un nuevo documento en "touristRoutes" y obtener su referencia
            const newRouteRef = touristRoutesRef.doc();

            // Obtener el ID del usuario
            const userId = user.uid;

            // Guardar los lugares en el nuevo documento de la ruta
            newRouteRef.set({
                name: routeName,
                description: routeDescription,
                places: places,
                userRef: db.collection('users').doc(userId)
            })
            .then(() => {
                console.log("Ruta guardada exitosamente en Firestore.");

                // Restablecer lugares y campos de entrada
                places = [];
                document.getElementById('routeNameFormAddNewRoute').value = '';
                document.getElementById('routeDescriptionFormAddNewRoute').value = '';

                document.getElementById('listPlacesSecondModal').innerHTML = '';
                document.getElementById('listMyPlacesThridModal').innerHTML = '';

                // Actualizar la interfaz de usuario u realizar otras acciones según sea necesario
                getPlaces();

                // Cierra el modal
                myModal.hide();

                document.getElementById("toastMessage").innerHTML = "Route saved successfully.";
                toastWarning.show();
                // ...

            })
            .catch((error) => {
                console.error("Error al guardar la ruta en Firestore:", error);
            });
        } else {
            console.log("Usuario no autenticado.");
        }
    } else {
        console.log("Debe seleccionar al menos un lugar y completar todos los campos de entrada.");
    }
}

// Funciones y variables relacionadas con carrousel.js
function getCarrouselInformation() {
    const touristPlacesRef = db.collection('touristPlaces');

    // Obtén los documentos de la colección
    touristPlacesRef.get().then((querySnapshot) => {
        const carouselInner = document.getElementById('carousel-inner');

        querySnapshot.forEach((doc) => {
            // Para cada documento, crea un nuevo carrusel-item
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            if (carouselInner.childElementCount === 0) {
                carouselItem.classList.add('active');
            }

            // Rellena el contenido del carrusel-item con los datos del documento
            const ratingStars = Array.from({ length: doc.data().rating }, () => '<i class="bi bi-star-fill m-1"></i>').join('');

            // Rellena el contenido del carrusel-item con los datos del documento
            carouselItem.innerHTML = `
                <div class="card text-bg-dark border-light">
                    <img src="${doc.data().images[0]}" class="card-img w-100" alt="" style="object-fit: cover; height: 230px; filter: brightness(0.5);">
                    <div class="card-img-overlay mx-5">
                        <p class="card-title fs-3 mb-0 text-truncate overflow-hidden">${doc.data().placeName}</p>
                        <p class="card-text">${ratingStars}</p>
                        <p style="max-height: 100px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${doc.data().description}
                        </p>
                        <button class="btn btn-outline-light my-1" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">Learn more</a>
                    </div>
                </div>
            `;

            // Agrega el carrusel-item al carrusel-inner
            carouselInner.appendChild(carouselItem);
        });
    });
}

