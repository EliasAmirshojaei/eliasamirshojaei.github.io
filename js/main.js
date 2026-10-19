console.log("Portfolio loaded");

const root = document.documentElement;
const btn = document.getElementById("theme-toggle");

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  btn.textContent = theme === "dark" ? "Light" : "Dark";
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved || "dark");

btn.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});