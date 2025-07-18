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

function getUnavailableTimesForDate(date) {
    return new Promise((resolve, reject) => {
        contactFormDB.once('value')
            .then(snapshot => {
                const data = snapshot.val();
                const unavailableTimes = [];

                for (let id in data) {
                    const entry = data[id];
                    if (
                        entry.appointmentDate === date &&
                        (entry.status === "approved" || entry.status === "rescheduled")
                    ) {
                        unavailableTimes.push(entry.appointmentTime.trim());
                    }
                }
                resolve(unavailableTimes);
            })
            .catch(reject);
    });
}

function disableUnavailableTimeSlots(unavailableTimes) {
    const timeSlots = document.querySelectorAll('.time-slot');

    timeSlots.forEach(button => {
        const btnText = button.textContent.trim();
        if (unavailableTimes.includes(btnText)) {
            button.classList.add('disabled');
            button.classList.remove('selected');
        } else {
            button.classList.remove('disabled');
        }
    });
}

// Captcha functions
function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

function setCaptcha() {
    window.currentCaptcha = generateCaptcha();
    document.getElementById('captcha-text').textContent = window.currentCaptcha;
    document.getElementById('captchaInput').value = '';
}

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

    const dateInput = document.getElementById('apt');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    dateInput.setAttribute('min', formattedToday);

    dateInput.addEventListener('change', async (e) => {
        const selectedDate = e.target.value.trim();
        if (!selectedDate) return;

        try {
            const unavailableTimes = await getUnavailableTimesForDate(selectedDate);
            disableUnavailableTimeSlots(unavailableTimes);
            console.log('Unavailable times for', selectedDate, ':', unavailableTimes);
        } catch (error) {
            console.error('Error checking unavailable times:', error);
        }
    });

    // Captcha setup
    setCaptcha();
    document.getElementById('refreshCaptcha').addEventListener('click', setCaptcha);

    // Modal functionality
    const captchaModal = document.getElementById('captcha-modal');
    const cancelBtn = document.getElementById('cancel-captcha');
    const verifyBtn = document.getElementById('verify-captcha');

    let pendingFormData = null;

    // Close modal when clicking cancel
    cancelBtn.addEventListener('click', () => {
        captchaModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        pendingFormData = null;
        setCaptcha(); // Reset captcha
    });

    // Close modal when clicking outside
    captchaModal.addEventListener('click', (e) => {
        if (e.target === captchaModal) {
            captchaModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
            pendingFormData = null;
            setCaptcha(); // Reset captcha
        }
    });

    // Handle captcha verification
    verifyBtn.addEventListener('click', async () => {
        const captchaInput = document.getElementById('captchaInput').value.trim();
        if (captchaInput !== window.currentCaptcha) {
            alert('Incorrect Captcha. Please try again.');
            setCaptcha();
            return;
        }

        // Close modal and proceed with form submission
        captchaModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        await processFormSubmission(pendingFormData);
    });

    // Process the actual form submission
    async function processFormSubmission(formData) {
        console.log('Form submission started');

        try {
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

            // Save to Firebase
            const dbResponse = await contactFormDB.push(formData);
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
    }

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
                additionalInfo: this.querySelector('textarea').value,
                status: "Pending"
            };
            console.log('Form data collected:', formData);

            if (!formData.appointmentTime) {
                alert('Please select an available appointment time.');
                return;
            }

            // Store form data and show captcha modal
            pendingFormData = formData;
            setCaptcha(); // Generate new captcha
            document.body.style.overflow = 'hidden'; // Prevent page scrolling
            captchaModal.style.display = 'block';
            document.getElementById('captchaInput').focus();

        } catch (error) {
            console.error('Error collecting form data:', error);
            alert('There was an error processing your form. Please try again.');
        }
    });
});
