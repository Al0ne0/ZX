const firebaseConfig = {
    apiKey: "AIzaSyB5du0ZYBobhfVSMaz-3SlUj-_iBew8Q8E",
    authDomain: "chat-zx.firebaseapp.com",
    projectId: "chat-zx",
    storageBucket: "chat-zx.appspot.com",
    messagingSenderId: "795455779249",
    appId: "1:795455779249:web:d3ba5b50e2cce5ea9c4d90",
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Mostrar pantalla de login
document.getElementById('login').style.display = 'block';

// Iniciar sesión con Google
document.getElementById('googleLogin').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        const user = result.user;
        const username = document.getElementById('username').value || user.displayName;
        const country = document.getElementById('country').value || 'US';

        // Guardar usuario en Firestore
        db.collection("users").doc(user.uid).set({
            username: username,
            country: country
        }).then(() => {
            document.getElementById('login').style.display = 'none';
            document.getElementById('chatroom').style.display = 'flex';
            displayMessage(`${username} se ha unido al chat.`, 'system-message');
            loadMessages();
        });
    }).catch((error) => {
        console.error("Error en el inicio de sesión: ", error);
    });
});

// Enviar mensaje
document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    const user = auth.currentUser;

    if (user) {
        db.collection("messages").add({
            username: user.displayName,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            messageInput.value = '';
        });
    }
});

// Cargar mensajes en tiempo real
function loadMessages() {
    db.collection("messages").orderBy("timestamp")
        .onSnapshot((querySnapshot) => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML = ''; // Limpiar mensajes previos
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                displayMessage(`${data.username}: ${data.message}`, 'user-message');
            });
        });
}

// Mostrar mensaje en el chat
function displayMessage(message, className) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar hacia abajo
}

// Salir del chat
document.getElementById('logout').addEventListener('click', () => {
    auth.signOut().then(() => {
        document.getElementById('chatroom').style.display = 'none';
        document.getElementById('login').style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('messageInput').value = '';
        document.getElementById('messages').innerHTML = '';
    });
});
