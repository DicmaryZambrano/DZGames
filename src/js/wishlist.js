import { loadHeaderFooter, loadFilters, alertMessage } from "./utils.mjs";

(async () => {
  // Wait for the header and footer to be loaded
  await loadHeaderFooter(
    "#mainHeader",
    "#mainFooter",
    "../partials/header.html",
    "../partials/footer.html",
  );
  await loadFilters("#exploreFilter", "../partials/filter.html");

  //Event listener setup
  const openFunc = function openSearchBox() {
    document.getElementById("searchOverlay").classList.add("overlay-open");
  };

  const closeFunc = function closeSearchBox() {
    document.getElementById("searchOverlay").classList.remove("overlay-open");
  };

  document.querySelector("#closePopup").addEventListener("click", closeFunc);
  document.querySelector("#openPopup").addEventListener("click", openFunc);

  const searchForm = document.getElementById("searchForm");

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const searchInput = document.getElementById("searchInput");
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
      window.location.href = `/explore/index.html?search=${encodeURIComponent(searchTerm)}`;
    } else {
      alertMessage("Please enter something to search");
    }
  });
  document
    .getElementById("filterForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      let queryString = "?";
      formData.forEach((value, key) => {
        if (queryString.length > 1) queryString += "&";
        queryString +=
          encodeURIComponent(key) + "=" + encodeURIComponent(value);
      });

      window.location.href = "/explore/index.html" + queryString;
    });
})();
