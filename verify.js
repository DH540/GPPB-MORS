document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(".otp-input");

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
        // Move to next input
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

  // Get full OTP value on verify click
  document.getElementById("button-verify").addEventListener("click", () => {
    const code = Array.from(inputs).map((input) => input.value).join("");
    const message = document.getElementById("message");

    if (code.length < 6) {
      message.textContent = "Please complete the 6-digit code.";
    } else {
      message.textContent = "";
      console.log("✅ Entered code:", code);
    }
  });
});