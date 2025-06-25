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
    
    // Check if the device is mobile based on screen width
    const isMobile = window.innerWidth < 768;

    // Define different header toolbars for mobile and desktop
    const mobileHeaderToolbar = {
        left: 'title',
        center: '',
        right: 'prev,next'
    };
    const desktopHeaderToolbar = {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    };

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        // Use the appropriate header and aspect ratio for the device
        headerToolbar: isMobile ? mobileHeaderToolbar : desktopHeaderToolbar,
        aspectRatio: isMobile ? 1.5 : 2, // Taller aspect ratio for mobile
    });

    calendar.render();

    window.addEventListener('resize', () => {
    const isMobileNow = window.innerWidth < 768;
    calendar.setOption('headerToolbar', isMobileNow ? mobileHeaderToolbar : desktopHeaderToolbar);
    calendar.setOption('aspectRatio', isMobileNow ? 1.5 : 2);
    });

    // Function to load and add events
    function loadAndAddEvents(calendar) {
        database.ref('contactFormDB').once('value', (snapshot) => {
            const consultations = snapshot.val();
            if (consultations) {
                // Clear existing events before adding new ones to prevent duplicates on initial load
                calendar.removeAllEvents();
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
        // Set time to 00:00:00 to include today's appointments
        currentDate.setHours(0, 0, 0, 0);
    
        database.ref('contactFormDB').orderByChild('appointmentDate').startAt(currentDate.toISOString().split('T')[0]).once('value', (snapshot) => {
            const consultations = snapshot.val();
            if (consultations) {
                const upcoming = [];
                for (const consultationId in consultations) {
                    const consultation = consultations[consultationId];
                    upcoming.push({
                        date: consultation.appointmentDate,
                        name: `${consultation.firstName} ${consultation.lastName}`
                    });
                }
    
                // No need to sort here as we are already ordering by date in the Firebase query
    
                upcoming.forEach(appointment => {
                    const appointmentDiv = document.createElement('div');
                    appointmentDiv.className = 'flex items-center gap-2';
                    appointmentDiv.innerHTML = `<div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div><span>${appointment.name} (${appointment.date})</span>`;
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
    // No need for setInterval, as the display will be correct on load.
    // setInterval(updateDateDisplay, 1000); 

    //Realtime updates for when data changes in Firebase
    database.ref('contactFormDB').on('value', (snapshot) => {
      // The 'value' event gives us the entire data set, so we reload everything.
      calendar.removeAllEvents(); // Clear before loading
      loadAndAddEvents(calendar);
      displayUpcomingAppointments();
    });

});