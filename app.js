const API_URL = "https://script.google.com/macros/s/AKfycbxamcQlqbAauU9zj_F1K8349TR6klT8COjCAX6tX8g8-AuQ3ic1V6N2JYR2_QpNFAjX/exec";

console.log("✅ app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const form = document.getElementById("addPatientForm");
  const statusEl = document.getElementById("addStatus");

  if (!form) {
    console.error("❌ Form element not found in DOM");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📨 Form submitted");

    const name = document.getElementById("name").value.trim();
    const number = document.getElementById("number").value.trim();
    let recallDateRaw = document.getElementById("recallDate").value.trim();

    if (!name || !number || !recallDateRaw) {
      statusEl.textContent = "❌ Please fill in all fields.";
      return;
    }

    // Convert dd-mm-yyyy to yyyy-mm-dd if needed
    let recallDate = recallDateRaw;
    if (/^\d{2}-\d{2}-\d{4}$/.test(recallDateRaw)) {
      const [dd, mm, yyyy] = recallDateRaw.split("-");
      recallDate = `${yyyy}-${mm}-${dd}`;
    }

    const url = `${API_URL}?action=addPatient&name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&recallDate=${encodeURIComponent(recallDate)}`;

    try {
      const res = await fetch(url);
      const result = await res.json();

      console.log("📬 API Response:", result);

      if (result.status === "success") {
        statusEl.textContent = "✅ Patient added!";
      } else {
        statusEl.textContent = `❌ Error adding patient. ${result.message || ''}`;
      }
    } catch (err) {
      console.error("❌ API fetch failed:", err);
      statusEl.textContent = "❌ Failed to contact server.";
    }

    form.reset();
    loadRecalls();
  });

  loadRecalls(); // Load recall list on page load
});

async function loadRecalls() {
  const listEl = document.getElementById("recallList");
  listEl.innerHTML = "<p class='text-gray-500'>Loading...</p>";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    console.log("📋 Recall data:", data);

    if (!data.rows || !data.rows.length) {
      listEl.innerHTML = "<p class='text-gray-500'>No recall entries found.</p>";
      return;
    }

    listEl.innerHTML = "";
    data.rows.forEach((patient) => {
      const div = document.createElement("div");
      div.className = "bg-blue-50 border-l-4 border-blue-400 p-2 rounded";
      div.innerHTML = `<strong>${patient.Name}</strong> → ${patient.Number}<br>
        📅 ${patient.RecallDate} | Status: ${patient.Status}`;
      listEl.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error loading recalls:", err);
    listEl.innerHTML = "<p class='text-red-500'>Error loading recalls.</p>";
  }
}