// Seleccionar el formulario por su id ("loginForm")
document.getElementById("signInForm").addEventListener("submit", (event) => {
    // Prevenir el comportamiento predeterminado del formulario (no recargar la página)
    event.preventDefault();
    // Puedes agregar acciones personalizadas aquí antes de que el formulario se envíe
    // Por ejemplo, validar los datos del formulario con JavaScript
});


firebase.auth().onAuthStateChanged((user)=>{
      if(user){
          location.replace("../task.html")
      }
 })

 function signIn(){
    const email = document.getElementById("emailSignInForm").value
    const password = document.getElementById("passwordSignInForm").value

    const modalWarning = new bootstrap.Modal(document.getElementById("modalWarning"));

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch((error)=>{
        console.log(error.message);
        document.getElementById("modalMessage").innerHTML = "The email or password you entered is incorrect. Please double-check your information and try again. Remember that passwords are case-sensitive. If you've forgotten your password, you can use the 'Forgot Password' option to reset it.";
        modalWarning.show();
    })
}


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
        })
        .catch((error) => {
            console.error("Error al guardar datos en Firestore:", error);
            document.getElementById("modalMessage").innerHTML = "Oops! It appears that something went wrong, and we encountered an unexpected error. Our team has been notified, and we're working hard to resolve the issue as quickly as possible. In the meantime, please try again later.";
        modalWarning.show();
        });
}

function forgotPass(){
    const email = document.getElementById("emailSignInForm").value;

    const modalWarning = new bootstrap.Modal(document.getElementById("modalWarning"));

    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
        console.log("Correo enviado para el cambio de contrasena");
        document.getElementById("modalMessage").innerHTML = "The request to change your password was sent to the email: " + email;
        modalWarning.show();
    })
    .catch((error) => {
        console.log(error.message);
    });
}
