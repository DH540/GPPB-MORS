// systems.js

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBEJMTq5PQNrwDELbuqGfIFGFxJ3S-ke_Q",
    authDomain: "css151l-6290e.firebaseapp.com",
    databaseURL: "https://css151l-6290e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "css151l-6290e",
    storageBucket: "css151l-6290e.firebasestorage.app",
    messagingSenderId: "907702008183",
    appId: "1:907702008183:web:9dbb807a3db2e2958bc972"
};

// Initialize Firebase (guard against reinitialization)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Show account email in <span id="account-email">
document.addEventListener("DOMContentLoaded", () => {
    const emailSpan = document.getElementById("account-email");
    const auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
        if (emailSpan) {
            if (user) {
                emailSpan.textContent = user.email;
                sessionStorage.setItem("adminEmail", user.email);
            } else {
                emailSpan.textContent = "Not signed in";
                sessionStorage.removeItem("adminEmail");
            }
        }
    });
});
