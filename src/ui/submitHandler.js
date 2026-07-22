import { loadFragments } from "./loadFragments.js";
import { postFragment } from "../api.js";

export function setupSubmitHandler(user, ui) {
  const { fragmentForm, fragmentsSection } = ui;

  fragmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = fragmentForm.type.value;
    let body;
    const headers = {
      "Content-Type": type,
      Authorization: `Bearer ${user.idToken}`,
    };

    try {
      if (type === "application/json") {
        body = JSON.stringify(JSON.parse(fragmentForm.content.value));
        headers["Content-Type"] = type;
      } else if (type.startsWith("text/")) {
        body = fragmentForm.content.value;
        headers["Content-Type"] = type;
      } else if (
        type.startsWith("image/") ||
        type === "application/octet-stream"
      ) {
        const fileInput = fragmentForm.querySelector('input[type="file"]');
        if (!fileInput || fileInput.files.length === 0) {
          return alert("Please select a file to upload.");
        }
        const file = fileInput.files[0];
        body = await file.arrayBuffer(); // <-- raw bytes
        headers["Content-Type"] = type; // e.g., image/png
      } else {
        return alert("Unsupported fragment type.");
      }

      const res = await postFragment(user, body, type);
      if (!res.status) {
        throw new Error(`Failed: ${res.statusText}`);
      }
      // const data = await res.json();
      alert(`Fragment added! ID: ${res.fragment.id}`);

      fragmentForm.hidden = true;
      fragmentsSection.hidden = false;

      await loadFragments(user, ui);
    } catch (err) {
      alert("Error adding fragment.");
    }
  });
}
