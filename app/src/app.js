// src/app.js
import { signIn, signOut, getUser } from "./auth.js";
import { initUI } from "./ui/initUI.js";
import { loadFragments } from "./ui/loadFragments.js";
import { setupSubmitHandler } from "./ui/submitHandler.js";
import { toggleForm } from "./ui/toggleform.js";

async function init() {
 const ui = initUI();
  console.log("Hello world")
  ui.loginBtn.onclick = () => signIn();
  ui.logoutBtn.onclick = () => signOut();

  const user = await getUser();
  if (!user) return;

  ui.userSection.hidden = false;
  ui.loginBtn.disabled = true;
  ui.userSection.querySelector(".username").innerText = user.username;

  ui.addFragmentBtn.onclick = () => toggleForm(ui);
  setupSubmitHandler(user, ui);
  console.log("Right before loadFragments")
  await loadFragments(user, ui);
}

addEventListener("DOMContentLoaded", init);
