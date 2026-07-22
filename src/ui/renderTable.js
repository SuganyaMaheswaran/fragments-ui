import { getFragmentById, deleteFragment, updateFragment} from "../api.js";
import { MIME_TO_EXTENSION, SUPPORTED_CONTENT_TYPES, SUPPORTED_CONVERSION} from "../constants.js";  
import '@fortawesome/fontawesome-free/css/all.min.css';
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
      <td class="viewContainer"><button class="viewBtn"><i class="fas fa-eye"></i> </button></td>
      <td class="downloadContainer"><button class="downloadBtn"><i class="fas fa-download"></i>  &nbsp;  </button></td>
      <td class="convertContainer"><button class="convertBtn"><i class="fas fa-exchange-alt"></i> &nbsp; </button></td>
      <td> <button class="updateBtn"><i class="fas fa-edit"></i> &nbsp; </button><div class="updateContainer-${
        f.id
      }"></div></td>
      <td class="deleteContainer"><button class="deleteBtn"><i class="fas fa-trash-alt"></i> &nbsp; </button></td>
    `;
    tbody.appendChild(tr);

    // --- VIEW button ---
    tr.querySelector(".viewBtn").addEventListener("click", async () => {
      await showCustomAlert(f, user);
    });
    // --- DOWNLOAD button ---
    tr.querySelector(".downloadBtn").addEventListener("click", async () => {
      const type = f.type || "application/octet-stream";
      const extension = getExtensionFromType(type);

      try {
        const fragmentData = await getFragmentById(user, f.id);
        if (!fragmentData) throw new Error("No fragment data returned");

        let blob;
        let downloadUrl;

        // IMAGE → already a blob URL
        if (type.startsWith("image/") && typeof fragmentData === "string") {
          downloadUrl = fragmentData;
        }
        // JSON
        else if (type === "application/json") {
          blob = new Blob([JSON.stringify(fragmentData, null, 2)], { type });
          downloadUrl = URL.createObjectURL(blob);
        }
        // TEXT / MARKDOWN / HTML / YAML
        else if (type.startsWith("text/") || type.includes("yaml")) {
          blob = new Blob([fragmentData], { type });
          downloadUrl = URL.createObjectURL(blob);
        }
        // OCTET STREAM / BINARY
        else {
          blob = new Blob([fragmentData], { type: "application/octet-stream" });
          downloadUrl = URL.createObjectURL(blob);
        }

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `fragment-${f.id}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (!type.startsWith("image/")) {
          URL.revokeObjectURL(downloadUrl);
        }
      } catch (err) {
        alert("Failed to download fragment.");
      }
    });

    // --- Convert button ---
    tr.querySelector(".convertBtn").addEventListener("click", () => {
      const originalType = f.type;
      const convertibleTypes = (
        SUPPORTED_CONVERSION[originalType] || []
      ).filter((t) => t !== originalType);

      if (convertibleTypes.length === 0)
        return alert("No conversion available.");

      // --- Create overlay ---
      const overlay = document.createElement("div");
      overlay.className = "overlayContainer";

      const popup = document.createElement("div");
      popup.className = "overlayAlert"; // ✅ assign class to popup

      // --- Dropdown ---
      const select = document.createElement("select");
      select.innerHTML = `<option value="">Select format</option>`;
      convertibleTypes.forEach((t) => {
        select.innerHTML += `<option value="${t}">${t}</option>`;
      });

      // --- Buttons container ---
      const btnContainer = document.createElement("div");
      btnContainer.style.display = "flex";
      btnContainer.style.justifyContent = "flex-end";
      btnContainer.style.gap = "8px";

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "X";
      const convertBtn = document.createElement("button");
      convertBtn.textContent = "Convert & Download";

      btnContainer.append(closeBtn);

      // --- Assemble popup ---
      popup.append(btnContainer, select, convertBtn );
      overlay.appendChild(popup);

      document.body.appendChild(overlay);

      // --- Close handler ---
      closeBtn.addEventListener("click", () => overlay.remove());

      // --- Convert & download handler ---
      convertBtn.addEventListener("click", async () => {
        const targetType = select.value;
        if (!targetType) return alert("Please select a format!");

        try {
          const fragmentData = await getFragmentById(
            user,
            f.id,
            getExtensionFromType(targetType)
          );
          if (!fragmentData) throw new Error("No fragment data returned");

          let blob;
          let downloadUrl;

          // IMAGE → already a blob URL
          if (
            targetType.startsWith("image/") &&
            typeof fragmentData === "string"
          ) {
            downloadUrl = fragmentData;
          }
          // JSON
          else if (targetType === "application/json") {
            blob = new Blob([JSON.stringify(fragmentData, null, 2)], {
              type: targetType,
            });
            downloadUrl = URL.createObjectURL(blob);
          }
          // TEXT / MARKDOWN / HTML / YAML
          else if (
            targetType.startsWith("text/") ||
            targetType.includes("yaml")
          ) {
            blob = new Blob([fragmentData], { type: targetType });
            downloadUrl = URL.createObjectURL(blob);
          }
          // BINARY fallback
          else {
            blob = new Blob([fragmentData], {
              type: "application/octet-stream",
            });
            downloadUrl = URL.createObjectURL(blob);
          }

          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `fragment-${f.id}.${getExtensionFromType(targetType)}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          if (!targetType.startsWith("image/"))
            URL.revokeObjectURL(downloadUrl);
        } catch (err) {
          alert("Failed to convert fragment.");
        }

        overlay.remove();
      });
    });
    // --- UPDATE button ---
    tr.querySelector(".updateBtn").addEventListener("click", () => {
      const modal = document.getElementById("updateModal");
      const modalBody = document.getElementById("updateModalBody");
      const closeBtn = document.getElementById("updateModalClose");

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

      modalBody.innerHTML = `
    <div class="update-box">
      ${inputUI}
      <div style="margin-top: 8px; display:flex; gap: 8px;">
        <button class="submitUpdateBtn">Submit</button>
        <button class="cancelUpdateBtn">Cancel</button>
      </div>
    </div>
  `;

      modal.style.display = "flex"; // show modal

      // Close modal handlers
      closeBtn.onclick = () => (modal.style.display = "none");
      modalBody.querySelector(".cancelUpdateBtn").onclick = () =>
        (modal.style.display = "none");

      // Submit
      modalBody
        .querySelector(".submitUpdateBtn")
        .addEventListener("click", async () => {
          const input = modalBody.querySelector(`#content-${f.id}`);
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
            await updateFragment(user, f.id, body, f.type);
            alert("Update successful!");
            modal.style.display = "none";
          } catch (err) {
            alert("Error updating fragment: " + err.message);
          }
        });
    });

    // --- DELETE button ---
    tr.querySelector(".deleteBtn").addEventListener(
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
