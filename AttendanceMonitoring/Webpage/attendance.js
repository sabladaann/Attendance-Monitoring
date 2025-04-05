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
const attendanceBody = document.getElementById("attendance-body");
const prevDateButton = document.getElementById("prev-date");
const nextDateButton = document.getElementById("next-date");
const currentDateSpan = document.getElementById("current-date");
const searchInput = document.getElementById("search");
const exportCsvButton = document.getElementById("export-csv");
const yearFilterButtons = document.querySelectorAll(".filter-btn");
const sectionFiltersContainer = document.getElementById("section-filters");

// Filter state
let currentDate = new Date();
let selectedYear = "all";
let selectedSection = "all";

// Initialize the page
function init() {
  currentDateSpan.textContent = currentDate.toLocaleDateString();
  loadAttendance(currentDate);
  setupEventListeners();
  updateSectionFilters();
  setupImageModal(); // Add this line
}

// Set up all event listeners
function setupEventListeners() {
  // Date navigation
  prevDateButton.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadAttendance(currentDate);
  });

  nextDateButton.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadAttendance(currentDate);
  });

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    filterTableBySearch(query);
  });

  // Export CSV
  exportCsvButton.addEventListener("click", exportToCSV);

  // Year filter buttons
  yearFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedYear = button.dataset.year;
      updateActiveFilterButtons();
      updateSectionFilters();
      loadAttendance(currentDate);
    });
  });

  // Reset modal functionality
  setupResetModal();
}

// Update the date display
function updateDateDisplay() {
  currentDateSpan.textContent = currentDate.toLocaleDateString();
  currentDateSpan.style.animation = "none";
  void currentDateSpan.offsetWidth; // Trigger reflow
  currentDateSpan.style.animation = "float 0.5s ease";
}

// Update active state of filter buttons
function updateActiveFilterButtons() {
  yearFilterButtons.forEach((button) => {
    if (button.dataset.year === selectedYear) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  const sectionButtons = document.querySelectorAll(".section-btn");
  sectionButtons.forEach((button) => {
    if (button.dataset.section === selectedSection) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// Update section filters based on selected year
function updateSectionFilters() {
  // Clear existing section buttons except "All"
  sectionFiltersContainer.innerHTML =
    '<button class="section-btn" data-section="all">All Sections</button>';

  // Get unique sections for the selected year
  const sections = new Set();
  for (const passkey in studentData) {
    const student = studentData[passkey];
    if (
      selectedYear === "all" ||
      student.yearSection.startsWith(selectedYear)
    ) {
      sections.add(student.yearSection);
    }
  }

  // Add section buttons
  sections.forEach((section) => {
    const button = document.createElement("button");
    button.className = "section-btn";
    button.dataset.section = section;
    button.textContent = section;
    button.addEventListener("click", () => {
      selectedSection = section;
      updateActiveFilterButtons();
      loadAttendance(currentDate);
    });
    sectionFiltersContainer.appendChild(button);
  });

  // Add click handler for "All Sections" button
  document
    .querySelector('.section-btn[data-section="all"]')
    .addEventListener("click", () => {
      selectedSection = "all";
      updateActiveFilterButtons();
      loadAttendance(currentDate);
    });

  updateActiveFilterButtons();
}

// Load attendance data
function loadAttendance(date) {
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  const dateKey = date.toLocaleDateString();
  const dateAttendance = attendance[dateKey] || {};

  attendanceBody.innerHTML = "";

  for (const passkey in studentData) {
    const student = studentData[passkey];

    // Apply filters
    if (selectedYear !== "all" && !student.yearSection.startsWith(selectedYear))
      continue;
    if (selectedSection !== "all" && student.yearSection !== selectedSection)
      continue;

    const studentAttendance = dateAttendance[passkey];
    const timeIn = studentAttendance?.timeIn || "";
    const timeOut = studentAttendance?.timeOut || "";
    const capturedImage = localStorage.getItem(
      `capturedImage_${passkey}_${dateKey}`
    );

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.studentNumber}</td>
        <td>${student.yearSection}</td>
        <td class="${studentAttendance ? "attended" : "not-attended"}">
            ${studentAttendance ? "Present" : "Absent"}
        </td>
        <td>
            ${
              capturedImage
                ? `<img src="${capturedImage}" alt="Attendance Image" width="100" class="thumbnail-image">`
                : "No Image"
            }
        </td>
        <td>${timeIn}</td>
        <td>${timeOut}</td>
      `;
    attendanceBody.appendChild(row);
  }

  // Add click handlers to all thumbnail images
  document.querySelectorAll(".thumbnail-image").forEach((img) => {
    img.addEventListener("click", (e) => {
      const modal = document.getElementById("image-modal");
      const modalImg = document.getElementById("modal-image");
      modalImg.src = e.target.src;
      modal.style.display = "flex";
    });
  });
}
// Filter table by search query
function filterTableBySearch(query) {
  const rows = attendanceBody.querySelectorAll("tr");
  const date = currentDateSpan.textContent.toLowerCase();

  rows.forEach((row) => {
    const name = row.querySelector("td:nth-child(1)").textContent.toLowerCase();
    const studentNumber = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();
    const yearSection = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase();

    if (
      name.includes(query) ||
      studentNumber.includes(query) ||
      yearSection.includes(query) ||
      date.includes(query)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Export to CSV
function exportToCSV() {
  const attendance = JSON.parse(localStorage.getItem("attendance"));
  const dateKey = currentDate.toLocaleDateString();
  const dateAttendance = attendance?.[dateKey] || {};

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Name,Student Number,Year & Section,Status,Time In,Time Out\n";

  for (const passkey in studentData) {
    const student = studentData[passkey];

    // Apply filters
    if (selectedYear !== "all" && !student.yearSection.startsWith(selectedYear))
      continue;
    if (selectedSection !== "all" && student.yearSection !== selectedSection)
      continue;

    const studentAttendance = dateAttendance[passkey];
    const status = studentAttendance ? "Present" : "Absent";
    const timeIn = studentAttendance?.timeIn || "N/A";
    const timeOut = studentAttendance?.timeOut || "N/A";

    csvContent += `"${student.name}","${student.studentNumber}","${student.yearSection}","${status}","${timeIn}","${timeOut}"\n`;
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `attendance_${dateKey}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Reset modal functionality
function setupResetModal() {
  const RESET_CREDENTIALS = {
    username: "admin",
    password: "admin123",
  };

  const resetModal = document.getElementById("reset-modal");
  const resetButton = document.getElementById("reset-data");
  const closeModal = document.querySelector(".close");
  const confirmResetButton = document.getElementById("confirm-reset");
  const resetError = document.getElementById("reset-error");

  resetButton.addEventListener("click", () => {
    resetModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    resetModal.style.display = "none";
    resetError.textContent = "";
  });

  window.addEventListener("click", (event) => {
    if (event.target === resetModal) {
      resetModal.style.display = "none";
      resetError.textContent = "";
    }
  });

  confirmResetButton.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (
      username === RESET_CREDENTIALS.username &&
      password === RESET_CREDENTIALS.password
    ) {
      localStorage.removeItem("attendance");
      // Clear all captured images
      for (const key in localStorage) {
        if (key.startsWith("capturedImage_")) {
          localStorage.removeItem(key);
        }
      }
      window.location.reload();
    } else {
      resetError.textContent = "Invalid username or password.";
    }
  });
}

// Initialize the application
init();

function setupImageModal() {
  // Create modal elements
  const imageModal = document.createElement("div");
  imageModal.id = "image-modal";
  imageModal.className = "image-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "image-modal-content";

  const closeBtn = document.createElement("span");
  closeBtn.className = "image-modal-close";
  closeBtn.innerHTML = "&times;";

  const modalImage = document.createElement("img");
  modalImage.id = "modal-image";

  modalContent.appendChild(closeBtn);
  modalContent.appendChild(modalImage);
  imageModal.appendChild(modalContent);
  document.body.appendChild(imageModal);

  // Close modal when clicking X
  closeBtn.addEventListener("click", () => {
    imageModal.style.display = "none";
  });

  // Close modal when clicking outside image
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.style.display = "none";
    }
  });
}
