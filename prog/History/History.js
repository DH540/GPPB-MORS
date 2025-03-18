// SAY YO MAMA IF U READ THIS!!

// Initialize Firebase
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
const historyTableBody = document.getElementById("history-table-body");

// Function to toggle all checkboxes
function toggleSelectAll(icon) {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    const isChecked = icon.classList.contains("selected");

    checkboxes.forEach(checkbox => {
        checkbox.checked = !isChecked;
    });

    icon.classList.toggle("selected");
}

// Function to delete selected rows from Firebase
function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll(".row-checkbox:checked");
    if (checkboxes.length === 0) {
        alert("No rows selected for deletion.");
        return;
    }

    if (!confirm("Are you sure you want to delete the selected records?")) return;

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest("tr");
        const appointmentId = row.dataset.id; // Ensure each row has a data-id attribute

        // Remove from Firebase
        database.ref("appointments/" + appointmentId).remove()
            .then(() => row.remove())
            .catch(error => console.error("Error deleting record:", error));
    });
}
// Function to refresh the page
function refreshPage() {
    location.reload();
}
// Function to fetch and display history records
function formatDate(dateString) {
    if (!dateString) return "N/A"; // Handle missing dates

    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
}

function loadHistory() {
    const historyTable = document.getElementById("history-table-body");
    historyTable.innerHTML = ""; // Clear previous entries

    database.ref("contactFormDB").on("value", snapshot => {
        historyTable.innerHTML = ""; // Clear table before adding new data
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            console.log("Retrieved data:", data); // Debugging log

            const formattedDateWords = formatDate(data.appointmentDate); // Word-based format
            const formattedDateNumeric = formatDateNumeric(data.appointmentDate); // MM/DD/YYYY format

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox"/></td>
                <td>${data.firstName || 'N/A'} ${data.lastName || 'N/A'}</td>
                <td>Consultation Request for ${formattedDateWords}</td>
                <td>${data.status || 'Pending'}</td>
                <td>${formattedDateNumeric}</td> <!-- Now shows MM/DD/YYYY format -->
            `;
            historyTable.appendChild(row);
        });
    });
}

// Function to format date in "Month Day, Year" format
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Function to format date in "MM/DD/YYYY" format
function formatDateNumeric(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
}

// Load history when page loads
document.addEventListener("DOMContentLoaded", loadHistory);
