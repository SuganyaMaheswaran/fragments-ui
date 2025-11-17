// src/app.js
import { signIn, signOut, getUser } from "./auth";
import { getUserFragments } from "./api";


async function init() {

  // Login / logout handlers
  loginBtn.onclick = () => signIn();
  logoutBtn.onclick = () => signOut();

  // Check for logged-in user
  const user = await getUser();
  if (!user) return;

  // Show user section
  userSection.hidden = false;
  loginBtn.disabled = true;
  userSection.querySelector(".username").innerText = user.username;


  // Handle form submission
  fragmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = fragmentForm.type.value;
    let content = fragmentForm.content.value;

    // Parse JSON if needed
    if (type === "application/json") {
      try {
        content = JSON.stringify(JSON.parse(content));
      } catch {
        return alert("Invalid JSON format");
      }
    }

    try {
      const apiUrl = "http://localhost:8080";
      const fragmentsUrl = new URL("/v1/fragments", apiUrl);
      const res = await fetch(fragmentsUrl, {
        method: "POST",
        headers: {
          "Content-Type": type,
          Authorization: `Bearer ${user.idToken}`,
        },
        body: content,
       
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      alert(`✅ Fragment added! ID: ${data.fragment?.id}`);
      console.log("data fragment after submit:", data.fragment)
      fragmentForm.reset();
      fragmentForm.hidden = true;
      fragmentsSection.hidden = false;

      // Refresh fragment table
      await loadFragments();
    } catch (err) {
      console.error(err);
      alert("Error adding fragment.");
    }
  });

  // Load fragments and populate table
  

  // Initial load
  await loadFragments();
}

addEventListener("DOMContentLoaded", init);
