import GameList from "./GameList.mjs";
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

const gameCardFunction = function (game) {
  // Create li element
  const li = document.createElement("li");
  li.classList.add("game-card");

  // Create div for tag if category is not null
  if (game.category !== null) {
    const gameTag = document.createElement("div");
    gameTag.classList.add("game-tag");
    gameTag.setAttribute("aria-hidden", "true");
    gameTag.style.display = "none";
    gameTag.textContent = game.category;
    li.appendChild(gameTag);
  }

  // Create image element if cover is not null
  if (game.cover !== null) {
    const img = document.createElement("img");
    img.src = game.cover;
    img.alt = `${game.name} Cover`;
    img.height = 374;
    img.width = 264;
    img.classList.add("game-image");
    li.appendChild(img);
  } else {
    const img = document.createElement("img");
    img.src = "/nothing";
    img.alt = "not found";
    img.height = 374;
    img.width = 264;
    img.classList.add("game-image");
    li.appendChild(img);
  }

  // Create h3 for game title
  const title = document.createElement("h3");
  title.classList.add("game-title");
  title.innerText = game.name;
  li.appendChild(title);

  // Create ul element for game info
  const ul = document.createElement("ul");
  ul.classList.add("game-info");

  // Create li elements for platform if platforms array is not null
  if (game.platforms !== null) {
    let platforms = game.platforms;
    platforms.forEach((platform) => {
      const platformLi = document.createElement("li");
      platformLi.textContent = `${platform.name}`;
      ul.appendChild(platformLi);
    });
  }

  // Create li elements for genre if genres array is not null
  if (game.genres !== null) {
    let genres = game.genres;
    genres.forEach((genre) => {
      const genreLi = document.createElement("li");
      genreLi.textContent = `${genre.name}`;
      ul.appendChild(genreLi);
    });
  }

  // Append ul to li
  li.appendChild(ul);

  // Create p element for game description if summary is not null
  if (game.summary !== null) {
    const desc = document.createElement("p");
    desc.classList.add("game-desc");
    desc.textContent = game.summary;
    li.appendChild(desc);
  }

  return li.outerHTML;
};

var body = `
fields name,category,cover,game_modes,genres,platforms,summary;
limit 20;
where rating >= 80;
`;

const gameList = new GameList("/games", body, ".game-list", gameCardFunction);

gameList.init();
