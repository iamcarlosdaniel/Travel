// Obtiene una referencia a la base de datos Firestore
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
        getAllListRoutes(userUid);
    }
});

function getUserName(uid) {
    // Referencia a la colección "users"
    var usersRef = firebase.firestore().collection("users");

    // Consulta para obtener el documento correspondiente al UID
    usersRef.where("uid", "==", uid).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // Acceder al campo de nombre de usuario
                var username = doc.data().username;
                console.log("Username:", username);

                // Puedes hacer lo que quieras con el nombre de usuario, por ejemplo, mostrarlo en el DOM
                document.getElementById("username").innerHTML = username;
                document.getElementById('plannedRouteFirstModal').value = "@" + username;
                document.getElementById('plannedRouteSecondModal').value = "@" + username;
                document.getElementById('plannedRouteThirdModal').value = "@" + username;
                document.getElementById('plannedRouteFourthModal').value = "@" + username;

                document.getElementById('loading').classList.add("d-none");
                document.getElementById('dashboard').classList.remove("d-none");
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

function logout(){
    firebase.auth().signOut()
}

function getAllListRoutes(uid) {
    const listAllRoutes = document.getElementById('listAllRoutes');
    const listFeedRoutes = document.getElementById('listFeedRoutes');

    // Limpiamos contenido
    listAllRoutes.innerHTML = '';
    listFeedRoutes.innerHTML = '';

    var routesRef = firebase.firestore().collection("touristRoutes");

    routesRef.where("userRef", "==", firebase.firestore().collection("users").doc(uid)).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var routeData = doc.data();
                //console.log(doc.id);
                var routeId = doc.id;
                var routeName = routeData.name;
                var routeDescription = routeData.description;

                listAllRoutes.innerHTML += `
                <li class="list-group-item">
                    <div class="list-group list-group-horizontal">
                        <div class="list-group-item btn btn-outline-danger d-flex align-items-center justify-content-center" onclick="deleteRoute('${doc.id}')">
                            <i class="bi bi-trash3 fs-5 me-2"></i>
                            Delete
                        </div>
                        <div class="list-group-item list-group-item-action user-select-none" data-bs-toggle="offcanvas" data-bs-target="#routeDetails" aria-controls="offcanvasExample" onclick="viewRoute('${routeId}')">
                            <p class="fs-5 mb-0">${routeName}</p>
                            <p class="mb-1" style="height: 72px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${routeDescription}</p>
                        </div>
                    </div>
                </li?
                `;

                listFeedRoutes.innerHTML += `
                    <div class="list-group-item list-group-item-action" aria-current="true" data-bs-toggle="offcanvas" data-bs-target="#routeDetails" aria-controls="offcanvasExample" onclick="viewRoute('${routeId}')">
                        <div class="d-flex w-100 justify-content-between">
                            <p class="fs-5 mb-1">${routeName}</p>
                            <small class="text-body-secondary">Route designed by me</small>
                        </div>
                        <p class="mb-1 text-truncate overflow-hidden">${routeDescription}</p>
                        <small class="text-body-secondary"><i class="bi bi-clock"></i> Approximately 1-2 hours</small>
                    </div>
                `;   
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}


function deleteRoute(routeId) {
    var routesRef = firebase.firestore().collection("touristRoutes");

    routesRef.doc(routeId).delete()
        .then(() => {
            console.log("Route successfully deleted!");
            // Puedes recargar la lista de rutas después de eliminar la ruta si es necesario
            getAllListRoutes(userUid);

            document.getElementById("toastMessage").innerHTML = "Route deleted successfully";
            toastWarning.show();
        })
        .catch((error) => {
            console.error("Error deleting route: ", error);
        });
}

function viewRoute(routeId) {
    // Referencia a la colección "touristRoutes"
    const routesRef = firebase.firestore().collection("touristRoutes");

    // Limpiar el contenido antes de mostrar la nueva ruta
    document.getElementById('routeNameViewRouteInfo').innerText = "Route Name";
    document.getElementById('routeDescriptionViewRouteInfo').innerText = "";
    document.getElementById('routeRemainingViewRouteInfo').innerHTML = "";
    document.getElementById('routeVisitedViewRouteInfo').innerHTML = "";

    routesRef.doc(routeId).get()
        .then((doc) => {
            if (doc.exists) {
                const routeData = doc.data();
                console.log(routeData);
                const routeName = routeData.name;
                const routeDescription = routeData.description;
                const remainingPlaces = routeData.remainingPlaces || [];
                const visitedPlaces = routeData.visitedPlaces || [];

                // Mostrar la información de la ruta en los elementos HTML
                document.getElementById('routeNameViewRouteInfo').innerText = routeName;
                document.getElementById('routeDescriptionViewRouteInfo').innerText = routeDescription;

                // Mostrar lugares pendientes
                const routeRemainingViewRouteInfo = document.getElementById('routeRemainingViewRouteInfo');
                remainingPlaces.forEach(async (placeId) => {
                    const placeDetails = await getPlaceDetails(placeId);
                    if (placeDetails) {
                        // Resto del código para mostrar la información del lugar
                        routeRemainingViewRouteInfo.innerHTML +=`
                        <li class="list-group-item">
                            <div class="list-group list-group-horizontal">
                                <div class="list-group-item btn btn-outline-primary d-flex align-items-center justify-content-center" onmouseenter="remainingHandleHover(this, true)" onmouseleave="remainingHandleHover(this, false)" onclick="completePlaceHandler('${routeId}', '${placeId}')">
                                    <i class="bi bi-plus-circle fs-5 me-2 iconRouteInfo"></i>
                                    Complete
                                </div>
                                <div class="list-group-item">
                                    <p class="fs-5 mb-0">${placeDetails.placeName}</p>
                                    <p class="mb-1" style="height: 72px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${placeDetails.description}</p>
                                    <a href="" class="icon-link text-decoration-none" data-bs-toggle="modal" data-bs-target="#modalPlaceInformation" onclick="placeDescription('${placeId}')">
                                        Learn more
                                    </a>              
                                </div>
                            </div>
                        </li>
                    `;
                    }
                });

                const routeVisitedViewRouteInfo = document.getElementById('routeVisitedViewRouteInfo');
                // Mostrar lugares visitados
                visitedPlaces.forEach(async (placeId) => {
                    const placeDetails = await getPlaceDetails(placeId);
                    if (placeDetails) {
                        // Resto del código para mostrar la información del lugar
                        routeVisitedViewRouteInfo.innerHTML += `
                        <li class="list-group-item">
                            <div class="list-group list-group-horizontal">
                                <div class="list-group-item btn btn-outline-danger d-flex align-items-center justify-content-center" onmouseenter="visitedHandleHover(this, true)" onmouseleave="visitedHandleHover(this, false)" onclick="incompletePlaceHandler('${routeId}', '${placeId}')">
                                    <i class="bi bi-check2-circle fs-4 me-2 iconRouteInfo"></i>
                                    Finalized
                                </div>
                                <div class="list-group-item">
                                    <p class="fs-5 mb-0">${placeDetails.placeName}</p>
                                    <p class="mb-1" style="height: 72px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${placeDetails.description}</p>
                                    <a href="" class="icon-link text-decoration-none" data-bs-toggle="modal" data-bs-target="#modalPlaceInformation" onclick="placeDescription('${placeId}')">
                                        Learn more
                                    </a>              
                                </div>
                            </div>
                        </li>
                    `;
                    }
                });
            } else {
                console.log("No such document for routeId:", routeId);
            }
        })
        .catch((error) => {
            console.error("Error getting document for routeId:", routeId, error);
        });
}

function getPlaceDetails(placeId) {
    // Referencia a la colección "touristPlaces"
    const placesRef = firebase.firestore().collection("touristPlaces");

    
    return placesRef.doc(placeId).get()
        .then((doc) => {
            if (doc.exists) {
                return doc.data(); // Devuelve los detalles del lugar
            } else {
                console.log("No such document for placeId:", placeId);
                return null;
            }
        })
        .catch((error) => {
            console.error("Error getting document for placeId:", placeId, error);
            return null;
        });
}




function completePlaceHandler(routeId, placeId) {
    completePlace(routeId, placeId);
    // Puedes realizar otras acciones si es necesario
}


async function completePlace(routeId, placeId) {
    const routesRef = firebase.firestore().collection("touristRoutes");

    try {
        // Obtener la ruta actual
        const routeDoc = await routesRef.doc(routeId).get();

        if (routeDoc.exists) {
            const routeData = routeDoc.data();
            console.log(routeData);

            // Verificar si el lugar existe en remainingPlaces
            const remainingIndex = routeData.remainingPlaces.indexOf(placeId);

            if (remainingIndex !== -1) {
                // Eliminar el lugar de remainingPlaces
                routeData.remainingPlaces.splice(remainingIndex, 1);

                // Verificar si visitedPlaces existe, si no, crearlo
                if (!routeData.visitedPlaces) {
                    routeData.visitedPlaces = [];
                }

                // Agregar el lugar a visitedPlaces
                routeData.visitedPlaces.push(placeId);

                // Actualizar la base de datos
                await routesRef.doc(routeId).update({
                    remainingPlaces: routeData.remainingPlaces,
                    visitedPlaces: routeData.visitedPlaces
                });

                console.log("Place marked as completed successfully.");
                viewRoute(routeId);
            } else {
                console.log("Place not found in remainingPlaces.");
            }
        } else {
            console.log("Route not found for routeId:", routeId);
        }
    } catch (error) {
        console.error("Error completing place:", error);
    }
}


function incompletePlaceHandler(routeId, placeId) {
    incompletePlace(routeId, placeId);
    // Puedes realizar otras acciones si es necesario
}


async function incompletePlace(routeId, placeId) {
    const routesRef = firebase.firestore().collection("touristRoutes");

    try {
        // Obtener la ruta actual
        const routeDoc = await routesRef.doc(routeId).get();

        if (routeDoc.exists) {
            const routeData = routeDoc.data();

            // Verificar si el lugar existe en visitedPlaces
            const visitedIndex = routeData.visitedPlaces.indexOf(placeId);
            if (visitedIndex !== -1) {
                // Eliminar el lugar de visitedPlaces
                routeData.visitedPlaces.splice(visitedIndex, 1);

                // Agregar el lugar a remainingPlaces
                routeData.remainingPlaces.push(placeId);

                // Actualizar la base de datos
                await routesRef.doc(routeId).update({
                    remainingPlaces: routeData.remainingPlaces,
                    visitedPlaces: routeData.visitedPlaces
                });

                console.log("Place marked as incomplete successfully.");
                viewRoute(routeId);
            } else {
                console.log("Place not found in visitedPlaces.");
            }
        } else {
            console.log("Route not found for routeId:", routeId);
        }
    } catch (error) {
        console.error("Error marking place as incomplete:", error);
    }
}



function remainingHandleHover(btn, isHoverIn) {
    if (isHoverIn) {
      btn.innerHTML = '<i class="bi bi-check2-circle fs-5 me-2 iconRouteInfo"></i> Complete';
    } else {
      btn.innerHTML = '<i class="bi bi-plus-circle fs-5 me-2 iconRouteInfo"></i> Complete';
    }
}

function visitedHandleHover(btn, isHoverIn) {
    if (isHoverIn) {
      btn.innerHTML = '<i class="bi bi-trash3 fs-4 me-2"></i> Finalized';
    } else {
      btn.innerHTML = '<i class="bi bi-check2-circle fs-4 me-2"></i> Finalized';
    }
}

function placeDescription(placeId) {
    
    const placeNameViewInfo = document.getElementById('placeNameViewInfo');
    const placeDescriptionViewInfo = document.getElementById('placeDescriptionViewInfo');
  
    // Obtén la referencia al lugar específico en la base de datos
    const placeRef = db.collection('touristPlaces').doc(placeId);
  
    // Obtén los datos del lugar específico
    placeRef.get().then((doc) => {
      if (doc.exists) {
        const ratingStars = Array.from({ length: doc.data().rating }, () => '<i class="bi bi-star-fill m-1"></i>').join('');
  
        // Rellena la información del modal con los datos del lugar específico
        placeNameViewInfo.textContent = doc.data().placeName;
        placeDescriptionViewInfo.innerHTML = `
          <img src="${doc.data().images[0]}" alt="" class="w-100">
          <hr>
          <small>Description</small>
          <p>${doc.data().description}</p>
          <div class="col-12 text-center">
            <a href="${doc.data().location}" class="btn btn-outline-primary py-2 mt-4 mb-3" target="_blank"><i class="bi bi-geo-alt-fill"></i> Location</a>
          </div>
        `;
  
        
      } else {
        console.error('Document not found');
      }
    }).catch((error) => {
      console.error('Error getting document:', error);
    });
  }



function showToast() {
    const toastNotAvailable = document.getElementById('toastNotAvailable');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotAvailable)
    toastBootstrap.show()
}

