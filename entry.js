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
function openEntryView(name, email, phone, company, interest, date, time, comments, entryId) {
    console.log("Opening Entry View with:", { name, email, phone, company, interest, date, time, comments, entryId });

    if (!entryId) {
        console.error("⚠ Entry ID is missing! Cannot proceed.");
        return;
    }

    const appointmentData = { name, email, phone, company, interest, date, time, comments, entryId };
    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));

    // Ensure entryId is added to the URL
    window.location.href = `entry.html?id=${entryId}`;
}

// Load appointment data on entry page
document.addEventListener("DOMContentLoaded", function () {
    const appointmentData = JSON.parse(localStorage.getItem("appointmentData"));

    if (!appointmentData) {
        console.error("⚠ No appointment data found in localStorage.");
        return;
    }

    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠ Element with ID "${id}" not found.`);
        }
    }

    // Update header section
    updateElement("h-name", appointmentData.name);
    updateElement("h-email", appointmentData.email);
    updateElement("h-date", appointmentData.date);

    // Update appointment details section
    updateElement("d-name", appointmentData.name);
    updateElement("d-email", appointmentData.email);
    updateElement("phone", appointmentData.phone);
    updateElement("company", appointmentData.company);
    updateElement("interest", appointmentData.interest);
    updateElement("d-date", appointmentData.date);
    updateElement("time", appointmentData.time);
    updateElement("comments", appointmentData.comments);

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
    const emailElement = document.getElementById("h-email");
    if (!emailElement) {
        console.error("❌ Element with ID 'h-email' not found!");
        return;
    }

    const userEmail = emailElement.textContent.trim().toLowerCase(); // Normalize email
    if (!userEmail) {
        console.error("❌ Could not retrieve a valid email from the entry page.");
        return;
    }

    console.log("🔎 Looking for entry with email:", `"${userEmail}"`);

    fetchEntryIdByEmail(userEmail).then(entryId => {
        if (!entryId) {
            console.error("❌ No matching entry found for:", `"${userEmail}"`);
            return;
        }

        console.log("✅ Entry ID found:", entryId);

        const entryRef = firebase.database().ref(`contactFormDB/${entryId}`);

        entryRef.update({ status: newStatus })
            .then(() => {
                console.log(`✅ Status updated to "${newStatus}" for Entry ID:`, entryId);
                sendMail(newStatus); // Trigger email notification
                document.getElementById("status").textContent = newStatus; // Update UI
            })
            .catch(error => console.error("❌ Error updating status:", error));
    }).catch(error => console.error("❌ Error fetching Entry ID:", error));
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

    emailjs.send("service_ob944xf", "template_wkj756d", emailParams)
        .then((response) => {
            console.log(`✅ ${status.toUpperCase()} email sent successfully!`, response.status);
            alert(`${status.toUpperCase()} email sent to ${appointment.email}`);
        })
        .catch((error) => {
            console.error(`❌ Failed to send ${status} email:`, error);
            alert(`Failed to send ${status} email. See console for details.`);
        });
}

const statusMessages = {
  approved: "We're excited to meet you on the scheduled date. Please be on time",
  cancelled: "Unfortunately, your request could not be accommodated at this time",
  rescheduled: "Please take note of the updated date and time for your consultation"
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
  
    const emailElement = document.getElementById("h-email");
    if (!emailElement) {
      console.error("❌ Element with ID 'h-email' not found!");
      return;
    }
  
    const userEmail = emailElement.textContent.trim().toLowerCase();
    if (!userEmail) {
      console.error("❌ Could not retrieve a valid email from the entry page.");
      return;
    }
  
    fetchEntryIdByEmail(userEmail)
      .then(entryId => {
        if (!entryId) {
          console.error("❌ No matching entry found for:", `"${userEmail}"`);
          return;
        }
  
        const entryRef = firebase.database().ref(`contactFormDB/${entryId}`);
  
        entryRef.update({
          date: newDate,
          time: newTime,
          status: 'rescheduled'
        })
        .then(() => {
          console.log(`✅ Rescheduled to ${newDate} at ${newTime} for Entry ID:`, entryId);
  
          document.getElementById('d-date').textContent = newDate;
          document.getElementById('time').textContent = newTime;
  
          sendMail('rescheduled');
  
          closeRescheduleModal();
        })
        .catch(error => console.error("❌ Error updating date and time:", error));
      })
      .catch(error => console.error("❌ Error fetching Entry ID:", error));
  }