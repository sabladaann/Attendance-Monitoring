const studentData = {
  3870129780: {
    name: "Vincent B. Arevalo",
    studentNumber: "20223804-C",
    yearSection: "1A",
  },
  3871926596: {
    name: "Jensel S. Legara",
    studentNumber: "20220169-C",
    yearSection: "2C",
  },
  3871115780: {
    name: "Lawrence C. Dacillo",
    studentNumber: "20220754-C",
    yearSection: "1B",
  },
  3870689044: {
    name: "Babie Ann A. Sablada",
    studentNumber: "20220561-C",
    yearSection: "2A",
  },
  3872479476: {
    name: "Samantha Marie L. Descalzo",
    studentNumber: "20221051-C",
    yearSection: "2B",
  },
  3870086644: {
    name: "Ma. Micaella S. Conception",
    studentNumber: "20220593-C ",
    yearSection: "3A",
  },
  3871002244: {
    name: "Honey Lie G. Olayres",
    studentNumber: "20220936-C",
    yearSection: "3B",
  },
  3871210836: {
    name: "Joshua Daniel S. Rivera",
    studentNumber: "20221271-C",
    yearSection: "4A",
  },
  3872677108: {
    name: "Lourraine T. Ceprez",
    studentNumber: "20220538-C",
    yearSection: "3B",
  },
  3872115204: {
    name: "Mary Grace G. Dizon",
    studentNumber: "20221148-N",
    yearSection: "4B",
  },
};

// DOM Elements
const passkeyInput = document.getElementById("passkey");
const studentInfoDiv = document.getElementById("student-info");
const showAttendanceBtn = document.getElementById("show-attendance");
const cameraModal = document.getElementById("camera-modal");
const videoElement = document.getElementById("camera-video");
const timerElement = document.getElementById("camera-timer");
const captureNowBtn = document.getElementById("capture-now");
const cancelBtn = document.getElementById("cancel-camera");

// Initialize attendance in localStorage if not exists
if (!localStorage.getItem("attendance")) {
  localStorage.setItem("attendance", JSON.stringify({}));
}

// Focus on the input field when the page loads
window.addEventListener("load", () => {
  passkeyInput.focus();
});

// Save attendance record
function saveAttendance(passkey) {
  const attendance = JSON.parse(localStorage.getItem("attendance"));
  const today = new Date().toLocaleDateString();
  const now = new Date().toLocaleTimeString();

  if (!attendance[today]) {
    attendance[today] = {};
  }

  if (!attendance[today][passkey]) {
    attendance[today][passkey] = {
      ...studentData[passkey],
      timeIn: now,
      timeOut: null,
      image: null,
    };
    openCamera(passkey); // Capture image for attendance
  } else if (
    attendance[today][passkey].timeIn &&
    !attendance[today][passkey].timeOut
  ) {
    attendance[today][passkey].timeOut = now;
    openCamera(passkey); // Capture image for time out
  } else {
    studentInfoDiv.innerHTML += `<p style="color: red;">Attendance already completed for today.</p>`;
    passkeyInput.value = "";
    return;
  }

  localStorage.setItem("attendance", JSON.stringify(attendance));
  passkeyInput.value = "";
}

// Handle passkey input
passkeyInput.addEventListener("input", (e) => {
  const passkey = e.target.value;
  if (studentData[passkey]) {
    const student = studentData[passkey];
    studentInfoDiv.innerHTML = `
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>Student Number:</strong> ${student.studentNumber}</p>
      <p><strong>Year & Section:</strong> ${student.yearSection}</p>
    `;
    saveAttendance(passkey);
  } else {
    studentInfoDiv.innerHTML = "<p>No student found with this passkey.</p>";
  }
});

// Show attendance page
showAttendanceBtn.addEventListener("click", () => {
  window.location.href = "attendance.html";
});

// Open camera with enhanced UI
function openCamera(passkey) {
  const dateKey = new Date().toLocaleDateString();
  const existingImage = localStorage.getItem(
    `capturedImage_${passkey}_${dateKey}`
  );

  if (existingImage) {
    studentInfoDiv.innerHTML += `<p style="color: red;">Time out saved successfully.</p>`;
    return;
  }

  // Show camera modal
  cameraModal.style.display = "flex";
  passkeyInput.disabled = true;

  let stream = null;
  let timerInterval = null;
  let timeLeft = 2; // Seconds until auto-capture

  // Update timer display
  function updateTimer() {
    timerElement.textContent = timeLeft;
    if (timeLeft <= 3) {
      timerElement.style.backgroundColor = "#e74c3c";
    } else {
      timerElement.style.backgroundColor = "#3498db";
    }
  }

  // Capture image function
  function captureImage() {
    // Create flash effect
    const flash = document.createElement("div");
    flash.className = "capture-flash active";
    document.querySelector(".camera-preview-container").appendChild(flash);

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");

      // Draw image with face outline area
      ctx.drawImage(videoElement, 0, 0);

      const image = canvas.toDataURL("image/jpeg");
      localStorage.setItem(`capturedImage_${passkey}_${dateKey}`, image);

      // Update attendance record
      const attendance = JSON.parse(localStorage.getItem("attendance"));
      attendance[dateKey][passkey].image = image;
      localStorage.setItem("attendance", JSON.stringify(attendance));

      // Clean up
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(timerInterval);
      cameraModal.style.display = "none";
      passkeyInput.disabled = false;
      passkeyInput.focus();
      studentInfoDiv.innerHTML = "";
      window.location.href = "camera.html";
      showPopup("Attendance recorded successfully");
    }, 300);
  }


  // Start camera
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
    .then((cameraStream) => {
      stream = cameraStream;
      videoElement.srcObject = stream;

      // Start countdown
      updateTimer();
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
          captureImage();
        }
      }, 1000);
    })
    .catch((err) => {
      console.error("Camera error:", err);
      cameraModal.style.display = "none";
      passkeyInput.disabled = false;
      studentInfoDiv.innerHTML += `<p style="color: red;">Camera error: ${err.message}</p>`;
    });

  // Button event listeners
  captureNowBtn.addEventListener("click", captureImage);
  cancelBtn.addEventListener("click", () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(timerInterval);
    cameraModal.style.display = "none";
    passkeyInput.disabled = false;
    passkeyInput.focus();
  });
}

// Show popup message
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className = "popup-message";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("fade-out");
    setTimeout(() => popup.remove(), 500);
  }, 2000);
}

