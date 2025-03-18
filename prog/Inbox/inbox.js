function showAllRows() {
    document.querySelectorAll('.inbox-row').forEach(row => {
        row.style.display = "";
    });
}

function searchTable() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const rows = document.querySelectorAll('.inbox-row');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

function toggleSelectAll(button) {
    const checkboxes = document.querySelectorAll('.table tbody input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked; // Toggle selection
    });
}

function refreshPage() {
    location.reload(); // Reload the page
}

function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll("tbody input[type='checkbox']:checked");

    checkboxes.forEach((checkbox) => {
        checkbox.closest("tr").remove(); // Remove the entire row
    });
}

let currentOrder = "asc"; // Default order
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
            valueA = new Date(rowA.cells[2].textContent.trim()); // Assuming Date is in column index 2
            valueB = new Date(rowB.cells[2].textContent.trim());
        } else if (column === "name") {
            valueA = rowA.cells[0].textContent.trim().toLowerCase(); // Assuming Name is in column index 0
            valueB = rowB.cells[0].textContent.trim().toLowerCase();
        }

        return order === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    // Reattach sorted rows to the table
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