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
        // Ignore multi-character input (like paste)
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

  function verifyOTP() {
    const code = Array.from(inputs).map((input) => input.value).join("");

    if (code.length < 6) {
      message.style.color = "orange";
      message.textContent = "Please complete the 6-digit code.";
      return;
    }

    const storedOTP = sessionStorage.getItem("generatedOTP");

    if (code === storedOTP) {
      message.style.color = "green";
      message.textContent = "Verification successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "inbox.html";
      }, 1000);
    } else {
      message.style.color = "red";
      message.textContent = "Invalid code. Please try again.";
    }
  }

  // ✅ Button click
  verifyButton.addEventListener("click", verifyOTP);

  // ✅ ENTER key support
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyOTP();
    }
  });
});
