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

// Reference Firebase database correctly
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

    document.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission started');

        try {
            const formData = {
                firstName: e.target.querySelector('input[placeholder="First Name"]').value,
                lastName: e.target.querySelector('input[placeholder="Last Name"]').value,
                jobPosition: e.target.querySelector('input[placeholder="Position"]').value,
                email: e.target.querySelector('input[placeholder="johndoe@example.com"]').value,
                phoneNumber: e.target.querySelector('input[placeholder="+63"]').value + ' ' +
                            e.target.querySelector('input[placeholder="91234567890"]').value,
                company: e.target.querySelector('input[placeholder="Company Name"]').value,
                consultationInterest: e.target.querySelectorAll('input[type="text"]')[4].value,
                appointmentDate: e.target.querySelector('input[type="date"]').value,
                appointmentTime: document.querySelector('.time-slot.selected')?.textContent || '',
                additionalInfo: e.target.querySelector('textarea').value
            };
            console.log('Form data collected:', formData);


            // Send Email (EmailJS part remains the same)
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

            const emailResponse = await emailjs.send(
                'default_service',
                'template_1gom91e',
                emailParams
            );

            console.log('Email sent successfully:', emailResponse);

            // Save to Firebase
            const dbResponse = await contactFormDB.push(formData);
            console.log("Data saved to Firebase with key:", dbResponse.key);


        } catch (error) {
            console.error('Error during submission:', error);
            alert('There was an error submitting your form. Please try again. Error: ' + error.message);
        }
    });
});
