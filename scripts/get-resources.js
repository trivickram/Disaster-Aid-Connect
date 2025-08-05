const API_URL = "https://7oajh53jyi.execute-api.ap-south-1.amazonaws.com/dev/get-resources";

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    const items = data.body ? JSON.parse(data.body) : data;
    const tableBody = document.querySelector("#resourceTable tbody");

    if (!Array.isArray(items) || items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No resources found</td></tr>`;
      return;
    }

    items.forEach(resource => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${resource.type}</td>
        <td>${resource.location}</td>
        <td>${resource.contact}</td>
        <td>${resource.description}</td>
        <td>${new Date(resource.timestamp).toLocaleString()}</td>
      `;

      tableBody.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Error fetching resources:", err);
    const tableBody = document.querySelector("#resourceTable tbody");
    tableBody.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
  });
