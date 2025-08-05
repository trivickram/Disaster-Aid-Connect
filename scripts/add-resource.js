const API_URL = "https://7oajh53jyi.execute-api.ap-south-1.amazonaws.com/dev/add-resource";

document.getElementById("resourceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(e.target));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // Parse the nested JSON in the body field
    const messageObj = JSON.parse(result.body);
    console.log("Parsed message:", messageObj);
    
    alert(messageObj.message); // ✅ This will now work

  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong");
  }
});
