// ---------- Language (i18n) ----------
const LANGS = ["en", "fa", "it"];
let dict = {};
const t = (key, fallback) => (dict[key] !== undefined ? dict[key] : fallback);

async function setLang(lang) {
  if (!LANGS.includes(lang)) lang = "en";
  try {
    const res = await fetch("lang/" + lang + ".json");
    dict = await res.json();
  } catch (e) {
    console.error("Could not load the language file", e);
    return;
  }
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = dict[el.dataset.i18n];
    if (value !== undefined) el.textContent = value;
  });
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === lang)
  );
  try { localStorage.setItem("lang", lang); } catch (e) {}
  updateThemeButton();
}

document.querySelectorAll("[data-lang]").forEach((b) =>
  b.addEventListener("click", () => setLang(b.dataset.lang))
);

// ---------- Theme (dark / light) ----------
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");

function updateThemeButton() {
  const theme = root.getAttribute("data-theme");
  themeBtn.textContent = theme === "dark" ? t("theme.toLight", "Light") : t("theme.toDark", "Dark");
}

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  try { localStorage.setItem("theme", theme); } catch (e) {}
  updateThemeButton();
}

themeBtn.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// ---------- Highlight the current section in the bottom navigation ----------
const navLinks = document.querySelectorAll(".bottom-nav a");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id)
        );
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);
navLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute("href"));
  if (section) observer.observe(section);
});

// ---------- Start ----------
let savedTheme = null;
let savedLang = null;
try {
  savedTheme = localStorage.getItem("theme");
  savedLang = localStorage.getItem("lang");
} catch (e) {}
setTheme(savedTheme || "dark");
setLang(savedLang || "en");
