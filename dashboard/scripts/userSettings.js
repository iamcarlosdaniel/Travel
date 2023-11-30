var firstNameField = document.getElementById('firstNameSettingsForm');
var lastNameField = document.getElementById('lastNameSettingsForm');
var emailField = document.getElementById('emailSettingsForm');
var usernameField = document.getElementById('usernameSettingsForm');

const toastWarning = bootstrap.Toast.getOrCreateInstance(document.getElementById("toastWarning"));

function obtenerUbicacion() {
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


