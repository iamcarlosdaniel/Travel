//First Modal
var routeNameFormAddNewRoute = document.getElementById('routeNameFormAddNewRoute');
var routeDescriptionFormAddNewRoute = document.getElementById('routeDescriptionFormAddNewRoute');

//Places
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



// Almacena temporalmente los datos de los lugares para evitar múltiples solicitudes a Firebase
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



