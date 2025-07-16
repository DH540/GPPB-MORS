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
            // Only show entries with status "pending" (case-insensitive)
            if ((data.status || '').toLowerCase() !== 'pending') return;

            const formattedDateWords = formatDate(data.appointmentDate);

            const row = document.createElement("tr");
            row.classList.add("inbox-row");

            // Pass additionalInfo as an argument to openEntryView
            row.innerHTML = `
                <td><input type="checkbox"/></td>
                <td class="cursor-pointer text-blue-600 hover:underline" onclick='openEntryView(
                    "${data.firstName || ''} ${data.lastName || ''}",
                    "${data.email || ''}",
                    "${data.phoneNumber || ''}",
                    "${data.company || ''}",
                    "${data.consultationInterest || ''}",
                    "${data.appointmentDate || ''}",
                    "${data.appointmentTime || ''}",
                    "${data.comments || ''}",
                    "${childSnapshot.key}",
                    "${data.additionalInfo ? data.additionalInfo.replace(/"/g, '&quot;').replace(/'/g, "\\'") : ''}"
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
                console.log("Retrieved interest:", data.consultationInterest);

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
            valueA = new Date(rowA.cells[3].textContent.trim()); // Extract date column
            valueB = new Date(rowB.cells[3].textContent.trim());
        } else if (column === "name") {
            valueA = rowA.cells[1].textContent.trim().toLowerCase(); // Extract name column
            valueB = rowB.cells[1].textContent.trim().toLowerCase();
        }

        if (valueA < valueB) return order === "asc" ? -1 : 1;
        if (valueA > valueB) return order === "asc" ? 1 : -1;
        return 0; // Equal values remain unchanged
    });

    rows.forEach(row => table.appendChild(row));
}

function openEntryView(name, email, phone, company, interest, date, time, comments, entryId, additionalInfo) {
    const appointmentData = {
        name: name,
        email: email,
        phone: phone,
        company: company,
        interest: interest,
        date: date,
        time: time,
        comments: comments,
        entryId: entryId, // Store the Firebase key
        additionalInfo: additionalInfo // Store additionalInfo for comments
    };
    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));
    console.log("Saved Data: ", appointmentData);
    window.location.href = `entry.html?id=${entryId}&source=inbox`;;
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
document.addEventListener("DOMContentLoaded", () => {
    const emailSpan = document.getElementById("account-email");
    const auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
        if (user) {
            // ✅ Still logged in and account exists
            const email = user.email;
            if (emailSpan) emailSpan.textContent = email;
            sessionStorage.setItem("adminEmail", email);
        } else {
            // ❌ User is not logged in or account was deleted
            if (emailSpan) emailSpan.textContent = "Not signed in";
            sessionStorage.removeItem("adminEmail");
        }
    });
});