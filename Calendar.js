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
        // Show only 9:00 AM to 4:00 PM in week/day views (4pm included)
        slotMinTime: '09:00:00',
        slotMaxTime: '17:00:00',
        allDaySlot: false, // <-- Hide all-day row in week/day views
    });

    calendar.render();

    window.addEventListener('resize', () => {
    const isMobileNow = window.innerWidth < 768;
    calendar.setOption('headerToolbar', isMobileNow ? mobileHeaderToolbar : desktopHeaderToolbar);
    calendar.setOption('aspectRatio', isMobileNow ? 1.5 : 2);
    });

    // Function to parse time string to 24-hour format
    function parseTimeTo24Hour(timeStr) {
        // Example input: "2:00 PM"
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
    }

    // Function to load and add events
    function loadAndAddEvents(calendar) {
        database.ref('contactFormDB').once('value', (snapshot) => {
            const consultations = snapshot.val();
            if (consultations) {
                calendar.removeAllEvents();
                for (const consultationId in consultations) {
                    const consultation = consultations[consultationId];
                    // Only show approved or rescheduled appointments
                    const status = consultation.status ? consultation.status.toLowerCase() : "";
                    if (status !== "approved" && status !== "rescheduled") {
                        continue;
                    }

                    let startDateTime = consultation.appointmentDate;
                    if (consultation.appointmentTime) {
                        const { hours, minutes } = parseTimeTo24Hour(consultation.appointmentTime);
                        const dateObj = new Date(consultation.appointmentDate);
                        dateObj.setHours(hours, minutes, 0, 0);
                        startDateTime = dateObj.toISOString();
                    }

                    const title = `${consultation.firstName} ${consultation.lastName}`;
                    let eventColor = "#204cdc";
                    if (status === "rescheduled") eventColor = "#F5A623";

                    // Pass appointmentData for correct localStorage update
                    calendar.addEvent({
                        id: consultationId,
                        title: title,
                        start: startDateTime,
                        color: eventColor,
                        status: status,
                        appointmentData: {
                            name: title,
                            email: consultation.email,
                            phone: consultation.phoneNumber,
                            company: consultation.company,
                            interest: consultation.consultationInterest,
                            date: consultation.appointmentDate,
                            time: consultation.appointmentTime,
                            comments: consultation.additionalInfo || "",
                            entryId: consultationId,
                            status: status
                        }
                    });
                }
            }
        });
    }

    // Set custom event rendering for week/day views
    calendar.setOption('slotLabelFormat', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Helper to save calendar state before redirect
    function saveCalendarState() {
        const state = {
            selectedDateStr,
            viewType: calendar.view.type,
            scrollTop: document.documentElement.scrollTop || document.body.scrollTop
        };
        localStorage.setItem("calendarState", JSON.stringify(state));
    }

    // Restore calendar state from localStorage
    function restoreCalendarState() {
        const stateStr = localStorage.getItem("calendarState");
        if (stateStr) {
            const state = JSON.parse(stateStr);
            if (state.viewType && state.selectedDateStr) {
                calendar.changeView(state.viewType, state.selectedDateStr);
                selectedDateStr = state.selectedDateStr;
                setTimeout(() => {
                    updateLeftPanelForDate(selectedDateStr, calendar.view.type !== "dayGridMonth");
                    window.scrollTo(0, state.scrollTop || 0);
                }, 200);
                return true;
            }
        }
        return false;
    }

    // Update eventContent to make the entire cell clickable and show text
    calendar.setOption('eventContent', function(arg) {
        const viewType = calendar.view.type;
        if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
            const entryId = arg.event.id;
            // Use a full-size <a> but keep the text visible and clickable
            return {
                html: `<a href="entry.html?id=${entryId}&source=calendar" 
                        onclick="window.calendarEntryClick('${entryId}')" 
                        style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;position:absolute;top:0;left:0;z-index:10;text-decoration:none;color:inherit;">
                        <span>${arg.event.title}</span>
                    </a>`
            };
        }
        if (viewType === 'dayGridMonth') {
            return { domNodes: [] };
        }
        return true;
    });

    // Expose a global function for event click
    window.calendarEntryClick = function(entryId) {
        const event = calendar.getEventById(entryId);
        if (event && event.extendedProps && event.extendedProps.appointmentData) {
            localStorage.setItem("appointmentData", JSON.stringify(event.extendedProps.appointmentData));
        }
        saveCalendarState();
        // Let <a> handle navigation
    };

    calendar.setOption('eventDidMount', function(info) {
        if (calendar.view.type === 'dayGridMonth') {
            // Hide the event element in month view
            info.el.style.display = 'none';
        }
    });

    // Track selected date for CSS highlight and logic
    let selectedDateStr = null;
    let selectedCell = null;

    // Helper to update left panel for a given date and highlight calendar cell
    function updateLeftPanelForDate(dateStr, skipHighlight = false) {
        selectedDateStr = dateStr; // Remember selected date for all views

        const dateObj = new Date(dateStr);
        const day = dateObj.getDate();
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        document.getElementById('dayDisplay').textContent = String(dateObj.getDate()).padStart(2, '0');
        document.getElementById('monthDisplay').textContent = monthNames[dateObj.getMonth()];
        displayUpcomingAppointments(dateStr);

        // Only highlight in month view and if not skipping highlight
        if (!skipHighlight && calendar.view.type === "dayGridMonth") {
            if (selectedCell) {
                selectedCell.classList.remove('fc-day-selected');
                selectedCell = null;
            }
            const cell = document.querySelector(`.fc-day[data-date="${dateStr}"]`);
            if (cell) {
                cell.classList.add('fc-day-selected');
                selectedCell = cell;
            }
        }
    }

    // Listen for clicks on day headers in all views (month, week, day)
    document.addEventListener('click', function(e) {
        const headerCell = e.target.closest('.fc-col-header-cell');
        if (headerCell && headerCell.hasAttribute('data-date')) {
            const dateStr = headerCell.getAttribute('data-date');
            if (dateStr) {
                updateLeftPanelForDate(dateStr, true); // Don't highlight for header clicks
                return;
            }
        }
    });

    // Use FullCalendar's dateClick for all views (month, week, day)
    calendar.on('dateClick', function(info) {
        updateLeftPanelForDate(info.dateStr);
    });

    // Intercept view change buttons to remember selected date and go to it
    document.addEventListener('click', function(e) {
        // Week view button
        if (e.target.closest('.fc-timeGridWeek-button')) {
            if (selectedDateStr) {
                calendar.changeView("timeGridWeek", selectedDateStr);
            }
        }
        // Day view button
        if (e.target.closest('.fc-timeGridDay-button')) {
            if (selectedDateStr) {
                calendar.changeView("timeGridDay", selectedDateStr);
            }
        }
        // Month view button
        if (e.target.closest('.fc-dayGridMonth-button')) {
            if (selectedDateStr) {
                calendar.changeView("dayGridMonth", selectedDateStr);
            }
        }
        // Listen for chevron navigation in Day view
        if (calendar.view.type === "timeGridDay") {
            if (e.target.closest('.fc-prev-button')) {
                if (selectedDateStr) {
                    const prevDate = new Date(selectedDateStr);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const prevDateStr = prevDate.toISOString().split('T')[0];
                    calendar.changeView("timeGridDay", prevDateStr);
                    updateLeftPanelForDate(prevDateStr);
                }
            }
            if (e.target.closest('.fc-next-button')) {
                if (selectedDateStr) {
                    const nextDate = new Date(selectedDateStr);
                    nextDate.setDate(nextDate.getDate() + 1);
                    const nextDateStr = nextDate.toISOString().split('T')[0];
                    calendar.changeView("timeGridDay", nextDateStr);
                    updateLeftPanelForDate(nextDateStr);
                }
            }
        }
        // Listen for chevron navigation in Week view
        if (calendar.view.type === "timeGridWeek") {
            if (e.target.closest('.fc-prev-button')) {
                if (selectedDateStr) {
                    const prevDate = new Date(selectedDateStr);
                    prevDate.setDate(prevDate.getDate() - 7);
                    const prevDateStr = prevDate.toISOString().split('T')[0];
                    calendar.changeView("timeGridWeek", prevDateStr);
                    updateLeftPanelForDate(prevDateStr);
                }
            }
            if (e.target.closest('.fc-next-button')) {
                if (selectedDateStr) {
                    const nextDate = new Date(selectedDateStr);
                    nextDate.setDate(nextDate.getDate() + 7);
                    const nextDateStr = nextDate.toISOString().split('T')[0];
                    calendar.changeView("timeGridWeek", nextDateStr);
                    updateLeftPanelForDate(nextDateStr);
                }
            }
        }
        // Listen for chevron navigation in Month view
        if (calendar.view.type === "dayGridMonth") {
            if (e.target.closest('.fc-prev-button')) {
                if (selectedDateStr) {
                    const prevDate = new Date(selectedDateStr);
                    prevDate.setDate(prevDate.getDate() - 28);
                    let candidateDate = new Date(prevDate);
                    // If still same month, add another 7 days
                    if (candidateDate.getMonth() === new Date(selectedDateStr).getMonth()) {
                        candidateDate.setDate(candidateDate.getDate() - 7);
                    }
                    const prevDateStr = candidateDate.toISOString().split('T')[0];
                    calendar.changeView("dayGridMonth", prevDateStr);
                    updateLeftPanelForDate(prevDateStr);
                }
            }
            if (e.target.closest('.fc-next-button')) {
                if (selectedDateStr) {
                    const nextDate = new Date(selectedDateStr);
                    nextDate.setDate(nextDate.getDate() + 28);
                    let candidateDate = new Date(nextDate);
                    // If still same month, add another 7 days
                    if (candidateDate.getMonth() === new Date(selectedDateStr).getMonth()) {
                        candidateDate.setDate(candidateDate.getDate() + 7);
                    }
                    const nextDateStr = candidateDate.toISOString().split('T')[0];
                    calendar.changeView("dayGridMonth", nextDateStr);
                    updateLeftPanelForDate(nextDateStr);
                }
            }
        }
    });

    // When changing views, restore the left panel and highlight for the remembered selected date
    calendar.on('datesSet', function() {
        if (selectedDateStr) {
            updateLeftPanelForDate(selectedDateStr, calendar.view.type !== "dayGridMonth");
        } else {
            if (selectedCell) {
                selectedCell.classList.remove('fc-day-selected');
                selectedCell = null;
            }
        }
    });

    // Modified to accept a date filter
    function displayUpcomingAppointments(selectedDate) {
        const upcomingAppointmentsDiv = document.getElementById('upcomingAppointments');
        upcomingAppointmentsDiv.innerHTML = '';

        // Set label and empty text based on selectedDate
        const labelElem = document.querySelector('h3.font-semibold');
        let filterDate = selectedDate;
        if (!filterDate) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            filterDate = currentDate.toISOString().split('T')[0];
        }
        filterDate = new Date(filterDate).toISOString().split('T')[0];

        // Compare selected date to today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(filterDate);
        selected.setHours(0, 0, 0, 0);

        let labelText = "Upcoming Appointments:";
        let noAppointmentsText = "No upcoming appointments.";
        if (selected < today) {
            labelText = "Appointments:";
            noAppointmentsText = "No appointments.";
        } else if (selected.getTime() === today.getTime()) {
            labelText = "Today's Appointments:";
            noAppointmentsText = "No appointments today.";
        }
        if (labelElem) {
            labelElem.textContent = labelText;
        }

        // Always use YYYY-MM-DD format for comparison
        database.ref('contactFormDB').once('value', (snapshot) => {
            const consultations = snapshot.val();
            const upcoming = [];
            if (consultations) {
                for (const consultationId in consultations) {
                    const consultation = consultations[consultationId];
                    // Only show approved or rescheduled appointments
                    const status = consultation.status ? consultation.status.toLowerCase() : "";
                    if (status !== "approved" && status !== "rescheduled") {
                        continue;
                    }
                    // Normalize date for comparison
                    let apptDate = consultation.appointmentDate;
                    if (apptDate) {
                        apptDate = new Date(apptDate).toISOString().split('T')[0];
                        if (apptDate === filterDate) {
                            upcoming.push({
                                time: consultation.appointmentTime,
                                name: `${consultation.firstName} ${consultation.lastName}`,
                                entryId: consultationId, // Always use consultationId here
                                status: status,
                                appointmentData: {
                                    name: `${consultation.firstName} ${consultation.lastName}`,
                                    email: consultation.email,
                                    phone: consultation.phoneNumber,
                                    company: consultation.company,
                                    interest: consultation.consultationInterest,
                                    date: consultation.appointmentDate,
                                    time: consultation.appointmentTime,
                                    comments: consultation.additionalInfo || "",
                                    entryId: consultationId,
                                    status: status
                                }
                            });
                        }
                    }
                }
                upcoming.sort((a, b) => {
                    const parseTime = t => {
                        if (!t) return 0;
                        const [time, modifier] = t.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        if (modifier === 'PM' && hours !== 12) hours += 12;
                        if (modifier === 'AM' && hours === 12) hours = 0;
                        return hours * 60 + minutes;
                    };
                    return parseTime(a.time) - parseTime(b.time);
                });
                if (upcoming.length > 0) {
                    upcoming.forEach(appointment => {
                        let circleColor = "bg-blue-500";
                        if (appointment.status === "rescheduled") {
                            circleColor = "bg-orange-400";
                        }
                        const appointmentDiv = document.createElement('div');
                        appointmentDiv.className = 'flex items-center gap-2 cursor-pointer';
                        appointmentDiv.innerHTML = `<div class="w-3 h-3 ${circleColor} rounded-full flex-shrink-0"></div><span>${appointment.name} (${appointment.time})</span>`;
                        appointmentDiv.onclick = function() {
                            localStorage.setItem("appointmentData", JSON.stringify(appointment.appointmentData));
                            window.location.href = `entry.html?id=${appointment.entryId}&source=calendar`;
                        };
                        upcomingAppointmentsDiv.appendChild(appointmentDiv);
                    });
                } else {
                    upcomingAppointmentsDiv.innerHTML = `<p>${noAppointmentsText}</p>`;
                }
            } else {
                upcomingAppointmentsDiv.innerHTML = `<p>${noAppointmentsText}</p>`;
            }
        });
    }

    // Initial left panel setup and highlight today
    function updateDateDisplay(dateOverride) {
        // Use dateOverride if provided, otherwise today
        let dateObj;
        if (dateOverride) {
            dateObj = new Date(dateOverride);
        } else {
            dateObj = new Date();
        }
        const day = dateObj.getDate();
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        const month = monthNames[dateObj.getMonth()];
        document.getElementById('dayDisplay').textContent = String(day).padStart(2, '0');
        document.getElementById('monthDisplay').textContent = month;
        const dateStr = dateObj.toISOString().split('T')[0];
        displayUpcomingAppointments(dateStr);

        if (selectedCell) {
            selectedCell.classList.remove('fc-day-selected');
            selectedCell = null;
        }
        setTimeout(() => {
            const cell = document.querySelector(`.fc-day[data-date="${dateStr}"]`);
            if (cell) {
                cell.classList.add('fc-day-selected');
                selectedCell = cell;
            }
            selectedDateStr = dateStr;
        }, 0);
    }

    // Remove highlight when calendar view changes (e.g., next/prev month)
    calendar.on('datesSet', function() {
        if (selectedCell) {
            selectedCell.classList.remove('fc-day-selected');
            selectedCell = null;
        }
    });

    updateDateDisplay();
    // No need for setInterval, as the display will be correct on load.
    // setInterval(updateDateDisplay, 1000); 

    // Realtime updates for when data changes in Firebase
    database.ref('contactFormDB').on('value', (snapshot) => {
        calendar.removeAllEvents(); // Clear before loading
        loadAndAddEvents(calendar);
        // Wait for events to be rendered, then update left panel
        setTimeout(() => {
            // Use selectedDateStr if set, otherwise today
            const dateToShow = selectedDateStr || (new Date().toISOString().split('T')[0]);
            updateDateDisplay(dateToShow);
        }, 200);
    });

    // Make "Today" button select and highlight today
    calendar.on('today', function() {
        // Wait for calendar to render the correct month
        setTimeout(() => {
            updateDateDisplay();
        }, 0);
    });

    // Patch: Listen for toolbar button click if FullCalendar doesn't emit 'today'
    document.addEventListener('click', function(e) {
        // Detect FullCalendar "Today" button click
        if (e.target.closest('.fc-today-button')) {
            setTimeout(() => {
                updateDateDisplay();
            }, 0);
        }
    });

    // Restore calendar state on load
    document.addEventListener('DOMContentLoaded', function() {
        // Try to restore state, if not present, show today
        if (!restoreCalendarState()) {
            updateDateDisplay();
        }
        // Wait for events to load, then update left panel
        setTimeout(() => {
            const dateToShow = selectedDateStr || (new Date().toISOString().split('T')[0]);
            updateDateDisplay(dateToShow);
        }, 200);
    });

    // Also restore state after browser back navigation
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            restoreCalendarState();
        }
    });
});