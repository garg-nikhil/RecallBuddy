const API_URL = "https://script.google.com/macros/s/AKfycbwg920kMFGpTkNX4QDYjjBl2Rj2OiHd6UTEvE7mQdRH8va1IDZpct6NWv-PC3bLFFVg/exec";

document.getElementById("addPatientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = encodeURIComponent(document.getElementById("name").value.trim());
  const number = encodeURIComponent(document.getElementById("number").value.trim());
  let recallDateRaw = document.getElementById("recallDate").value.trim();

  // Assume input is already yyyy-mm-dd from a date picker control
  let recallDate = encodeURIComponent(recallDateRaw);

  const url = `${API_URL}?action=addPatient&name=${name}&number=${number}&recallDate=${recallDate}`;
  const res = await fetch(url);
  const result = await res.json();
  console.log("API response:", result);
  document.getElementById("addStatus").textContent =
    result.status === "success" ? "✅ Patient added!" : `❌ Error adding patient. ${result.message || ''}`;

  document.getElementById("addPatientForm").reset();
  loadRecalls();
});

async function loadRecalls() {
  const listEl = document.getElementById("recallList");
  listEl.innerHTML = "<p class='text-gray-500'>Loading...</p>";

  try {
    const res = await fetch(API_URL + "?action=upcomingRecalls");
    const data = await res.json();
    const patients = data.filteredRows || []; // Correct key!
    if (!patients.length) {
      listEl.innerHTML = "<p class='text-gray-500'>No upcoming recalls found.</p>";
      return;
    }
    listEl.innerHTML = "";
    patients.forEach((patient) => {
      const div = document.createElement("div");
      div.className = "bg-blue-50 border-l-4 border-blue-400 p-2 rounded";
      div.innerHTML = `<strong>${patient.Name}</strong> → ${patient.Number}<br>
        📅 ${patient.RecallDate} | Status: ${patient.Status}`;
      listEl.appendChild(div);
    });
  } catch (err) {
    listEl.innerHTML = "<p class='text-red-500'>Error loading upcoming recalls.</p>";
  }
}

// Optionally, you can add a function to load upcoming recalls if needed:
// async function loadUpcomingRecalls() {
//   ...
// }

loadRecalls();