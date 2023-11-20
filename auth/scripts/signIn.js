// Seleccionar el formulario por su id ("loginForm")
document.getElementById("signInForm").addEventListener("submit", (event) => {
    // Prevenir el comportamiento predeterminado del formulario (no recargar la página)
    event.preventDefault();
    // Puedes agregar acciones personalizadas aquí antes de que el formulario se envíe
    // Por ejemplo, validar los datos del formulario con JavaScript
});


firebase.auth().onAuthStateChanged((user)=>{
      if(user){
          location.replace("../welcome/principal.html")
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
