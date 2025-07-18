// authy.js — Firebase v8 Auth Guard for ALL protected pages

// Handle back/forward navigation — force reload if served from bfcache
window.addEventListener("pageshow", function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    window.location.reload();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      // Redirect with replace() to prevent Back navigation
      window.location.replace("index.html");
    } else {
      // Optional: Show email if #account-email element exists
      const emailElement = document.getElementById("account-email");
      if (emailElement) {
        emailElement.textContent = user.email;
      }

      // Optional: Make body visible only after auth check passes
      document.body.style.display = "block";
    }
  });
});
