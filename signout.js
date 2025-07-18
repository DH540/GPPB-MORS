document.addEventListener("DOMContentLoaded", () => {
  const signoutLinks = document.querySelectorAll(".signout");

  signoutLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // prevent <a> default behavior
      firebase.auth().signOut().then(() => {
        sessionStorage.clear(); // optional, good practice
        window.location.replace("index.html"); // prevents back navigation
      }).catch((error) => {
        console.error("Sign out error:", error);
      });
    });
  });
});
