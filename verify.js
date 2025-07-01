document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(".otp-input");

  // Focus on first input when page loads
  inputs[0].focus();

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;

      if (value.length > 1) {
        // If pasted more than 1 character (like full 6-digit paste)
        handlePaste(value);
        return;
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

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text");
      handlePaste(paste);
    });
  });

  function handlePaste(paste) {
    const digits = paste.replace(/\D/g, "").slice(0, 6).split("");
    digits.forEach((digit, i) => {
      if (inputs[i]) inputs[i].value = digit;
    });

    // Focus last filled box
    const last = digits.length < 6 ? digits.length : 5;
    inputs[last].focus();
  }

  // Optional: Get full OTP value on verify click
  document.getElementById("button-verify").addEventListener("click", () => {
    const code = Array.from(inputs).map((input) => input.value).join("");
    const message = document.getElementById("message");

    if (code.length < 6) {
      message.textContent = "Please complete the 6-digit code.";
    } else {
      message.textContent = "";
      console.log("✅ Entered code:", code);
      // TODO: Proceed to verify against your backend/Firebase/email logic
    }
  });
});