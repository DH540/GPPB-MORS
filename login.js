///LOGIN MODAL FIXED - REMOVED OTP VERIFICATION FROM LOGIN PAGE
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
const contactFormDB = firebase.database().ref("contactFormDB");

document.addEventListener('DOMContentLoaded', () => {
    try {
        emailjs.init('mvAsUuvZ88Zbzp_q0');
        console.log('EmailJS initialized successfully');
    } catch (error) {
        console.error('EmailJS initialization error:', error);
    }

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(button => {
        button.addEventListener('click', () => {
            timeSlots.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submission started');

        try {
            const formData = {
                firstName: this.querySelector('input[placeholder="First Name"]').value,
                lastName: this.querySelector('input[placeholder="Last Name"]').value,
                jobPosition: this.querySelector('input[placeholder="Position"]').value,
                email: this.querySelector('input[placeholder="johndoe@example.com"]').value,
                phoneNumber: this.querySelector('input[placeholder="+63"]').value + ' ' +
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
            const dbResponse = await contactFormDB.push({
                ...formData,
                timestamp: Date.now()
            });

            sessionStorage.setItem('consultationData', JSON.stringify(formData));
            window.location.href = './receipt.html';

        } catch (error) {
            console.error('Detailed error information:', error);
            alert('There was an error processing your consultation request. Please try again. Error: ' + error.message);
        }
    });

    const validUsername = "dhsalazar811@gmail.com";
    const validPassword = "012345";

    const loginButton = document.getElementById("button-login");
    const message = document.getElementById("message");

    loginButton.addEventListener("click", async () => {
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const username = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            message.style.color = "orange";
            message.textContent = "Please enter both username and password.";
            return;
        }

        if (username === validUsername && password === validPassword) {
            message.style.color = "green";
            message.textContent = "Login successful! Sending OTP...";

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const sanitizedEmail = username.replace('.', ',');

            await firebase.database().ref("adminOtps").child(sanitizedEmail).set({
                otp,
                timestamp: Date.now()
            });

            try {
                await emailjs.send('service_yl0b9tl', 'template_4mpn41n', {
                    email: username,
                    otp_code: otp
                });

                sessionStorage.setItem("adminEmail", username);
                window.location.href = "verify.html";

            } catch (error) {
                console.error("Error sending OTP email:", error);
                message.style.color = "red";
                message.textContent = "Failed to send OTP. Please try again.";
            }

        } else {
            message.style.color = "red";
            message.textContent = "Invalid username or password.";
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            loginButton.click();
        }
    });

    document.getElementById("admin-login-form").addEventListener("submit", (event) => {
        event.preventDefault();
    });
});