import { SUPPORTED_CONTENT_TYPES } from "../constants";


export function toggleForm(ui) {
  const { fragmentForm, fragmentsSection, typeSelect } = ui;

  fragmentForm.hidden = !fragmentForm.hidden;
  fragmentsSection.hidden = !fragmentForm.hidden;

  // Populate select
  typeSelect.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "--Please choose an option--";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  typeSelect.appendChild(placeholderOption);

  SUPPORTED_CONTENT_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });
}
// Function to dynamically update upload area
export function updateUploadArea(type, container) {

  container.innerHTML = "";

  if (SUPPORTED_CONTENT_TYPES.includes(type) && (type.startsWith("text/")|| type.startsWith("application"))) {

    container.innerHTML = `
      <label for="content">Enter Content:</label>
      <textarea id="content" name="content" rows="6" placeholder="Enter your fragment data..." required></textarea>
    `;
  } else  if (SUPPORTED_CONTENT_TYPES.includes(type) && type.startsWith("image/")) {
    container.innerHTML = `
      <label for="content">Upload Image:</label>
      <input type="file" id="content" name="content" accept="image/*" required />
    `;
  }
//   } else  if (SUPPORTED_CONTENT_TYPES.includes(type) && type.startsWith("file/")) {
//     container.innerHTML = `
//       <label for="content">Upload File:</label>
//       <input type="file" id="content" name="content" accept="*/*" required />
//     `;
//   }
}

// Event listeners