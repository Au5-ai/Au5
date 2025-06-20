document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("au5-theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute("data-gpts-theme");
      html.setAttribute("data-gpts-theme", currentTheme === "light" ? "dark" : "light");
    });
  }
});
