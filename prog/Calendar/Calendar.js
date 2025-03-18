const firebaseConfig = {
    apiKey: "AIzaSyBEJMTq5PQNrwDELbuqGfIFGFxJ3S-ke_Q",
    authDomain: "css151l-6290e.firebaseapp.com",
    databaseURL: "https://css151l-6290e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "css151l-6290e",
    storageBucket: "css151l-6290e.firebasestorage.app",
    messagingSenderId: "907702008183",
    appId: "1:907702008183:web:9dbb807a3db2e2958bc972"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        aspectRatio: 2,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }
    });

    calendar.render();

    // Function to load and add events
    function loadAndAddEvents(calendar) {
        database.ref('contactFormDB').once('value', (snapshot) => {
            const consultations = snapshot.val();
            if (consultations) {
                for (const consultationId in consultations) {
                    const consultation = consultations[consultationId];
                    const startDateTime = consultation.appointmentDate;
                    const title = `${consultation.firstName} ${consultation.lastName}`;
                    const description = `Email: ${consultation.email}, Phone: ${consultation.phoneNumber}, Job: ${consultation.jobPosition}, Company: ${consultation.company}, Additional Info: ${consultation.additionalInfo}`;

                    calendar.addEvent({
                        title: title,
                        start: startDateTime,
                        description: description,
                    });
                }
            }
        });
    }

    loadAndAddEvents(calendar); // Call the function to load and add events

    //Realtime updates
    database.ref('consultations').on('value', (snapshot) => {
      calendar.removeAllEvents();
      loadAndAddEvents(calendar);
    });

});