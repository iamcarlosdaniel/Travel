// Obtiene una referencia a la base de datos Firestore
const db = firebase.firestore();

let userUid; // Variable global para almacenar el UID del usuario

firebase.auth().onAuthStateChanged((user)=>{
    if(!user){
        location.replace("index.html")
    }else{
        userUid = user.uid; // Almacena el UID del usuario
        document.getElementById("username").innerHTML = "Hello, "+user.email + "<br>" + user.uid;

        //Mostrar Tareas
        displayTasks();
    }
})

function logout(){
    firebase.auth().signOut()
}

function addTask() {
    const taskInput = document.getElementById('task');
    const task = taskInput.value;

    // Asegúrate de que la tarea no esté vacía
    if (task.trim() !== '') {
        // Crea una referencia al documento del usuario
        const userRef = db.collection('users').doc(userUid);

        // Agrega la tarea a la colección 'tasks' con la referencia al usuario
        db.collection('tasks').add({
            task: task,
            usuario: userRef // Utiliza la referencia al documento del usuario
        })
        .then(function(docRef) {
            console.log("Tarea agregada con ID: ", docRef.id);
            // Limpiar el campo de entrada después de agregar la tarea
            taskInput.value = '';
        })
        .catch(function(error) {
            console.error("Error al agregar tarea: ", error);
        });
    }
}


        // Función para mostrar las tareas en la lista
        // Función para mostrar las tareas en la lista
function displayTasks() {
    const taskList = document.getElementById('taskList');

    // Limpia la lista antes de volver a cargar las tareas
    taskList.innerHTML = '';

    // Obtiene todas las tareas de la colección 'tasks' filtradas por el UID del usuario
    const userRef = db.collection('users').doc(userUid);

    db.collection('tasks').where('usuario', '==', userRef).get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            console.log(doc.id, " => ", doc.data());
            const task = doc.data().task;
            const li = document.createElement('li');
            li.textContent = task;
            taskList.appendChild(li);
        });
    })
    .catch(function(error) {
        console.error("Error al obtener tareas: ", error);
    });

}