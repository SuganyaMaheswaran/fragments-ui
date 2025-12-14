// src/app.js
import { signIn, signOut, getUser } from "./auth.js";
import { initUI } from "./ui/initUI.js";
import { loadFragments } from "./ui/loadFragments.js";
import { setupSubmitHandler } from "./ui/submitHandler.js";
import { toggleForm } from "./ui/toggleForm.js";
import { updateUploadArea } from "./ui/toggleForm.js";
async function init() {
 const ui = initUI();
  ui.loginBtn.onclick = () => signIn();
  ui.logoutBtn.onclick = () => signOut();
  const user = await getUser();
  if (!user) return;
  else ui.fragmentsSection.hidden = false
  ui.userSection.hidden = false;
  ui.loginBtn.disabled = true;
  ui.userSection.querySelector(".username").innerText = user.username;
  ui.addFragmentBtn.onclick = () => toggleForm(ui);
  ui.typeSelect.addEventListener("change", () => {
  updateUploadArea(ui.typeSelect.value, ui.container);
});

  setupSubmitHandler(user, ui);
  await loadFragments(user, ui);
}

addEventListener("DOMContentLoaded", init);
