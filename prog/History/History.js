const firebaseConfig = {
    apiKey: "AIzaSyBEJMTq5PQNrwDELbuqGfIFGFxJ3S-ke_Q",
    authDomain: "css151l-6290e.firebaseapp.com",
    databaseURL: "https://css151l-6290e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "css151l-6290e",
    storageBucket: "css151l-6290e.firebasestorage.app",
    messagingSenderId: "907702008183",
    appId: "1:907702008183:web:9dbb807a3db2e2958bc972"
};

function searchTable() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#history-table-body tr'); // Select only tbody rows

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const historyTableBody = document.getElementById("history-table-body");

// Function to toggle all checkboxes
function toggleSelectAll(icon) {
    const checkboxes = document.querySelectorAll(".table tbody input[type='checkbox']");
    const allChecked = [...checkboxes].every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });

    icon.classList.toggle("selected", !allChecked);
}

// Function to delete selected rows from Firebase
function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll(".table tbody input[type='checkbox']:checked");

    if (checkboxes.length === 0) {
        alert("No rows selected for deletion.");
        return;
    }

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest("tr");
        const fullName = row.cells[1].textContent.trim().toLowerCase(); // Example: "john doe"
        const appointmentText = row.cells[2].textContent.trim().toLowerCase(); // e.g., "consultation request for march 20, 2025"

        // Fetch Firebase data again to match and find the correct key
        database.ref("contactFormDB").once("value", snapshot => {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                const dbFullName = `${(data.firstName || "").toLowerCase()} ${(data.lastName || "").toLowerCase()}`;
                const dbAppointmentText = `consultation request for ${formatDate((data.appointmentDate || "")).toLowerCase()}`;

                if (dbFullName === fullName && dbAppointmentText === appointmentText) {
                    const key = childSnapshot.key;

                    // Delete from Firebase
                    database.ref(`contactFormDB/${key}`).remove()
                        .then(() => {
                            console.log(`🗑️ Deleted Firebase entry with ID: ${key}`);
                            row.remove(); // Remove from table after successful delete
                        })
                        .catch(error => {
                            console.error(`❌ Failed to delete entry with ID: ${key}`, error);
                        });
                }
            });
        });
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
function getStatusColor(status) {
    switch ((status || "").toLowerCase()) {
        case "approved":
        case "available":
            return "#00A651"; // Green
        case "rejected":
            return "#E12926"; // Red
        case "rescheduled":
            return "#F5A623"; // Orange
        default:
            return "#ccc"; // Gray for unknown/pending
    }
}

function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
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
                <td style="background-color: ${getStatusColor(data.status)}; color: white; padding: 6px 12px; border-radius: 4px; text-align: center;">
                     ${data.status ? capitalize(data.status) : 'Pending'}
                                    </td>
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

function toggleArrow() {
    const arrow = document.getElementById("sortArrow");
    const currentOrder = arrow.dataset.order === "asc" ? "desc" : "asc";
    
    arrow.dataset.order = currentOrder;
    arrow.innerHTML = `<i class="fas fa-arrow-${currentOrder === "asc" ? "up" : "down"}"></i>`;

    applySorting();
}

function applySorting() {
    const sortCriteria = document.getElementById("sortCriteria").value;
    const order = document.getElementById("sortArrow").dataset.order;
    
    sortTable(sortCriteria, order);
}

function sortTable(column, order) {
    const rows = Array.from(document.querySelectorAll("#history-table-body tr"));

    rows.sort((rowA, rowB) => {
        let valueA, valueB;

        if (column === "date") {
            // Fix date sorting by converting to timestamps
            valueA = new Date(rowA.cells[4].textContent.trim()).getTime() || 0;
            valueB = new Date(rowB.cells[4].textContent.trim()).getTime() || 0;
        } 
        else if (column === "name") {
            // Fix name sorting (convert to lowercase for consistency)
            valueA = rowA.cells[1].textContent.trim().toLowerCase();
            valueB = rowB.cells[1].textContent.trim().toLowerCase();
        }

        return order === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    rows.forEach(row => document.getElementById("history-table-body").appendChild(row));
}

document.addEventListener("DOMContentLoaded", function () {
    const openModalBtn = document.getElementById("open"); 
    const closeModalBtn = document.getElementById("close");
    const modalContainer = document.querySelector(".modal-container");
    const continueBtn = document.getElementById("continue");

    function hasSelectedRows() {
        return document.querySelectorAll(".table tbody input[type='checkbox']:checked").length > 0;
    }

    // Open Modal when clicking the trash icon
    openModalBtn.addEventListener("click", function () {
        if (hasSelectedRows()) {
            modalContainer.classList.add("show"); 
        }
    });

    // Close Modal when clicking the "Cancel" button
    closeModalBtn.addEventListener("click", function () {
        modalContainer.classList.remove("show"); // Hide the modal
    });

    continueBtn.addEventListener("click", function () {
        deleteSelectedRows(); // Call the function to delete selected rows
        modalContainer.classList.remove("show"); // Hide modal after deleting
    });

    // Close Modal when clicking outside of it
    modalContainer.addEventListener("click", function (event) {
        if (event.target === modalContainer) {
            modalContainer.classList.remove("show");
        }
    });
});

