/// LOGIN MODAL FIXED - USING FIREBASE AUTH

const firebaseConfig = {
    apiKey: "AIzaSyBEJMTq5PQNrwDELbuqGfIFGFxJ3S-ke_Q",
    authDomain: "css151l-6290e.firebaseapp.com",
    databaseURL: "https://css151l-6290e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "css151l-6290e",
    storageBucket: "css151l-6290e.firebasestorage.app",
    messagingSenderId: "907702008183",
    appId: "1:907702008183:web:9dbb807a3db2e2958bc972"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const contactFormDB = db.ref("contactFormDB");

document.addEventListener('DOMContentLoaded', () => {
    try {
        emailjs.init('mvAsUuvZ88Zbzp_q0');
    } catch (error) {
        console.error('EmailJS init error:', error);
    }

    // Handle consultation form (if present)
    const form = document.querySelector('form');
    if (form && form.id !== "admin-login-form") {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            try {
                const formData = {
                    firstName: this.querySelector('input[placeholder="First Name"]').value,
                    lastName: this.querySelector('input[placeholder="Last Name"]').value,
                    jobPosition: this.querySelector('input[placeholder="Position"]').value,
                    email: this.querySelector('input[placeholder="johndoe@example.com"]').value,
                    phoneNumber:
                        this.querySelector('input[placeholder="+63"]').value +
                        ' ' +
                        this.querySelector('input[placeholder="91234567890"]').value,
                    company: this.querySelector('input[placeholder="Company Name"]').value,
                    consultationInterest: this.querySelectorAll('input[type="text"]')[4].value,
                    appointmentDate: this.querySelector('input[type="date"]').value,
                    appointmentTime: document.querySelector('.time-slot.selected')?.textContent || '',
                    additionalInfo: this.querySelector('textarea').value
                };

                const emailParams = {
                    from_name: 'GPPB-TSO',
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    appointmentDate: formData.appointmentDate,
                    appointmentTime: formData.appointmentTime,
                    consultationInterest: formData.consultationInterest
                };

                await emailjs.send('service_yl0b9tl', 'template_4mpn41n', emailParams);
                await contactFormDB.push({ ...formData, timestamp: Date.now() });

                sessionStorage.setItem('consultationData', JSON.stringify(formData));
                window.location.href = './receipt.html';

            } catch (error) {
                console.error('Form error:', error);
                alert('Error: ' + error.message);
            }
        });
    }

    // Admin login
    const loginButton = document.getElementById("button-login");
    const message = document.getElementById("message");

    loginButton?.addEventListener("click", async () => {
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            message.style.color = "orange";
            message.textContent = "Please enter both email and password.";
            return;
        }

        const auth = firebase.auth();
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            sessionStorage.setItem("adminEmail", email);
            message.style.color = "green";
            message.textContent = "Login successful!";
            window.location.href = "inbox.html"; // or wherever you want to redirect
        } catch (error) {
            console.error("Auth error:", error);
            message.style.color = "red";
            message.textContent = "INVALID EMAIL OR PASSWORD. Please try again."; ;
        }
    });

    // Allow Enter key to trigger login
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            loginButton?.click();
        }
    });

    document.getElementById("admin-login-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
    });
});
