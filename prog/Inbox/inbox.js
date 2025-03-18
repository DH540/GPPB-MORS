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
const inboxTableBody = document.getElementById("inbox-table-body");

function loadInbox() {
    const inboxTable = document.getElementById("inbox-table-body");
    inboxTable.innerHTML = ""; // Clear previous entries

    database.ref("contactFormDB").on("value", snapshot => {
        inboxTable.innerHTML = ""; // Clear table before adding new data
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            console.log("Retrieved data:", data); // Debugging log

            const formattedDateWords = formatDate(data.appointmentDate); // "Month Day, Year"
            const formattedDateNumeric = formatDateNumeric(data.appointmentDate); // "MM/DD/YYYY"

            const row = document.createElement("tr");
            row.classList.add("inbox-row"); // for search/sort to work

            row.innerHTML = `
                <td><input type="checkbox"/></td>
                <td class="cursor-pointer text-blue-600 hover:underline" onclick='openEntryView(
    "${data.firstName || ''} ${data.lastName || ''}",
    "${data.email || ''}",
    "${data.phoneNumber || ''}",
    "${data.company || ''}",
    "${data.areaOfInterest || ''}",
    "${data.appointmentDate || ''}",
    "${data.appointmentTime || ''}",
    "${data.comments || ''}"
)'>
    ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}
</td>

                <td>Consultation Request for ${formattedDateWords}</td>
                <td>${data.appointmentDate || 'Pending'}</td>
                
            `;
            inboxTable.appendChild(row);
        });
    });
}



function showAllRows() {
    document.querySelectorAll('.inbox-row').forEach(row => {
        row.style.display = "";
    });
}

function searchTable() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const rows = document.querySelectorAll('tbody .inbox-row');
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
    const checkboxes = document.querySelectorAll("tbody input[type='checkbox']:checked");

    checkboxes.forEach((checkbox) => {
        checkbox.closest("tr").remove();
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
    const table = document.querySelector("tbody");
    const rows = Array.from(table.rows);

    rows.sort((rowA, rowB) => {
        let valueA, valueB;

        if (column === "date") {
            valueA = new Date(rowA.cells[2].textContent.trim());
            valueB = new Date(rowB.cells[2].textContent.trim());
        } else if (column === "name") {
            valueA = rowA.cells[0].textContent.trim().toLowerCase();
            valueB = rowB.cells[0].textContent.trim().toLowerCase();
        }

        return order === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    rows.forEach(row => table.appendChild(row));
}

function openEntryView(name, email, phone, company, interest, date, time, comments) {
    const appointmentData = {
        name: name,
        email: email,
        phone: phone,
        company: company,
        interest: interest,
        date: date,
        time: time,
        comments: comments
    };
    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));
    console.log("Saved Data: ", appointmentData);
    window.location.href = "entry.html";
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
        document.getElementById("comments").textContent = appointmentData.time;
    }
});
document.addEventListener("DOMContentLoaded", loadInbox);

