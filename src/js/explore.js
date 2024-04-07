import { loadHeaderFooter, setClick } from "./utils.mjs";

(async () => {
  // Wait for the header and footer to be loaded
  await loadHeaderFooter(
    "#mainHeader",
    "#mainFooter",
    "../partials/header.html",
    "../partials/footer.html",
  );

  // Event listener setup
  const openFunc = function openSearchBox() {
    document.getElementById("searchOverlay").classList.add("overlay-open");
  };

  const closeFunc = function closeSearchBox() {
    document.getElementById("searchOverlay").classList.remove("overlay-open");
  };

  const searchFunc = function search() {
    document.getElementById("searchOverlay").classList.remove("overlay-open");
  };

  setClick("#closePopup", closeFunc);
  setClick("#openPopup", openFunc);
  setClick("#searchBtn", searchFunc);
})();