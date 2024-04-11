import APIServer from "./APIServer.mjs"
import { renderWithTemplate, getGameCategory, getWebsiteCategory, getLocalStorage, setLocalStorage, convertUnixToJson, alertMessage, removeAllAlerts } from "./utils.mjs";
import GameList from "./GameList.mjs";

export default class GameDetails {
  constructor(endpoint, payload, parentElement) {
    this.endpoint = endpoint;
    this.payload = payload;
    this.parentElement = parentElement;
    this.gameData = {};
  }
  
  filterFunc() {
    var selectedFilters = {};
  
    // Loop through each checked checkbox
    filterCheckboxes.forEach(function(checkbox) {
      if (checkbox.checked) {
        // Add the checked value to the corresponding filter array
        selectedFilters[checkbox.name] = selectedFilters[checkbox.name] || [];
        selectedFilters[checkbox.name].push(checkbox.value);
      }
    });
  
    // Select all elements to be filtered
    var filteredResults = document.querySelectorAll(".media");
  
    // Loop through each selected filter
    Object.keys(selectedFilters).forEach(function(name) {
      filteredResults = Array.from(filteredResults).filter(function(element) {
        var currentFilterValues = element.dataset.category.split(" ");
        return selectedFilters[name].some(function(value) {
          return currentFilterValues.includes(value);
        });
      });
    });
  
    // Hide all elements and show only the filtered ones
    document.querySelectorAll(".media").forEach(function(element) {
      element.style.display = "none";
    });
  
    filteredResults.forEach(function(element) {
      element.style.display = "block";
    });
  }
    

  addToWishlist() {
    removeAllAlerts();
    wishIconAnimation();
    
    let wishlist = getLocalStorage("dz-wish") || [];

    const existingItemIndex = wishlist.findIndex((item) => item.id === this.gameData.id);

    if (existingItemIndex !== -1) {
        wishlist.splice(existingItemIndex, 1);
        alertMessage("removed from wishlist");
    } else {
        wishlist.push(this.gameData);
        alertMessage("added to wishlist");
    }
    setLocalStorage("dz-wish", wishlist);
  }

  renderGame() {
    const gameDetails = document.createElement("section");
    gameDetails.setAttribute = ("id","gameContent");

    const parallaxBox = document.createElement("div");
    parallaxBox.classList.add("parallax-container");
    const parallaxBack = document.createElement("div");
    parallaxBack.classList.add("parallax-background");


    parallaxBox.appendChild(parallaxBack);
    gameDetails.appendChild(parallaxBox)

    const gameCover = document.createElement("div");
    gameCover.classList.add("game-cover");
    const gameImage = document.createElement("img");
    gameImage.setAttribute("src", `${this.gameData.cover.url}`);
    gameImage.setAttribute("alt", `${this.gameData.name}`);
    gameCover.appendChild(gameImage);

    gameDetails.appendChild(gameCover);

    const gameTitle = createTitle(this.gameData);
    gameDetails.appendChild(gameTitle);
  
    const gameGauge = createGameGauge(this.gameData);
    const gameButton = createGameActionButton(this.gameData);
    gameGauge.appendChild(gameButton);
    gameDetails.appendChild(gameGauge);

    const gameSummary = createGameDetails(this.gameData);
    gameDetails.appendChild(gameSummary);

    const gameGallery = generateImageGallery(this.gameData);
    gameDetails.appendChild(gameGallery);

    parallaxBack.style.backgroundImage=`https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${this.gameData.artworks[0].image_id}.webp`

    renderWithTemplate(gameDetails.outerHTML, this.parentElement);

    this.initFilter();
    this.initWishlist();
    this.renderRatingBar();
  }

  initFilter(){
    var filterCheckboxes = document.querySelectorAll(".filter-check");

    filterCheckboxes.forEach(function(checkbox) {
        checkbox.addEventListener("change", filterFunc);
    });
  }

  initWishlist(){
    const wishButton = document.querySelector("#addToWishlist");

    wishButton.addEventListener("click", this.addToWishlist);
  }

  renderRatingBar(){
    const canvas = document.getElementById("progressCanvas");
    const ctx = canvas.getContext("2d");
    const startAngle = -Math.PI / 2; 
    const endValue = Math.round(this.gameData.aggregated_rating); 
    let progressValue = 0; // Starting progress value

    const drawCircle = (color, lineWidth, percentage) => {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, startAngle, startAngle + (Math.PI * 2) * (percentage / 100), false);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    };

    const updateProgress = () => {
        const speed = 0.1; // How fast the progress updates
        progressValue += speed;

        // Calculate ease out effect
        // This is a simple implementation; more sophisticated easing functions can be used
        let progress = progressValue / endValue;
        progress = 1 - Math.pow(1 - progress, 4); // Easing effect

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for redraw
        drawCircle("#ededed", 10, 100); // Background circle
        drawCircle("#7d2ae8", 10, progress * 100); // Foreground circle

        if (progressValue < endValue) {
            requestAnimationFrame(updateProgress);
        } else {
            console.log("Animation complete");
        }
    };

    updateProgress();
  }

  async init() {
    let dataSource = new APIServer;
    this.gameData = await dataSource.fetchData(this.endpoint, this.payload);
    this.gameData = this.gameData[0];
    this.gameData.cover.url = `https://images.igdb.com/igdb/image/upload/t_cover_big/${this.gameData.cover.image_id}.webp`;
    this.gameData.category = getGameCategory(game.category)
    this.renderGame();
}
}
function createGameGauge(){
    const gameGauge = document.createElement("div");
    gameGauge.classList.add("game-gauge");
  
    // Create circular progress canvas
    const circularProgressCanvas = document.createElement("canvas");
    circularProgressCanvas.id = "progressCanvas";
    circularProgressCanvas.width = "300";
    circularProgressCanvas.height = "300";
    const ratingText = document.createElement("span");
    ratingText.classList.add("rating-text");
    ratingText.textContent = "Ratings";
  
    // Append circular progress canvas and rating text to game gauge
    gameGauge.appendChild(circularProgressCanvas);
    gameGauge.appendChild(ratingText);
    return gameGauge;
};

function createTitle(gameData){
    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("game-title-wrapper");

    const gameTitle = document.createElement("div");
    gameTitle.classList.add("game-title");

    const bannerTitle = document.createElement("h1");
    bannerTitle.classList.add("banner-title");
    bannerTitle.textContent = gameData.name;

    if (gameData.first_release_date !== undefined) {
      const bannerSubheading = document.createElement("h2");
      bannerSubheading.classList.add("banner-subheading");

      const releaseDate = document.createElement("span");
      releaseDate.classList.add("release-date");
      const dateJson = convertUnixToJson(gameData.first_release_date)
      releaseDate.textContent = dateJson.formattedDate;
  
      const yearsAgo = document.createElement("span");
      yearsAgo.classList.add("years-ago");
      yearsAgo.textContent = `${dateJson.yearsAgo} years ago`

      
      bannerSubheading.appendChild(releaseDate);
      bannerSubheading.appendChild(yearsAgo)
      gameTitle.appendChild(bannerSubheading);
    }

    gameTitle.appendChild(bannerTitle);

    titleWrapper.appendChild(gameTitle);

    return titleWrapper;
};

function generateImageGallery(gameData) {
  // Create section element
  const section = document.createElement("section");
  section.classList.add("game-media");

  // Create button for filter toggle
  const filterButton = document.createElement("button");
  filterButton.setAttribute("type", "button");
  filterButton.setAttribute("id", "openFilter");
  filterButton.textContent = "+";
  section.appendChild(filterButton);

  // Create div for gallery filter
  const galleryFilterDiv = document.createElement("div");
  galleryFilterDiv.classList.add("gallery-filter");

  // Create form for filter checkboxes
  const filterForm = document.createElement("form");
  filterForm.setAttribute("name", "filterForm");

  // Add checkboxes for each category
  const categories = ["video", "artwork"];
  categories.forEach(category => {
      const label = document.createElement("label");
      label.setAttribute("for", category);
      label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("name", category);
      checkbox.setAttribute("id", category);
      checkbox.setAttribute("value", category);
      checkbox.checked = true;
      filterForm.appendChild(label);
      filterForm.appendChild(checkbox);
  });

  // Append form and close filter button to gallery filter div
  galleryFilterDiv.appendChild(filterForm);

  const closeFilterButton = document.createElement("button");
  closeFilterButton.setAttribute("type", "button");
  closeFilterButton.setAttribute("id", "closeFilter");
  closeFilterButton.textContent = "-";
  galleryFilterDiv.appendChild(closeFilterButton);

  // Append gallery filter div to section
  section.appendChild(galleryFilterDiv);

  // Create div for game gallery
  const gameGalleryDiv = document.createElement("div");
  gameGalleryDiv.classList.add("game-gallery");

  // Create div for wrapper
  const wrapperDiv = document.createElement("div");
  wrapperDiv.classList.add("wrapper");

  // Create buttons for left and right carousel navigation
  const leftButton = document.createElement("button");
  leftButton.setAttribute("id", "left");
  leftButton.setAttribute("type", "button");
  leftButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"></path>
                          </svg>`;
  const rightButton = document.createElement("button");
  rightButton.setAttribute("id", "right");
  rightButton.setAttribute("type", "button");
  rightButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16">
                             <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"></path>
                           </svg>`;

  // Create ul for carousel
  const carouselUl = document.createElement("ul");
  carouselUl.classList.add("carousel");

  if (gameData.artworks !== undefined){  gameData.artworks.forEach(artwork => {
      const li = document.createElement("li");
      li.classList.add("media-card");
      li.classList.add("media");
      li.setAttribute("data-category", "artwork");

      const divMediaContent = document.createElement("div");
      divMediaContent.classList.add("media-content");

      const img = document.createElement("img");
      img.setAttribute("src", `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${artwork.image_id}.webp`);
      img.setAttribute("alt", `${gameData.name} Artwork`);
      divMediaContent.appendChild(img);

      li.appendChild(divMediaContent);

      const h2 = document.createElement("h2");
      h2.textContent = game.name;
      li.appendChild(h2);

      const span = document.createElement("span");
      span.textContent = `${gameData.name} Artwork`;
      li.appendChild(span);

      carouselUl.appendChild(li);
  });}

  if (gameData.videos !== undefined){
    gameData.videos.forEach(video => {
      const li = document.createElement("li");
      li.classList.add("media-card");
      li.classList.add("media");
      li.setAttribute("data-category", "video");

      const divMediaContent = document.createElement("div");
      divMediaContent.classList.add("media-content");

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${video.video_id}?autoplay=1&mute=1&controls=0`;
      iframe.allow = "autoplay; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.height = 500
      iframe.width = 800
      iframe.setAttribute("title", `${gameData.name}`);
      
      // Set the iframe attributes for autoplay, mute, and no tooltips
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("muted", "1");
      iframe.setAttribute("controls", "0");
      iframe.setAttribute("showinfo", "0");
      iframe.setAttribute("iv_load_policy", "3");
      iframe.setAttribute("modestbranding", "1");
      divMediaContent.appendChild(iframe);

      li.appendChild(divMediaContent);

      const h2 = document.createElement("h2");
      h2.textContent = `${video.name}` ;
      li.appendChild(h2);

      carouselUl.appendChild(li);
  });
  }

  // Append left and right buttons and carousel to wrapper
  wrapperDiv.appendChild(leftButton);
  wrapperDiv.appendChild(carouselUl);
  wrapperDiv.appendChild(rightButton);

  // Append wrapper to game gallery div
  gameGalleryDiv.appendChild(wrapperDiv);

  // Append game gallery div to section
  section.appendChild(gameGalleryDiv);

  // Return the generated section element
  return section;
}

function createGameDetails(gameData) {
  const gameDetailsWrapper = document.createElement("div");
  gameDetailsWrapper.classList.add("game-details");

  // Genres
  if (gameData.genres !== undefined && gameData.genres.length > 0) {
    const genres = gameData.genres.map(genre => genre.name).join(", ");
    const genresParagraph = document.createElement("p");
    genresParagraph.innerHTML = `<span class="purple bold">Genres</span> ${genres}`;
    gameDetailsWrapper.appendChild(genresParagraph);
  }

  // Platforms
  if (gameData.platforms !== undefined && gameData.platforms.length > 0) {
    const platforms = gameData.platforms.map(platform => platform.abbreviation).join(", ");
    const platformsParagraph = document.createElement("p");
    platformsParagraph.innerHTML = `<span class="purple bold">Platforms</span> ${platforms}`;
    gameDetailsWrapper.appendChild(platformsParagraph);
  }

  // Description
  if (gameData.summary !== undefined) {
    const descriptionDiv = document.createElement("div");
    descriptionDiv.classList.add("desc");
    const descriptionParagraph = document.createElement("p");
    descriptionParagraph.textContent = gameData.description;
    descriptionDiv.appendChild(descriptionParagraph);
    gameDetailsWrapper.appendChild(descriptionDiv);
  }

  // Storyline
  if (gameData.storyline !== undefined) {
    const storylineDiv = document.createElement("div");
    storylineDiv.classList.add("story");
    const storylineHeading = document.createElement("h3");
    storylineHeading.textContent = "Storyline";
    const storylineParagraph = document.createElement("p");
    storylineParagraph.textContent = gameData.storyline;
    storylineDiv.appendChild(storylineHeading);
    storylineDiv.appendChild(storylineParagraph);
    gameDetailsWrapper.appendChild(storylineDiv);
  }

  // Social Icons
  if (gameData.websites !== undefined && gameData.websites.length > 0) {
    const socialIconsUl = document.createElement("ul");
    socialIconsUl.classList.add("game-socials");

    let socials = gameData.websites;
    socials.forEach((web) => {
      const websiteLi = document.createElement("li");
      if(web.url !== undefined) {
        const websiteUrl = document.createElement("a")
        websiteUrl.textContent = getWebsiteCategory(web.category);
        websiteUrl.href = web.url;
        websiteLi.appendChild(websiteUrl);
      } else {
        websiteLi.textContent = getWebsiteCategory(web.category);
      }
      socialIconsUl.appendChild(websiteLi);
    });
  
    gameDetailsWrapper.appendChild(socialIconsUl);
  }

  return gameDetailsWrapper;
}

function createGameActionButton(gameData) {
  const gameActionButton = document.createElement("div");
  gameActionButton.classList.add("game-action");

  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("id", "addToWishlist");

  const addToWishlistSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-heart" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/>
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/>
      </svg>
  `;

  const addToWishlistSvgFill = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-heart-fill hide" viewBox="0 0 16 16">
          <path d="M2 15.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/>
      </svg>
  `;

  button.innerHTML = addToWishlistSvg + addToWishlistSvgFill;
  button.data = gameData.id;

  gameActionButton.appendChild(button);

  return gameActionButton;
}
function wishIconAnimation() {
  const cartIcon = document.querySelector("#wishlistBtn");

  cartIcon.classList.add("wish-icon-animate");

  setTimeout(() => {
    cartIcon.classList.remove("wish-icon-animate");
  }, 500); // Match the duration of the animation
}