var firstNameField = document.getElementById('firstNameSettingsForm');
var lastNameField = document.getElementById('lastNameSettingsForm');
var emailField = document.getElementById('emailSettingsForm');
var usernameField = document.getElementById('usernameSettingsForm');

var routeUserViewRouteInfo = document.getElementById('routeUserViewRouteInfo');

const toastWarning = bootstrap.Toast.getOrCreateInstance(document.getElementById("toastWarning"));

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

            routeUserViewRouteInfo.value = "@", username;

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


