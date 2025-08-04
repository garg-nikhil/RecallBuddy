const API_URL = "https://script.google.com/macros/s/AKfycbwg920kMFGpTkNX4QDYjjBl2Rj2OiHd6UTEvE7mQdRH8va1IDZpct6NWv-PC3bLFFVg/exec";

// Load upcoming recalls based on selected days filter
async function loadUpcomingRecalls(days = 7) {
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
    patients.forEach(({ Name, Number, RecallDate, Status }) => {
      const div = document.createElement("div");
      div.className = "bg-blue-50 border-l-4 border-blue-400 p-2 rounded";
      div.innerHTML = `<strong>${Name}</strong> → ${Number}<br>
        📅 ${RecallDate} | Status: ${Status}`;
      listEl.appendChild(div);
    });
  } catch (err) {
    listEl.innerHTML = "<p class='text-red-500'>Error loading upcoming recalls.</p>";
  }
}

// Load all patients into a table
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
        <td>${Name}</td>
        <td>${Number}</td>
        <td>${RecallDate}</td>
        <td>${Status}</td>
        <td>${Notes}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5'>Error loading patients.</td></tr>";
  }
}

// Event listener for filter dropdown
document.getElementById("recallDaysFilter").addEventListener("change", (e) => {
  loadUpcomingRecalls(Number(e.target.value));
});

// On form submission for adding patient
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
    result.status === "success" ? "✅ Patient added!" : `❌ Error adding patient. ${result.message || ''}`;

  document.getElementById("addPatientForm").reset();
  loadUpcomingRecalls(document.getElementById("recallDaysFilter").value);
  loadAllPatients();
});

// Initial loads
loadUpcomingRecalls();
loadAllPatients();
