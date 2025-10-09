// src/app.js
import { signIn, signOut, getUser } from './auth';
import { getUserFragments } from './api';

async function init() {
  // UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const addFragmentBtn = document.querySelector('#addFragment');
  const fragmentForm = document.querySelector('#fragmentForm');
  const fragmentsSection = document.querySelector('#fragmentsSection');
  const fragmentsTableBody = document.querySelector('#fragmentsTable tbody');

  // Login / logout handlers
  loginBtn.onclick = () => signIn();
  logoutBtn.onclick = () => signOut();

  // Check for logged-in user
  const user = await getUser();
  if (!user) return;

  // Show user section
  userSection.hidden = false;
  loginBtn.disabled = true;
  userSection.querySelector('.username').innerText = user.username;

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
};

  // Handle form submission
  fragmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const type = fragmentForm.type.value;
    let content = fragmentForm.content.value;

    // Parse JSON if needed
    if (type === 'application/json') {
      try { content = JSON.stringify(JSON.parse(content)); }
      catch { return alert('Invalid JSON format'); }
    }

    try {
      const apiUrl = 'http://localhost:8080';
      const fragmentsUrl = new URL('/v1/fragments', apiUrl);
      const res = await fetch(fragmentsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': type,
          Authorization: `Bearer ${user.idToken}`,
        },
        body: content,
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      alert(`✅ Fragment added! ID: ${data.fragment?.id}`);
      fragmentForm.reset();
      fragmentForm.hidden = true;
      fragmentsSection.hidden = false;

      // Refresh fragment table
      await loadFragments();
    } catch (err) {
      console.error(err);
      alert('Error adding fragment.');
    }
  });

  // Load fragments and populate table
  async function loadFragments() {
    try {
      // Use expand=true to get full fragment metadata
      const data = await getUserFragments(user, true);
      const fragments = data?.fragments || [];

      fragmentsTableBody.innerHTML = ''; // clear table

      fragments.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${f.id}</td>
          <td>${f.type}</td>
          <td>${f.size}</td>
          <td>${new Date(f.created).toLocaleString()}</td>
          <td>${new Date(f.updated).toLocaleString()}</td>
          <td><button class="viewBtn" disabled=true data-id="${f.id}">View</button></td>
        `;
        fragmentsTableBody.appendChild(tr);
      });

      fragmentsSection.hidden = fragments.length === 0;

      
      
    } catch (err) {
      console.error(err);
    }
  }

  // Initial load
  await loadFragments();
}

addEventListener('DOMContentLoaded', init);
