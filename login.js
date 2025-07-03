///LOGIN MODAL NOT WORKING *CREDENTIALS NOT WORKING*
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

// Reference Firebase database
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
            console.log('Form data collected:', formData);

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
            console.log('Email parameters prepared:', emailParams);

            console.log('Attempting to send email with:', {
                serviceId: 'service_yl0b9tl',
                templateId: 'template_4mpn41n'
            });

            const emailResponse = await emailjs.send(
                'service_yl0b9tl',
                'template_4mpn41n',
                emailParams
            );

            console.log('Email sent successfully:', emailResponse);

            // Save to Firebase
            const dbResponse = await contactFormDB.push({
                ...formData,
                timestamp: Date.now() // Store the time when data is received
            });
            
            console.log("Data saved to Firebase with key:", dbResponse.key);

            // Store data in sessionStorage before redirecting
            sessionStorage.setItem('consultationData', JSON.stringify(formData));
            window.location.href = './receipt.html';

        } catch (error) {
            console.error('Detailed error information:', {
                message: error.message,
                stack: error.stack,
                error: error
            });
            alert('There was an error processing your consultation request. Please try again. Error: ' + error.message);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
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
      message.textContent = "Login successful! Generating OTP...";

      // ✅ Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated OTP:", otp);

      // ✅ Store OTP and email in sessionStorage
      sessionStorage.setItem("generatedOTP", otp);
      sessionStorage.setItem("adminEmail", username);

      try {
        // ✅ Send Email using EmailJS
        await emailjs.send('service_yl0b9tl', 'template_4mpn41n', {
          email: username,
          otp_code: otp
        });

        console.log("OTP email sent successfully!");
        message.style.color = "green";
        message.textContent = "OTP sent! Redirecting to verification page...";

        // ✅ Redirect to verify.html
        setTimeout(() => {
          window.location.href = "verify.html";
        }, 1500);

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

  // ENTER key support
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loginButton.click();
    }
  });

  // Prevent default form submission
  document.getElementById("admin-login-form").addEventListener("submit", (event) => {
    event.preventDefault();
  });
});
