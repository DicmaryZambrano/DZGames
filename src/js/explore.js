import {
  loadHeaderFooter,
  loadFilters,
  alertMessage,
  getParam,
} from "./utils.mjs";
import GameList from "./GameList.mjs";

const gameCardFunction = function (game) {
  // Create a element
  const link_wrapper = document.createElement("a");
  // Create li element
  const li = document.createElement("li");
  li.classList.add("game-card");

  // Create div for tag if category is not null
  if (game.category !== undefined) {
    const gameTag = document.createElement("div");
    gameTag.classList.add("game-tag");
    gameTag.setAttribute("aria-hidden", "true");
    gameTag.textContent = game.category;
    li.appendChild(gameTag);
  }

  // Create image element if cover is not null
  const img = document.createElement("img");
  img.src = game.cover.url;
  img.alt = `${game.name} Cover`;
  img.loading = "lazy";
  img.height = game.cover.height;
  img.width = game.cover.width;
  img.classList.add("game-image");
  li.appendChild(img);

  // Create h3 for game title
  const title = document.createElement("h3");
  title.classList.add("game-title");
  title.innerText = game.name;
  li.appendChild(title);

  // Create ul element for game info
  const ul = document.createElement("ul");
  ul.classList.add("game-info");

  // Create li elements for platform if platforms array is not null
  if (game.platforms !== undefined) {
    let platforms = game.platforms;
    platforms.forEach((platform) => {
      const platformLi = document.createElement("li");
      platformLi.textContent = `${platform.abbreviation}`;
      ul.appendChild(platformLi);
    });
  }

  // Create li elements for genre if genres array is not null
  if (game.genres !== undefined) {
    let genres = game.genres;
    genres.forEach((genre) => {
      const genreLi = document.createElement("li");
      genreLi.textContent = `${genre.name}`;
      ul.appendChild(genreLi);
    });
  }

  li.appendChild(ul);
  link_wrapper.appendChild(li);
  link_wrapper.href = `/game_details/index.html?id=${game.id}`;

  return link_wrapper.outerHTML;
};

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

let platformQ = getParam("platf");
let categoryQ = getParam("genr");
let searchQ = getParam("search");

function constructBody(plat, cat, searchString) {
  const queryParams = [];

  // Add platform filter if provided
  if (plat) {
    const platformValue = Array.isArray(plat) ? plat.join(",") : plat;
    queryParams.push(`platforms = [${platformValue}]`);
  }

  // Add category filter if provided
  if (cat) {
    const categoryValue = Array.isArray(cat) ? cat.join(",") : cat;
    queryParams.push(`genres = [${categoryValue}]`);
  }

  // Construct the body
  let cbody =
    "fields name,category,cover.image_id,game_modes.name,genres.name,platforms.abbreviation;";
  let limit = "limit 200;";
  cbody += limit;

  // Add search keywords if provided
  if (searchString) {
    cbody += `search "${decodeURIComponent(searchString)}";`;
  }

  // Add the constructed where clause
  if (queryParams.length > 0) {
    const whereClause = queryParams.join(" & ");
    cbody += `where cover.url != null & artworks.image_id != null & ${whereClause};`;
  } else {
    cbody += `where cover.url != null & artworks.image_id != null;`;
  }

  return cbody;
}

let body = constructBody(platformQ, categoryQ, searchQ);

const gameList = new GameList("/games", body, ".game-list", gameCardFunction);

gameList.init();
