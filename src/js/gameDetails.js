import { loadHeaderFooter, getParam, alertMessage } from "./utils.mjs";
import GameDetails from "./GameDetails.mjs";

(async () => {
  // Wait for the header and footer to be loaded
  await loadHeaderFooter(
    "#mainHeader",
    "#mainFooter",
    "../partials/header.html",
    "../partials/footer.html",
  );

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
})();

let gameId = getParam("id");
var body = `
fields name,category,cover.image_id,game_modes.name,genres.name,platforms.abbreviation,aggregated_rating,screenshots.image_id,screenshots.height,screenshots.width,similar_games,themes.name,videos.video_id,videos.name,websites.url,websites.category,language_supports.language.name,language_supports.language.locale,language_supports.language_support_type.name,artworks.image_id,artworks.height,artworks.width,involved_companies.company.name,involved_companies.company.websites.url,first_release_date,dlcs;
where id = ${gameId};
`;

const gameDetails = new GameDetails("/games", body, "#game");

gameDetails.init();
