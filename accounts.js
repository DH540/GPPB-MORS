// Firebase config
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
const db = firebase.database();

// DOM elements
const addUserForm = document.getElementById('addUserForm');
const showFormBtn = document.getElementById('showFormBtn');
const accountTableBody = document.getElementById('accountTableBody');
const message = document.getElementById('message');

// Modal elements
const manageModal = document.getElementById('manageModal');
const manageForm = document.getElementById('manageForm');
const manageEncodedEmail = document.getElementById('manageEncodedEmail');
const manageEmail = document.getElementById('manageEmail');
const managePassword = document.getElementById('managePassword');
const deleteBtn = document.getElementById('deleteBtn');

// Show/Hide form
showFormBtn.addEventListener('click', () => {
    addUserForm.classList.toggle('hidden');
    message.textContent = '';
});

// Add user
addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        message.style.color = 'orange';
        message.textContent = '❗ Fill in all fields';
        return;
    }

    const encodedEmail = email.replace(/\./g, ',');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    db.ref('adminOtps/' + encodedEmail).set({
        email,
        password,
        otp,
        timestamp: Date.now()
    }, (error) => {
        if (error) {
            message.style.color = 'red';
            message.textContent = '❌ Failed to add user';
        } else {
            message.style.color = 'green';
            message.textContent = '✅ User added!';
            addUserForm.reset();
            addUserForm.classList.add('hidden');
            loadAccounts();
        }
    });
});

// Load accounts
function loadAccounts() {
    accountTableBody.innerHTML = '';
    db.ref('adminOtps').once('value').then(snapshot => {
        const data = snapshot.val();
        if (!data) return;

        const totalAccounts = Object.keys(data).length;

        Object.entries(data).forEach(([encodedEmail, entry]) => {
            const { email, password } = entry;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${email}</td>
                <td>${password ? '••••••••' : '—'}</td>
                <td>
                    <button onclick="openManageModal('${encodedEmail}', ${totalAccounts})" class="text-blue-500 hover:underline">Manage</button>
                </td>
            `;
            accountTableBody.appendChild(tr);
        });
    });
}

// Manage modal logic
function openManageModal(encodedEmail, totalAccounts) {
    db.ref('adminOtps/' + encodedEmail).once('value').then(snapshot => {
        const data = snapshot.val();
        if (!data) return;

        manageEncodedEmail.value = encodedEmail;
        manageEmail.value = data.email || '';
        managePassword.value = data.password || '';
        deleteBtn.dataset.totalAccounts = totalAccounts;

        manageModal.classList.remove('hidden');
    });
}

function closeManageModal() {
    manageModal.classList.add('hidden');
}

// Update account
manageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const encodedEmail = manageEncodedEmail.value;
    const email = manageEmail.value.trim();
    const password = managePassword.value.trim();

    if (!email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    const newEncodedEmail = email.replace(/\./g, ',');
    const newData = { email, password, timestamp: Date.now() };

    if (encodedEmail === newEncodedEmail) {
        db.ref('adminOtps/' + encodedEmail).update(newData).then(() => {
            closeManageModal();
            loadAccounts();
        });
    } else {
        db.ref('adminOtps/' + encodedEmail).remove().then(() => {
            db.ref('adminOtps/' + newEncodedEmail).set(newData).then(() => {
                closeManageModal();
                loadAccounts();
            });
        });
    }
});

// Delete account
deleteBtn.addEventListener('click', () => {
    const encodedEmail = manageEncodedEmail.value;
    const total = parseInt(deleteBtn.dataset.totalAccounts);

    if (total <= 1) {
        alert("⚠️ Cannot delete the last remaining admin account.");
        return;
    }

    if (confirm("Are you sure you want to delete this account?")) {
        db.ref('adminOtps/' + encodedEmail).remove().then(() => {
            closeManageModal();
            loadAccounts();
        });
    }
});

// Init
window.onload = loadAccounts;
