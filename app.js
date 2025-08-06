const API_URL = "https://script.google.com/macros/s/AKfycbwg920kMFGpTkNX4QDYjjBl2Rj2OiHd6UTEvE7mQdRH8va1IDZpct6NWv-PC3bLFFVg/exec";

// ------- Tab Navigation Logic -------
function showTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(div => div.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}
// Setup tab click listeners
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showTab(btn.dataset.tab);
    if (btn.dataset.tab === 'upcomingTab') loadUpcomingRecalls();
    if (btn.dataset.tab === 'patientsTab') loadAllPatients();
  });
});
// Show dashboard first
showTab('dashboardTab');

// ------- Upcoming Recalls Loading -------
async function loadUpcomingRecalls() {
  const days = document.getElementById("recallDaysFilter").value;
  const listEl = document.getElementById("recallList");
  listEl.innerHTML = "<p class='text-gray-500'>Loading...</p>";

  try {
    const res = await fetch(`${API_URL}?action=upcomingRecalls&days=${days}`);
    const data = await res.json();
    const patients = data.filteredRows || [];
    if (!patients.length) {
      listEl.innerHTML = "<p class='text-gray-500'>No upcoming recalls found for selected days.</p>";
      return;
    }
    listEl.innerHTML = "";
    patients.forEach(({ Name, Number, RecallDate, Status, Notes }) => {
      const div = document.createElement("div");
      div.className = "bg-blue-50 border-l-4 border-blue-400 p-2 rounded";
      div.innerHTML =
        `<strong>${Name}</strong> → ${Number}<br>
         📅 <b>${RecallDate}</b> | Status: ${Status}${Notes ? `<br>🗒️ ${Notes}` : ''}`;
      listEl.appendChild(div);
    });
  } catch (err) {
    listEl.innerHTML = "<p class='text-red-500'>Error loading upcoming recalls.</p>";
  }
}
document.getElementById("recallDaysFilter").addEventListener("change", loadUpcomingRecalls);

// ------- All Patients Table -------
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
        <td class="border border-gray-300 px-2 py-1">${RecallDate}</td>
        <td class="border border-gray-300 px-2 py-1">${Status}</td>
        <td class="border border-gray-300 px-2 py-1">${Notes}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5'>Error loading patients.</td></tr>";
  }
}

// ------- Add Patient Logic -------
document.getElementById("addPatientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = encodeURIComponent(document.getElementById("name").value.trim());
  const number = encodeURIComponent(document.getElementById("number").value.trim());
  const recallDateRaw = document.getElementById("recallDate").value.trim(); // yyyy-mm-dd

  const recallDate = encodeURIComponent(recallDateRaw);

  const url = `${API_URL}?action=addPatient&name=${name}&number=${number}&recallDate=${recallDate}`;
  const res = await fetch(url);
  const result = await res.json();

  document.getElementById("addStatus").textContent =
    result.status === "success"
      ? "✅ Patient added!"
      : `❌ Error adding patient. ${result.message || ''}`;

  document.getElementById("addPatientForm").reset();
  // Optionally, refresh lists
  // loadUpcomingRecalls();
  // loadAllPatients();
});

// ------- Initial Loads -------
document.addEventListener("DOMContentLoaded", () => {
  loadUpcomingRecalls();
  loadAllPatients();
});
