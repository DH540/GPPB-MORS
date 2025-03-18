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
        document.getElementById("h-name").textContent = appointmentData.name;
        document.getElementById("h-email").textContent = appointmentData.email;
        document.getElementById("h-date").textContent = appointmentData.date;
        document.getElementById("d-name").textContent = appointmentData.name;
        document.getElementById("d-email").textContent = appointmentData.email;
        document.getElementById("phone").textContent = appointmentData.phone;
        document.getElementById("company").textContent = appointmentData.company;
        document.getElementById("interest").textContent = appointmentData.interest;
        document.getElementById("d-date").textContent = appointmentData.date;
        document.getElementById("time").textContent = appointmentData.time;
        document.getElementById("comments").textContent = appointmentData.comments;
    }
});

function sendMail(action){

var testEmail = "dylanaguillosalazar@gmail.com"; //BRENT OVER HERE
var userName = document.querySelector(".text-right:nth-child(2)")?.innerText || "Client";
var userEmail = document.querySelector(".text-right:nth-child(4)")?.innerText || "example@example.com";
var userDate = document.querySelector(".text-right:nth-child(12)")?.innerText || "N/A"; //ETO DAPAT UNG GAGAMITIN BUT TEST EMAIL MUNA
var userTime = document.querySelector(".text-right:nth-child(14)")?.innerText || "N/A";
var requestID = document.querySelector(".text-right:nth-child(16)")?.innerText || "REQ0000";

let templateID;

if (action === "approved") {
    templateID = "template_wkj756d";
} else if (action === "rejected") {
    templateID = "template_ujmyzh4";
} else if (action === "rescheduled") {
    templateID = " ";
}

const params = {
    name: userName,
    email: testEmail,
    appt_date: userDate,
    appt_time: userTime,
    request_id: requestID,
    consultation_mode: "Online",
    consultation_link: action === "approved" ? "https://meet.example.com/12345" : "" 
};

const serviceID = "service_ob944xf";  

emailjs.send(serviceID, templateID, params)
    .then(res => {
        alert("Email sent successfully!");
        console.log(res);
    })
    .catch(err => console.error("Failed to send email", err));
}

var params = {
    name: document.getElementById("name").value ,
    email: document.getElementById("email").value ,
    message: document.getElementById("message").value
}

const serviceID = "service_ob944xf";
const templateID = "template_wkvq4nl";

emailjs.send(serviceID,templateID,params)
.then( res => {
    document.getElementById("name").value = " ";
    document.getElementById("email").value = " ";
    document.getElementById("message").value = " ";
    console.log(res);
    alert("your message sent successfully");
    }
)

.catch(err => console.log(err));