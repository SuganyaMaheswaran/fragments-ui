import { SUPPORTED_CONVERSION } from "../../../../fragments/src/config/constants.js";
import { getFragmentById, deleteFragment, postFragment } from "../api.js";
import { MIME_TO_EXTENSION, SUPPORTED_CONTENT_TYPES } from "../constants.js";
const { marked } = require("marked");
const apiUrl = process.env.API_URL || "http://localhost:8080";
export function renderTable(user, fragments, tbody, section) {
  tbody.innerHTML = "";

  if (!fragments.fragments.length) {
    section.hidden = true;
    return;
  }

  fragments.fragments.forEach((f) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.id}</td>
      <td>${f.type}</td>
      <td>${f.size}</td>
      <td>${new Date(f.created).toLocaleString()}</td>
      <td>${new Date(f.updated).toLocaleString()}</td>
      <td class="viewContainer"><button class="viewBtn">View</button></td>
      <td class="downloadContainer"><button class="downloadBtn">Download</button></td>
      <td class="convertContainer">  
          <button class="convertBtn">Convert</button></td>
      <td><button class="updateBtn">Update</button><div class="updateContainer-${
        f.id
      }"></div></td>
      <td class="deleteContainer"><button class="deleteFragmentBtn">X</button></td>
    `;
    tbody.appendChild(tr);

    // --- VIEW button ---
    tr.querySelector(".viewBtn").addEventListener("click", async () => {
      await showCustomAlert(f, user);
    });
    // --- DOWNLOAD button ---
    tr.querySelector(".downloadBtn").addEventListener("click", async () => {
      const type = f.type || "application/octet-stream";
      let downloadUrl;
      const extension = getExtensionFromType(type);

      try {
        const fragmentData = await getFragmentById(user, f.id);

        if (!fragmentData) throw new Error("No fragment data returned");

        // Decide how to handle data
        if (type.startsWith("image/") || type === "application/octet-stream") {
          // Convert raw bytes or Blob into a blob URL
          if (typeof fragmentData === "string") {
            // Already a blob URL from getFragmentById
            downloadUrl = fragmentData;
          } else {
            const blob = new Blob([fragmentData], { type });
            downloadUrl = URL.createObjectURL(blob);
          }
        } else if (type === "application/json") {
          const blob = new Blob(
            [JSON.stringify(fragmentData?.fragment ?? fragmentData, null, 2)],
            { type: "application/json" }
          );
          downloadUrl = URL.createObjectURL(blob);
        } else {
          const blob = new Blob([String(fragmentData)], { type });
          downloadUrl = URL.createObjectURL(blob);
        }

        // Trigger download
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `fragment-${f.id || "file"}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke blob URLs we created to avoid memory leaks
        if (!fragmentData.startsWith("http")) {
          URL.revokeObjectURL(downloadUrl);
        }
      } catch (err) {
        console.error("Download failed:", err);
        alert("Failed to download fragment.");
      }
    });
    
    // --- Convert button ---
    tr.querySelector('.convertBtn').addEventListener("click", ()=>{
        const fType = f.type; // the fragment's original type
  const convertableTypes = SUPPORTED_CONVERSION[fType] || [];
      console.log(convertableTypes)
  // Create popup container
  const popup = document.createElement("div");
  popup.style.cssText = `
   position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  `;

  // Create dropdown
  const select = document.createElement("select");
  select.innerHTML = `<option value="">Select format</option>`;
  convertableTypes.forEach(type => {
    select.innerHTML += `<option value="${type}">${type}</option>`;
  });

  // Create download button
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Convert & Download";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "X";
  closeBtn.style.marginLeft = "5px";

  popup.appendChild(select);
  popup.appendChild(downloadBtn);
  popup.appendChild(closeBtn);

  // Add popup to body
  document.body.appendChild(popup);

  // Position near the Convert button
  const rect = tr.querySelector('.convertBtn').getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  // Close handler
  closeBtn.addEventListener("click", () => {
    popup.remove();
  });

  // Convert & download handler
  downloadBtn.addEventListener("click", async () => {
    const targetType = select.value;
    if (!targetType) return alert("Please select a format!");

    const convertedData = await getFragmentById(f.id, targetType, getExtensionFromType(type) ); // API call
    console.log(convertedData)
    const a = document.createElement("a");
    a.href =convertedData
    a.download = `${f.id}.${MIME_TO_EXTENSION[targetType] || "bin"}`;
    a.click();
    URL.revokeObjectURL(a.href);

    popup.remove();
  });
    })
    // --- UPDATE button ---
    tr.querySelector(".updateBtn").addEventListener("click", () => {
      const container = tr.querySelector(`.updateContainer-${f.id}`);
      if (!container) return;

      let inputUI = "";
      if (f.type.startsWith("text/") || f.type.startsWith("application")) {
        inputUI = `
          <label for="content-${f.id}">Enter Content:</label>
          <textarea id="content-${
            f.id
          }" rows="6" placeholder="Enter your fragment data...">${
          f.data || f.content || ""
        }</textarea>
        `;
      } else if (f.type.startsWith("image/")) {
        inputUI = `
          <label for="content-${f.id}">Upload Image:</label>
          <input type="file" id="content-${f.id}" accept="image/*" />
        `;
      }

      container.innerHTML = `
        <div class="update-box">
          ${inputUI}
          <div style="margin-top: 8px; display:flex; gap: 8px;">
            <button class="submitUpdateBtn">Submit</button>
            <button class="cancelUpdateBtn">X</button>
          </div>
        </div>
      `;

      // Cancel
      container
        .querySelector(".cancelUpdateBtn")
        .addEventListener("click", () => {
          container.innerHTML = "";
        });

      // Submit
      container
        .querySelector(".submitUpdateBtn")
        .addEventListener("click", async () => {
          const input = container.querySelector(`#content-${f.id}`);
          let body;
          let headers = { Authorization: `Bearer ${user.idToken}` };

          if (f.type.startsWith("image/")) {
            body = new FormData();
            body.append("content", input.files[0]);
          } else {
            headers["Content-Type"] = f.type;
            body = input.value;
          }

          try {
            const res = await postFragment(user, body, type);
            if (!res.ok) throw new Error("Update failed");

            alert("Update successful!");
            container.innerHTML = "";
          } catch (err) {
            console.error(err);
            alert("Error updating fragment");
          }
        });
    });

    // --- DELETE button ---
    tr.querySelector(".deleteFragmentBtn").addEventListener(
      "click",
      async () => {
        if (!confirm("Are you sure you want to delete this fragment?")) return;
        try {
          await deleteFragment(user, f.id);
          tr.remove();
        } catch {
          alert("Failed to delete fragment. See console for details.");
        }
      }
    );
  });

  section.hidden = false;
}

// JS function to show content
async function showCustomAlert(fragmentMetaData, user) {
  const alertDiv = document.getElementById("customAlert");
  const contentDiv = document.getElementById("customAlertContent");
  const closeBtn = document.getElementById("customAlertClose");

  // Clear previous content
  contentDiv.innerHTML = "";

  // Fetch fragment from backend/S3
  const fragment = await getFragmentById(user, fragmentMetaData.id);

  const type = fragmentMetaData.type;

  if (type.startsWith("image/")) {
    // Image: use Blob URL

    const img = document.createElement("img");
    img.src = fragment;
    img.style.width = "100%";
    img.style.maxHeight = "60vh";
    img.style.borderRadius = "20px";
    img.style.border = "3px solid #103664";
    contentDiv.appendChild(img);
    closeBtn.onclick = () => {
      alertDiv.style.display = "none";
      img.remove(); // remove the image
      URL.revokeObjectURL(fragment); // free memory
    };
  } else if (type === "application/json") {
    // JSON: show formatted
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(fragment, null, 2);
    contentDiv.appendChild(pre);
  } else if (type === "text/html") {
    // HTML: render as HTML
    contentDiv.innerHTML = fragment;
  } else if (type === "text/markdown" || type === "text/x-markdown") {
    // Markdown: render as HTML using a library like marked.js
    // Make sure you include <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script> in HTML
    const html = marked(fragment); // or just marked(fragment)
    contentDiv.innerHTML = html;
  } else if (type === "text/yaml" || type === "application/x-yaml") {
    // YAML: display as preformatted
    const pre = document.createElement("pre");
    pre.textContent = fragment;
    contentDiv.appendChild(pre);
  } else if (type.startsWith("text/")) {
    // Plain text
    const p = document.createElement("p");
    p.textContent = fragment;
    contentDiv.appendChild(p);
  } else {
    // Fallback: try to open as Blob URL

    window.open(fragment, "_blank");
  }

  // Show modal
  alertDiv.style.display = "flex";
}
function getExtensionFromType(type) {
  return MIME_TO_EXTENSION[type] || "bin";
}
