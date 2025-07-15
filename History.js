//PDF with stats
const { jsPDF } = window.jspdf;

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
        case "cancelled":
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
            const entryId = childSnapshot.key;

            // Skip entries with status "pending" (case-insensitive)
            if ((data.status || '').toLowerCase() === 'pending') return;

            // Normalize status for display (capitalize first letter for Approved, Cancelled, Rescheduled)
            let displayStatus = data.status || '';
            if (displayStatus.toLowerCase() === 'cancelled' || displayStatus.toLowerCase() === 'rejected') {
                displayStatus = 'Cancelled';
            } else if (displayStatus.toLowerCase() === 'approved') {
                displayStatus = 'Approved';
            } else if (displayStatus.toLowerCase() === 'rescheduled') {
                displayStatus = 'Rescheduled';
            }

            const formattedDateWords = formatDate(data.appointmentDate);

            const row = document.createElement("tr");
            row.classList.add("history-row");

            row.innerHTML = 
`<td><input type="checkbox"/></td>
<td class="cursor-pointer text-blue-600 hover:underline" onclick='openEntryView(
    "${entryId}",
    "${data.firstName || ''} ${data.lastName || ''}",
    "${data.email || ''}",
    "${data.phoneNumber || ''}",
    "${data.company || ''}",
    "${data.areaOfInterest || ''}",
    "${data.appointmentDate || ''}",
    "${data.appointmentTime || ''}",
    "${data.comments || ''}",
    "${displayStatus}"
)'>
    ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}
</td>
<td>Consultation Request for ${formattedDateWords}</td>
<td style="color: ${getStatusColor(data.status)}; font-weight: bold;">
${displayStatus}
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

    // For "cancelled" filter, match both "cancelled" and "rejected" statuses
    rows.forEach(row => {
        const statusCell = row.cells[3].textContent.trim().toLowerCase();
        if (status === 'rejected') {
            row.style.display = (statusCell === 'cancelled' || statusCell === 'rejected') ? "" : "none";
        } else {
            row.style.display = (statusCell === status) ? "" : "none";
        }
    });

    activeFilter = status;
}

function openEntryView(entryId, name, email, phone, company, interest, date, time, comments, status) {
    const appointmentData = {
        entryId, // 🔥 New: Save the unique Firebase key
        name,
        email,
        phone,
        company,
        interest,
        date,
        time,
        comments,
        status
    };
    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));
    console.log("Saved Data: ", appointmentData);
    window.location.href = `entry.html?id=${entryId}&source=history`;;
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

//JSON -> CSV
function jsonToCsv(items) {
  if (!items || !items.length) return '';

  const replacer = (key, value) => value === null ? '' : value; 
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','), 
    ...items.map(row => header.map(fieldName => 
      JSON.stringify(row[fieldName], replacer)
    ).join(','))
  ].join('\r\n');

  return csv;
}

//CSV -> PDF
async function exportCsvAsPdfWithGraph() {
  const snapshot = await database.ref("contactFormDB").once("value");
  const data = snapshot.val();

  if (!data) {
    alert("No data found.");
    return;
  }

  const items = Object.values(data);

  const statusCounts = {};
  items.forEach(entry => {
    const status = (entry.status || "Unknown").toLowerCase();
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const ctx = document.getElementById("statusChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(statusCounts).map(s => s[0].toUpperCase() + s.slice(1)),
      datasets: [{
        label: "Status Count",
        data: Object.values(statusCounts),
        backgroundColor: "#3B82F6"
      }]
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  await new Promise(resolve => setTimeout(resolve, 500));
  const chartImage = chart.toBase64Image();

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("GPPB-MORS", 14, 15);

  const csv = jsonToCsv(items);
  const lines = csv.trim().split("\r\n");
  const rawRows = lines.map(line => line.split(",").map(cell => cell.replace(/^"|"$/g, "")));

  const desiredOrder = [
    "firstName", "lastName", "email", "phoneNumber", "company", "jobPosition",
    "consultationInterest", "appointmentDate", "appointmentTime", "status"
  ];

  const headerMap = {};
  lines[0].split(",").forEach((h, i) => {
    headerMap[h.replace(/^"|"$/g, "")] = i;
  });

  const headers = desiredOrder.map(key => {
    switch (key) {
      case "appointmentDate": return "Appointment Date";
      case "appointmentTime": return "Appointment Time";
      case "firstName": return "First Name";
      case "lastName": return "Last Name";
      case "email": return "Email";
      case "phoneNumber": return "Phone Number";
      case "company": return "Company";
      case "consultationInterest": return "Consultation Interest";
      case "jobPosition": return "Job Position";
      case "status": return "Status";
      default: return key;
    }
  });

  const rows = rawRows.slice(1).map(row =>
    desiredOrder.map(key => {
      const index = headerMap[key];
      return index !== undefined ? row[index] : "";
    })
  );

  doc.autoTable({
    startY: 22,
    head: [headers],
    body: rows,
    styles: { fontSize: 9, cellPadding: 1, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 10, right: 10 },
    tableWidth: "auto",
    didDrawPage: function (data) {
      doc.lastTableY = data.cursor.y;
    }
  });

  const canvas = document.getElementById("statusChart");
  const imgWidth = 120;
  const aspectRatio = canvas.height / canvas.width;
  const imgHeight = imgWidth * aspectRatio;
  const chartTop = doc.lastTableY + 10;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (chartTop + imgHeight + 20 > pageHeight) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Status Overview", 14, 15);
    doc.addImage(chartImage, "PNG", 14, 20, imgWidth, imgHeight);
  } else {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Status Overview", 14, chartTop);
    doc.addImage(chartImage, "PNG", 14, chartTop + 5, imgWidth, imgHeight);
  }

  doc.save("GPPB-MORS-Export.pdf");
  chart.destroy();
}




//CSV export
window.exportContactFormDBAsCsv = function () {
  const ref = database.ref("contactFormDB");
  ref.once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        alert("No data to export.");
        return;
      }

      // Firebase data is an object keyed by IDs, convert to array of objects
      const itemsArray = Object.values(data);

      // Convert JSON array to CSV string
     const csv = jsonToCsv(items);
const lines = csv.trim().split("\r\n");
const rawRows = lines.map(line => line.split(",").map(cell => cell.replace(/^"|"$/g, "")));

// Define your desired column order by Firebase field name
const desiredOrder = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "company",
  "jobPosition",
  "consultationInterest",
  "appointmentDate",
  "appointmentTime",
  "status",
  //"additionaInfo"
];

// Map raw header positions
const headerMap = {};
lines[0].split(",").forEach((h, i) => {
  headerMap[h.replace(/^"|"$/g, "")] = i;
});

// Build ordered headers and rows
const headers = desiredOrder.map(key => {
  switch (key) {
    case "appointmentDate": return "Appointment Date";
    case "appointmentTime": return "Appointment Time";
    case "firstName": return "First Name";
    case "lastName": return "Last Name";
    case "email": return "Email";
    case "phoneNumber": return "Phone Number";
    case "company": return "Company";
    case "consultationInterest": return "Consultation Interest";
    case "jobPosition": return "Job Position";
    case "status": return "Status";
    //case "additionaInfo": return "Additional Info";
    default: return key;
  }
});

// Build rows in the correct order
const rows = rawRows.slice(1).map(row =>
  desiredOrder.map(key => {
    const index = headerMap[key];
    return index !== undefined ? row[index] : "";
  })
);


      // Download CSV as a file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contactFormDB-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error("❌ Failed to export data:", error);
      alert("Error exporting data. Check console for details.");
    });
};
function toggleExportMenu() {
  const menu = document.getElementById("exportMenu");
  menu.classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".export-dropdown");
  const menu = document.getElementById("exportMenu");

  if (!dropdown.contains(event.target)) {
    menu.classList.add("hidden");
  }
});