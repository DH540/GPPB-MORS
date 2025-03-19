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
        emailjs.init('GtZXPUDV-aCRQ-MeK');
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
                to_email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                consultationInterest: formData.consultationInterest
            };
            console.log('Email parameters prepared:', emailParams);

            console.log('Attempting to send email with:', {
                serviceId: 'default_service',
                templateId: 'template_1gom91e'
            });

            const emailResponse = await emailjs.send(
                'default_service',
                'template_1gom91e',
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
    const openModalButton = document.getElementById('button-open');
    const closeModalButton = document.getElementById('button-close');
    const modalContainer = document.getElementById('modal-container');

    openModalButton.addEventListener('click', () => {
        modalContainer.classList.add('show');
    });

    closeModalButton.addEventListener('click', () => {
        modalContainer.classList.remove('show');
    });
});
