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
    window.location.href = `old.html?id=${entryId}`;
}
document.addEventListener("DOMContentLoaded", async function () {
    const appointmentData = JSON.parse(localStorage.getItem("appointmentData"));
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
        let bgColor = "#666";
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
});

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

function sendMail(action) {
    const emailElement = document.getElementById("h-email");
    if (!emailElement) {
        console.error("❌ Element with ID 'h-email' not found!");
        return;
    }

    const userEmail = emailElement.textContent.trim();
    console.log(`📩 Sending email about "${action}" for "${userEmail}"`);

    // Your email sending logic goes here...
}
// Contact form email sending function
function sendContactMessage() {
    var params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };

    const serviceID = "service_ob944xf";
    const templateID = "template_wkvq4nl";

    emailjs.send(serviceID, templateID, params)
        .then(res => {
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
            console.log(res);
            alert("Your message was sent successfully!");
        })
        .catch(err => console.log(err));
}


document.getElementById("accept-btn").addEventListener("click", () => {
    const emailElement = document.getElementById("h-email");
    if (!emailElement) {
        console.error("❌ Element with ID 'h-email' not found!");
        return;
    }

    const userEmail = emailElement.textContent.trim().toLowerCase(); // Extract email
    console.log("✅ Extracted Email from Page:", `"${userEmail}"`);

    if (userEmail) {
        handleStatusUpdate(userEmail, "approved"); // Pass the email, not status
    } else {
        console.error("❌ Could not retrieve email from entry page.");
    }
});

document.getElementById("accept-btn").addEventListener("click", () => {
    const emailElement = document.getElementById("h-email"); // Ensure this contains the actual email
    if (!emailElement) {
        console.error("❌ Element with ID 'h-email' not found!");
        return;
    }

    const email = emailElement.textContent.trim().toLowerCase(); // Extract actual email
    console.log("✅ Extracted Email from Page:", `"${email}"`);

    if (email) {
        handleStatusUpdate(email, "approved"); // Pass email correctly
    } else {
        console.error("❌ Could not retrieve email from entry page.");
    }
});

document.getElementById("reject-btn").addEventListener("click", () => {
    const emailElement = document.getElementById("h-email");
    if (!emailElement) {
        console.error("❌ Element with ID 'h-email' not found!");
        return;
    }

    const email = emailElement.textContent.trim().toLowerCase();
    console.log("🔎 Extracted Email from Page:", `"${email}"`);

    handleStatusUpdate(email, "rejected");
});

document.getElementById("reschedule-btn").addEventListener("click", () => {
    const emailElement = document.getElementById("h-email");
    if (!emailElement) {
        console.error("❌ Element with ID 'h-email' not found!");
        return;
    }

    const email = emailElement.textContent.trim().toLowerCase();
    console.log("🔎 Extracted Email from Page:", `"${email}"`);

    handleStatusUpdate(email, "rescheduled");
});