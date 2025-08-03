// app.js
const API_URL = "https://script.google.com/macros/s/AKfycbxamcQlqbAauU9zj_F1K8349TR6klT8COjCAX6tX8g8-AuQ3ic1V6N2JYR2_QpNFAjX/exec";


document.getElementById("addPatientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = encodeURIComponent(document.getElementById("name").value.trim());
  const number = encodeURIComponent(document.getElementById("number").value.trim());
  let recallDateRaw = document.getElementById("recallDate").value.trim();

  // Convert dd-mm-yyyy to yyyy-mm-dd if needed
  let recallDate = recallDateRaw;
  if (/^\d{2}-\d{2}-\d{4}$/.test(recallDateRaw)) {
    const [dd, mm, yyyy] = recallDateRaw.split("-");
    recallDate = `${yyyy}-${mm}-${dd}`;
  }
  recallDate = encodeURIComponent(recallDate);

  // Use GET request with query parameters
  const url = `${API_URL}?action=addPatient&name=${name}&number=${number}&recallDate=${recallDate}`;
  const res = await fetch(url);
  const result = await res.json();
  document.getElementById("addStatus").textContent =
    result.status === "success" ? "✅ Patient added!" : `❌ Error adding patient. ${result.message || ''}`;

  // Clear form
  document.getElementById("addPatientForm").reset();
  loadRecalls(); // reload list
});

async function loadRecalls() {
  const listEl = document.getElementById("recallList");
  listEl.innerHTML = "<p class='text-gray-500'>Loading...</p>";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.length) {
      listEl.innerHTML = "<p class='text-gray-500'>No recall entries found.</p>";
      return;
    }

    listEl.innerHTML = "";
    data.forEach((patient) => {
      const div = document.createElement("div");
      div.className = "bg-blue-50 border-l-4 border-blue-400 p-2 rounded";
      div.innerHTML = `<strong>${patient.Name}</strong> → ${patient.Number}<br>
        📅 ${patient.RecallDate} | Status: ${patient.Status}`;
      listEl.appendChild(div);
    });
  } catch (err) {
    listEl.innerHTML = "<p class='text-red-500'>Error loading recalls.</p>";
  }
}

loadRecalls();
