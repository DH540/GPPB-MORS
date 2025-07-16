const firebaseConfig = {
    apiKey: "AIzaSyBEJMTq5PQNrwDELbuqGfIFGFxJ3S-ke_Q",
    authDomain: "css151l-6290e.firebaseapp.com",
    databaseURL: "https://css151l-6290e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "css151l-6290e",
    storageBucket: "css151l-6290e.appspot.com",
    messagingSenderId: "907702008183",
    appId: "1:907702008183:web:9dbb807a3db2e2958bc972"
};

// Initialize Firebase  
firebase.initializeApp(firebaseConfig);

// Reference Firebase database
const contactFormDB = firebase.database().ref("contactFormDB");

// Function to open entry view and store data in localStorage
function openEntryView(name, email, phone, company, interest, date, time, comments, entryId, source) {
    console.log("Opening Entry View with:", { name, email, phone, company, interest, date, time, comments, entryId, source});

    if (!entryId) {
        console.error("⚠ Entry ID is missing! Cannot proceed.");
        return;
    }

    const appointmentData = { name, email, phone, company, interest, date, time, comments, entryId };
    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));

    window.location.href = `entry.html?id=${entryId}&source=${source}`;
}

// Load appointment data on entry page
document.addEventListener("DOMContentLoaded", async function () {
    const appointmentData = JSON.parse(localStorage.getItem("appointmentData"));
    const status = appointmentData.status ? appointmentData.status.toLowerCase() : "pending";

    if (!appointmentData || !appointmentData.entryId) {
        console.error("❌ Missing appointment data or entryId in localStorage.");
        return;
    }

    const entryId = appointmentData.entryId;

    const entryRef = firebase.database().ref(`contactFormDB/${entryId}`);
    try {
        const snapshot = await entryRef.once("value");
        if (!snapshot.exists()) {
            console.error("❌ No entry found for ID:", entryId);
            return;
        }

        const data = snapshot.val();

        // Update all UI fields from Firebase
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        updateElement("h-name", data.firstName + " " + data.lastName);
        updateElement("h-email", data.email);
        updateElement("h-date", data.appointmentDate);
        updateElement("d-name", data.firstName + " " + data.lastName);
        updateElement("d-email", data.email);
        updateElement("phone", data.phoneNumber);
        updateElement("company", data.company);
        updateElement("interest", data.consultationInterest);
        updateElement("d-date", data.appointmentDate);
        updateElement("time", data.appointmentTime);
        updateElement("comments", data.additionalInfo || "—");

        console.log("🔥 Loaded Status from Firebase:", data.status);

        // ✅ Dynamic status
        const status = data.status;

if (status && typeof status === "string" && status.trim() !== "") {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const statusElement = document.getElementById("status");

    if (statusElement) {
        let bgColor = "#C2C2C2";
        if (status === "approved") bgColor = "#00A651";
        else if (status === "cancelled" || status === "rejected") bgColor = "#E12926";
        else if (status === "rescheduled") bgColor = "#F5A623";

        statusElement.textContent = capitalizedStatus;
        statusElement.style.backgroundColor = bgColor;
        statusElement.style.color = "white";
        statusElement.style.display = "inline-block";
        statusElement.style.fontSize = "1.125rem";
        statusElement.style.fontWeight = "bold";
        statusElement.style.borderRadius = "20px";
        statusElement.style.padding = "0.25rem 1rem";
        statusElement.style.textAlign = "center";
        statusElement.style.width = "auto";
        statusElement.style.marginLeft = "auto";
    }
} else {
    const statusContainer = document.getElementById("status-container");
    if (statusContainer) {
        statusContainer.style.display = "none";
    }
}

    } catch (error) {
        console.error("🔥 Error loading appointment:", error);
    }
    
    const acceptBtn = document.querySelector("button[onclick*='approved']");
    const cancelBtn = document.querySelector("button[onclick*='cancelled']");
    const rescheduleBtn = document.querySelector("button[onclick*='openRescheduleModal']");

    if (status === "approved") {
        acceptBtn.style.display = "none";
        cancelBtn.style.display = "inline-block";
        rescheduleBtn.style.display = "inline-block";
    } 
    else if (status === "cancelled") {
        acceptBtn.style.display = "none";
        cancelBtn.style.display = "none";
        rescheduleBtn.style.display = "none";
    } 
    else if (status === "rescheduled") {
        acceptBtn.style.display = "none";
        cancelBtn.style.display = "inline-block";
        rescheduleBtn.style.display = "inline-block";
    } 
    else {
    // Fallback for pending or unknown
        acceptBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";
        rescheduleBtn.style.display = "inline-block";
    }

    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source") || "index";
    sessionStorage.setItem("sourcePage", source);

    const backButton = document.getElementById("backButton");
    if (backButton) {
        if (source === "inbox") {
            backButton.href = "inbox.html";
        } else if (source === "history") {
            backButton.href = "History.html";
        } else if (source === "calendar") {
            backButton.href = "Calendar.html";
        } else {
            backButton.href = "index.html";
        }
    }

    console.log(`📩 Extracted Email from Storage: "${appointmentData.email}"`);
});

function fetchEntryIdByEmail(email) {
    if (!email) {
        console.error("❌ Invalid email provided to fetchEntryIdByEmail");
        return Promise.resolve(null);
    }

    const formattedEmail = email.trim().toLowerCase();
    console.log("🔍 Searching for email in Firebase:", `"${formattedEmail}"`);

    return new Promise((resolve, reject) => {
        firebase.database().ref("contactFormDB")
            .orderByChild("email") // Always query using "email"
            .equalTo(formattedEmail)
            .once("value")
            .then(snapshot => {
                console.log("🟢 Firebase Response:", snapshot.val()); // Debugging log

                if (snapshot.exists()) {
                    const entryKey = Object.keys(snapshot.val())[0]; // Get the first matching entry ID
                    console.log("✅ Found Entry ID:", entryKey);
                    resolve(entryKey);
                } else {
                    console.error("❌ No matching entry found for:", `"${formattedEmail}"`);
                    resolve(null);
                }
            })
            .catch(error => {
                console.error("🔥 Error fetching entry ID:", error);
                reject(error);
            });
    });
}

function handleStatusUpdate(newStatus) {
    const appointmentData = JSON.parse(localStorage.getItem("appointmentData"));
    if (!appointmentData || !appointmentData.entryId) {
        console.error("❌ No appointment data or entryId found in localStorage.");
        return;
    }
    const entryId = appointmentData.entryId;
    const entryRef = firebase.database().ref(`contactFormDB/${entryId}`);

    entryRef.update({ status: newStatus })
        .then(() => {
            console.log(`✅ Status updated to "${newStatus}" for Entry ID:`, entryId);
            sendMail(newStatus); // Trigger email notification
            document.getElementById("status").textContent = newStatus; // Update UI
        })
        .catch(error => console.error("❌ Error updating status:", error));
}

// Function to update status in Firebase
function updateStatus(entryId, newStatus) {
    if (!entryId) {
        console.error("Missing entry ID");
        return;
    }

    contactFormDB.child(entryId).update({ status: newStatus })
        .then(() => {
            console.log(`Status updated to ${newStatus}`);
            document.getElementById("status").textContent = newStatus; // Update UI
        })
        .catch((error) => console.error("Error updating status: ", error));
}

function sendMail(status) {
    const appointment = JSON.parse(localStorage.getItem("appointmentData"));

    if (!appointment) {
        console.error("❌ No appointment data found in localStorage.");
        return;
    }

     const emailParams = {
        name: appointment.name,
        email: appointment.email,
        appt_date: appointment.date,
        appt_time: appointment.time,
        consultation_mode: appointment.interest,
        consultation_link: appointment.consultation_link || "N/A",
        status: status,
        custom_message: getCustomMessage(status)
    };

    emailjs.send("service_yl0b9tl", "template_wkj756d", emailParams)
        .then((response) => {
            console.log(`✅ ${status.toUpperCase()} email sent successfully!`, response.status);
            alert(`${status.toUpperCase()} email sent to ${appointment.email}`);
        })
        .catch((error) => {
            console.error(`❌ Failed to send ${status} email:`, error);
            alert(`Failed to send ${status} email. See console for details.`);
        });

    setTimeout(() => {
        const sourcePage = sessionStorage.getItem("sourcePage") || "inbox";
        if (sourcePage.toLowerCase() === "calendar") {
            window.location.href = "Calendar.html";
        } else if (sourcePage.toLowerCase() === "history") {
            window.location.href = "History.html";
        } else {
            window.location.href = "inbox.html";
        }
    }, 3000);
}

const statusMessages = {
  approved: "We're excited to meet you on the scheduled date. Please be on time",
  cancelled: "Unfortunately, your request could not be accommodated at this time",
  rescheduled: "We apologize for the inconvenience. Please take note of the updated date and time for your consultation"
};

function getCustomMessage(status) {
  return statusMessages[status] || "";
}

function openRescheduleModal() {
    document.getElementById('rescheduleModal').classList.remove('hidden');
  }
  
function closeRescheduleModal() {
    document.getElementById('rescheduleModal').classList.add('hidden');
  }
  
function submitReschedule() {
    const newDate = document.getElementById('newDate').value;
    const newTime = document.getElementById('newTime').value;

    if (!newDate || !newTime) {
        alert('Please select both a new date and time.');
        return;
    }

    const appointmentData = JSON.parse(localStorage.getItem("appointmentData"));
    if (!appointmentData || !appointmentData.entryId) {
        console.error("❌ No appointment data or entryId found in localStorage.");
        return;
    }
    const entryId = appointmentData.entryId;
    const entryRef = firebase.database().ref(`contactFormDB/${entryId}`);

    entryRef.update({
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'rescheduled'
    })
    .then(() => {
        console.log(`✅ Rescheduled to ${newDate} at ${newTime} for Entry ID:`, entryId);

        document.getElementById('d-date').textContent = newDate;
        document.getElementById('time').textContent = newTime;

        if (appointmentData) {
            appointmentData.date = newDate;
            appointmentData.time = newTime;
            localStorage.setItem("appointmentData", JSON.stringify(appointmentData));
        }

        sendMail('rescheduled');
        closeRescheduleModal();
    })
    .catch(error => console.error("❌ Error updating date and time:", error));
}
