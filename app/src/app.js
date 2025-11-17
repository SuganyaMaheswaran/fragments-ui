// src/app.js
import { signIn, signOut, getUser } from "./auth";
import { getUserFragments } from "./api";
const SUPPORTED_CONTENT_TYPES = [
  `text/plain`,
  "text/plain; charset=utf-8",
  `text/markdown`,
  `text/html`,
  `application/json`,
  /*
   Currently, only text/plain is supported. Others will be added later.
  `application/yaml`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
  */
];

async function init() {
  // UI elementsw
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const addFragmentBtn = document.querySelector("#addFragment");
  const fragmentForm = document.querySelector("#fragmentForm");
  const fragmentsSection = document.querySelector("#fragmentsSection");
  const fragmentsTableBody = document.querySelector("#fragmentsTable tbody");
  const select = document.getElementById("type");
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

  // Toggle Add Fragment form and hide/show fragment table
  addFragmentBtn.onclick = () => {
    if (fragmentForm.hidden) {
      // Show form, hide table
      fragmentForm.hidden = false;
      fragmentsSection.hidden = true;
    } else {
      // Hide form, show table
      fragmentForm.hidden = true;
      fragmentsSection.hidden = false;
    }
    // Loop through the options
    select.innerHTML = "";
    SUPPORTED_CONTENT_TYPES.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type; // You can make this prettier if needed
      select.appendChild(option);
    });
  };

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
  async function loadFragments() {
    try {
      // Use expand=true to get full fragment metadata
      const data = await getUserFragments(user, true);
      const fragments = data?.fullMetadata || [];

      fragmentsTableBody.innerHTML = ""; // clear table

      if (fragments.length === 0) {
        fragmentsSection.hidden = true;
        return;
      }
      fragments.forEach((f) => {
        console.log(f)
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${f.id}</td>
        <td>${f.type}</td>
        <td>${f.size}</td>
        <td>${new Date(f.created).toLocaleString()}</td>
        <td>${new Date(f.updated).toLocaleString()}</td>
        <td><button class="viewBtn" disabled data-id="${
          f.id
        }">View</button></td>
      `;
        fragmentsTableBody.appendChild(tr);
      });

      fragmentsSection.hidden = false;
    } catch (err) {
      console.error("Failed to load fragments:", err);
      fragmentsSection.hidden = true;
    }
  }

  // Initial load
  await loadFragments();
}

addEventListener("DOMContentLoaded", init);
