const firebaseConfig = {
    apiKey: "AIzaSyBEJMTq5PQNrwDELbuqGfIFGFxJ3S-ke_Q",
    authDomain: "css151l-6290e.firebaseapp.com",
    databaseURL: "https://css151l-6290e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "css151l-6290e",
    storageBucket: "css151l-6290e.firebasestorage.app",
    messagingSenderId: "907702008183",
    appId: "1:907702008183:web:9dbb807a3db2e2958bc972"
};

// ✅ Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(".otp-input");
  const message = document.getElementById("message");
  const verifyButton = document.getElementById("button-verify");

  // Focus on first input when page loads
  inputs[0].focus();

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;

      if (value.length > 1) {
        e.target.value = value.charAt(0);
      }

      if (value.match(/[0-9]/)) {
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      } else {
        e.target.value = "";
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  async function verifyOTP() {
    const code = Array.from(inputs).map((input) => input.value).join("");

    if (code.length < 6) {
      message.style.color = "orange";
      message.textContent = "Please complete the 6-digit code.";
      return;
    }

    const email = sessionStorage.getItem("adminEmail");
    if (!email) {
      message.style.color = "red";
      message.textContent = "Session expired. Please login again.";
      setTimeout(() => window.location.href = "login.html", 1500);
      return;
    }

    const sanitizedEmail = email.replace('.', ',');

    try {
      const snapshot = await firebase.database().ref("adminOtps").child(sanitizedEmail).get();

      if (!snapshot.exists()) {
        message.style.color = "red";
        message.textContent = "OTP not found.";
        return;
      }

      const { otp, timestamp } = snapshot.val();
      const now = Date.now();

      if (now - timestamp > 5 * 60 * 1000) {
        message.style.color = "red";
        message.textContent = "OTP expired. Please login again.";
        return;
      }

      if (code === otp) {
        message.style.color = "green";
        message.textContent = "Verification successful! Redirecting...";

        setTimeout(() => {
          window.location.href = "inbox.html"; // Update this if needed
        }, 1000);
      } else {
        message.style.color = "red";
        message.textContent = "Invalid code. Please try again.";
      }

    } catch (err) {
      console.error("OTP verification error:", err);
      message.style.color = "red";
      message.textContent = "Error verifying OTP. Try again.";
    }
  }

  verifyButton.addEventListener("click", verifyOTP);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyOTP();
    }
  });
});
