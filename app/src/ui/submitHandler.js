import { loadFragments } from "./loadFragments.js";

export function setupSubmitHandler(user, ui) {
  const { fragmentForm, fragmentsSection } = ui;

  fragmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = fragmentForm.type.value;
    let content = fragmentForm.content.value;

    if (type === "application/json") {
      try {
        content = JSON.stringify(JSON.parse(content));
      } catch {
        return alert("Invalid JSON format");
      }
    }

    try {
      const res = await fetch(`${process.env.API_URL}/v1/fragments`, {
        method: "POST",
        headers: {
          "Content-Type": type,
          Authorization: `Bearer ${user.idToken}`,
        },
        body: content,
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);

      const data = await res.json();
      alert(`Fragment added! ID: ${data.fragment.id}`);

      fragmentForm.reset();
      fragmentForm.hidden = true;
      fragmentsSection.hidden = false;

      await loadFragments(user, ui);

    } catch (err) {
      console.error(err);
      alert("Error adding fragment.");
    }
  });
}