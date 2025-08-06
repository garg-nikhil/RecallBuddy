const API_URL = "https://script.google.com/macros/s/AKfycbwg920kMFGpTkNX4QDYjjBl2Rj2OiHd6UTEvE7mQdRH8va1IDZpct6NWv-PC3bLFFVg/exec";

// Format yyyy-mm-dd as 'DD MMM' for display
function formatDisplayDate(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";
  // Defensive splitting (some inputs may be empty or invalid)
  const parts = yyyy_mm_dd.split("-");
  if (parts.length < 3) return yyyy_mm_dd;
  const [yyyy, mm, dd] = parts;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  if (isNaN(date)) return yyyy_mm_dd;
  const monthMap = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(dd,10)} ${monthMap[date.getMonth()]}`;
}

// Show/hide tabs and update active button styles
function showTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(div => div.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showTab(btn.dataset.tab);
    if (btn.dataset.tab === "upcomingTab") loadUpcomingRecalls();
    else if (btn.dataset.tab === "patientsTab") loadAllPatients();
  });
});

showTab('dashboardTab'); // Default tab on load

// Load Upcoming Appointments
async function loadUpcomingRecalls() {
  const days = document.getElementById("recallDaysFilter").value;
  const listEl = document.getElementById("recallList");
  listEl.innerHTML = "<p class='text-gray-500'>Loading...</p>";

  try {
    const res = await fetch(`${API_URL}?action=upcomingRecalls&days=${days}`);
    const data = await res.json();
    const patients = data.filteredRows || [];
    if (!patients.length) {
      listEl.innerHTML = `<p class='text-gray-500'>No upcoming appointments for next ${days} days.</p>`;
      return;
    }
    listEl.innerHTML = "";

    patients.forEach(({ Name, Number, RecallDate, Status, Notes }) => {
      const div = document.createElement("div");
      div.className = "bg-blue-50 border-l-4 border-blue-400 p-2 rounded";
      div.innerHTML =
        `<strong>${Name}</strong> → ${Number}<br>
         📅 <b>${formatDisplayDate(RecallDate)}</b> | Status: ${Status}${Notes ? `<br>🗒️ ${Notes}` : ''}`;
      listEl.appendChild(div);
    });
  } catch (err) {
    listEl.innerHTML = "<p class='text-red-500'>Error loading upcoming appointments.</p>";
  }
}

document.getElementById("recallDaysFilter").addEventListener("change", loadUpcomingRecalls);

// Load All Patients
async function loadAllPatients() {
  const tbody = document.querySelector("#allPatientsTable tbody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const patients = data.rows || [];
    if (!patients.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No patients found.</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    patients.forEach(({ Name, Number, RecallDate, Status, Notes }) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border border-gray-300 px-2 py-1">${Name}</td>
        <td class="border border-gray-300 px-2 py-1">${Number}</td>
        <td class="border border-gray-300 px-2 py-1">${formatDisplayDate(RecallDate)}</td>
        <td class="border border-gray-300 px-2 py-1">${Status}</td>
        <td class="border border-gray-300 px-2 py-1">${Notes}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5'>Error loading patients.</td></tr>";
  }
}

// Add Patient form submission
document.getElementById("addPatientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const number = document.getElementById("number").value.trim();
  const recallDateRaw = document.getElementById("recallDate").value.trim();

  if (!name || !number || !recallDateRaw) {
    document.getElementById("addStatus").textContent = "❌ Please fill all required fields.";
    return;
  }

  const url = `${API_URL}?action=addPatient&name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&recallDate=${encodeURIComponent(recallDateRaw)}`;

  try {
    const res = await fetch(url);
    const result = await res.json();

    document.getElementById("addStatus").textContent =
      result.status === "success"
        ? "✅ Patient added!"
        : `❌ Error adding patient. ${result.message || ''}`;

    if (result.status === "success") {
      document.getElementById("addPatientForm").reset();
      // Refresh lists
      loadUpcomingRecalls();
      loadAllPatients();
    }
  } catch (err) {
    document.getElementById("addStatus").textContent = "❌ Unexpected error occurred.";
  }
});

// Initial data loading on page ready
document.addEventListener("DOMContentLoaded", () => {
  loadUpcomingRecalls();
  loadAllPatients();
});
