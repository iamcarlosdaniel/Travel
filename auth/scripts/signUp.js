// Seleccionar el formulario por su id ("loginForm")
document.getElementById("signInForm").addEventListener("submit", (event) => {
    // Prevenir el comportamiento predeterminado del formulario (no recargar la página)
    event.preventDefault();
    // Puedes agregar acciones personalizadas aquí antes de que el formulario se envíe
    // Por ejemplo, validar los datos del formulario con JavaScript
});

function signUp() {
    const firstName = document.getElementById("firstNameSignUpForm").value;
    const lastName = document.getElementById("lastNameSignUpForm").value;
    const email = document.getElementById("emailSignUpForm").value;
    const password = document.getElementById("passwordSignUpForm").value;
    const confirmPassword = document.getElementById("confirmPasswordSignUpForm").value;
    const username = document.getElementById("usernameSignUpForm").value;

    const modalWarning = new bootstrap.Modal(document.getElementById("modalWarning"));
    
    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
        document.getElementById("modalMessage").innerHTML = "Oops! It looks like there's a small hiccup. The passwords you entered don't match. Please double-check and ensure that both entries are identical.";
        modalWarning.show();
        return; // Detener la ejecución si las contraseñas no coinciden
    }

    // Verificar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
        document.getElementById("modalMessage").innerHTML = "Uh-oh! It seems like the password you entered is a bit too short. For security reasons, we require passwords to be at least 8 characters long. Please choose a password that meets this requirement to ensure the safety of your account.";
        modalWarning.show();
        return; // Detener la ejecución si la contraseña es demasiado corta
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuario creado correctamente
            console.log("Usuario creado exitosamente:", userCredential.user);

            // Obtén el uid del nuevo usuario
            const uid = userCredential.user.uid;

            // Guarda los datos del usuario en Firestore
            saveUserDataToFirestore(uid, firstName, lastName, email, username);

            // Puedes agregar más acciones después de guardar los datos en Firestore si es necesario
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function saveUserDataToFirestore(uid, firstName, lastName, email, username) {

    const modalWarning = new bootstrap.Modal(document.getElementById("modalWarning"));
    // Datos del usuario a guardar en Firestore
    const userData = {
        uid: uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username
        // Puedes agregar más campos según tus necesidades
    };
    // Añade los datos del usuario a Firestore
    const db = firebase.firestore();
    db.collection('users').doc(uid).set(userData)
        .then(() => {
            console.log("Datos del usuario guardados en Firestore");
            // Ejemplo de delay de 2000 milisegundos (2 segundos)
            setTimeout(function() {
                // Tu código aquí
                location.replace("../dashboard/dashboard.html")
            }, 2000);
        })
        .catch((error) => {
            console.error("Error al guardar datos en Firestore:", error);
            document.getElementById("modalMessage").innerHTML = "Oops! It appears that something went wrong, and we encountered an unexpected error. Our team has been notified, and we're working hard to resolve the issue as quickly as possible. In the meantime, please try again later.";
            modalWarning.show();
        });
}


