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

    function displayUpcomingAppointments() {
        const upcomingAppointmentsDiv = document.getElementById('upcomingAppointments');
        upcomingAppointmentsDiv.innerHTML = ''; // Clear existing appointments
    
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
        database.ref('contactFormDB').once('value', (snapshot) => {
            const consultations = snapshot.val();
            if (consultations) {
                const upcoming = [];
                for (const consultationId in consultations) {
                    const consultation = consultations[consultationId];
                    const appointmentDate = consultation.appointmentDate;
    
                    if (appointmentDate >= currentDateString) {
                        upcoming.push({
                            date: appointmentDate,
                            name: `${consultation.firstName} ${consultation.lastName}`
                        });
                    }
                }
    
                // Sort appointments by date
                upcoming.sort((a, b) => a.date.localeCompare(b.date));
    
                upcoming.forEach(appointment => {
                    const appointmentDiv = document.createElement('div');
                    appointmentDiv.className = 'flex items-center gap-2';
                    appointmentDiv.innerHTML = `<div class="w-3 h-3 bg-blue-500 rounded-full"></div>${appointment.name} (${appointment.date})`;
                    upcomingAppointmentsDiv.appendChild(appointmentDiv);
                });
            } else {
                upcomingAppointmentsDiv.innerHTML = '<p>No upcoming appointments.</p>';
            }
        });
    }

    function updateDateDisplay() {
        const now = new Date();
        const day = now.getDate();
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        const month = monthNames[now.getMonth()];
    
        document.getElementById('dayDisplay').textContent = String(day).padStart(2, '0');
        document.getElementById('monthDisplay').textContent = month;
    }

    updateDateDisplay();
    setInterval(updateDateDisplay, 1000);

    //Realtime updates
    database.ref('contactFormDB').on('value', (snapshot) => {
      calendar.removeAllEvents();
      loadAndAddEvents(calendar);
      displayUpcomingAppointments();
    });

});