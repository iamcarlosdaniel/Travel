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
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}




function logout(){
    firebase.auth().signOut()
}

