
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

function loadHistory() {
    const historyTable = document.getElementById("history-table-body");
    historyTable.innerHTML = "";

    database.ref("contactFormDB").on("value", snapshot => {
        historyTable.innerHTML = "";
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();

            const formattedDateWords = formatDate(data.appointmentDate);
            const formattedDateNumeric = formatDateNumeric(data.appointmentDate);

            const row = document.createElement("tr");
            row.classList.add("history-row");

            row.innerHTML = 
    `<td><input type="checkbox"/></td>
    <td class="cursor-pointer text-blue-600 hover:underline" onclick='openEntryView(
        "${data.firstName || ''} ${data.lastName || ''}",
        "${data.email || ''}",
        "${data.phoneNumber || ''}",
        "${data.company || ''}",
        "${data.areaOfInterest || ''}",
        "${data.appointmentDate || ''}",
        "${data.appointmentTime || ''}",
        "${data.comments || ''}",
        "${data.status || 'Pending'}"
    )'>
        ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}
    </td>
    <td>Consultation Request for ${formattedDateWords}</td>
    <td style="color: ${getStatusColor(data.status)}; font-weight: bold;">
    ${data.status || 'Pending'}
    </td>

    <td class="font-semibold">${data.appointmentDate || 'Pending'}</td>`;

            historyTable.appendChild(row);
        });
    });
}

function showAllRows() {
    document.querySelectorAll('.history-row').forEach(row => {
        row.style.display = "";
    });
}

function searchTable() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const rows = document.querySelectorAll('tbody .history-row');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

function toggleSelectAll(button) {
    const checkboxes = document.querySelectorAll('.table tbody input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
}

function refreshPage() {
    location.reload();
}

function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll(".table tbody input[type='checkbox']:checked");

    if (checkboxes.length === 0) {
        alert("No rows selected for deletion.");
        return;
    }

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest("tr");
        const fullName = row.cells[1].textContent.trim().toLowerCase();
        const appointmentText = row.cells[2].textContent.trim().toLowerCase();

        database.ref("contactFormDB").once("value", snapshot => {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                const dbFullName = `${(data.firstName || "").toLowerCase()} ${(data.lastName || "").toLowerCase()}`;
                const dbAppointmentText = `consultation request for ${formatDate((data.appointmentDate || "")).toLowerCase()}`;

                if (dbFullName === fullName && dbAppointmentText === appointmentText) {
                    const key = childSnapshot.key;
                    database.ref(`contactFormDB/${key}`).remove()
                        .then(() => {
                            console.log(`🗑️ Deleted Firebase entry with ID: ${key}`);
                            row.remove();
                        })
                        .catch(error => {
                            console.error(`❌ Failed to delete entry with ID: ${key}`, error);
                        });
                }
            });
        });
    });
}

let currentOrder = "asc";
let currentCriteria = "date";

function toggleArrow() {
    currentOrder = currentOrder === "asc" ? "desc" : "asc";
    document.getElementById("sortArrow").innerHTML =
        `<i class="fas fa-arrow-${currentOrder === "asc" ? "up" : "down"}"></i>`;
    applySorting();
}

function applySorting() {
    currentCriteria = document.getElementById("sortCriteria").value;
    sortTable(currentCriteria, currentOrder);
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


let activeFilter = null; // Track the active filter

function filterStatus(status) {
    const rows = document.querySelectorAll("#history-table-body tr");

    if (activeFilter === status) {
        rows.forEach(row => row.style.display = "");
        activeFilter = null; 
        return;
    }

    // Otherwise, apply the new filter
    rows.forEach(row => {
        const statusCell = row.cells[3].textContent.trim().toLowerCase();
        row.style.display = (statusCell === status) ? "" : "none";
    });

    activeFilter = status;
}

function openEntryView(name, email, phone, company, interest, date, time, comments, status) {
    const appointmentData = {
        name: name,
        email: email,
        phone: phone,
        company: company,
        interest: interest,
        date: date,
        time: time,
        comments: comments,
        status: status
    };
    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));
    console.log("Saved Data: ", appointmentData);
    window.location.href = "old.html";
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateNumeric(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
}

document.addEventListener("DOMContentLoaded", function () {
    const appointmentData = JSON.parse(localStorage.getItem("appointmentData"));

    if (appointmentData) {
        document.getElementById("name").textContent = appointmentData.name;
        document.getElementById("email").textContent = appointmentData.email;
        document.getElementById("phone").textContent = appointmentData.phone;
        document.getElementById("company").textContent = appointmentData.company;
        document.getElementById("interest").textContent = appointmentData.interest;
        document.getElementById("date").textContent = appointmentData.date;
        document.getElementById("time").textContent = appointmentData.time;
        document.getElementById("comments").textContent = appointmentData.comments;
        document.getElementById("status").textContent = appointmentData.status;
    }
});

document.addEventListener("DOMContentLoaded", loadHistory);

document.addEventListener("DOMContentLoaded", function () {
    const openModalBtn = document.getElementById("open");
    const closeModalBtn = document.getElementById("close");
    const modalContainer = document.querySelector(".modal-container");
    const continueBtn = document.getElementById("continue");

    function hasSelectedRows() {
        return document.querySelectorAll(".table tbody input[type='checkbox']:checked").length > 0;
    }

    openModalBtn.addEventListener("click", function () {
        if (hasSelectedRows()) {
            modalContainer.classList.add("show");
        }
    });

    closeModalBtn.addEventListener("click", function () {
        modalContainer.classList.remove("show");
    });

    continueBtn.addEventListener("click", function () {
        deleteSelectedRows();
        modalContainer.classList.remove("show");
    });

    modalContainer.addEventListener("click", function (event) {
        if (event.target === modalContainer) {
            modalContainer.classList.remove("show");
        }
    });
});
