import APIServer from "./APIServer.mjs";
import GameList from "./GameList.mjs";
import { loadHeaderFooter, convertUnixToJson, alertMessage } from "./utils.mjs";

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

async function renderEvent() {
  let eventData = await getEventData();
  eventData = eventData[0];
  const eventAdSection = document.querySelector(".event-ad");
  const eventWrapper = document.createElement("div");
  eventWrapper.className = "event-box";

  // Create the close button
  const closeButton = document.createElement("button");
  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.textContent = "X";
  eventWrapper.appendChild(closeButton);

  // Create the event logo
  const eventImage = document.createElement("img");
  eventImage.src = `https://images.igdb.com/igdb/image/upload/t_logo_med/${eventData.event_logo.image_id}.webp`;
  eventImage.alt = "Event Image";
  eventImage.classList.add("event-logo");
  eventImage.classList.add("fit-image");
  eventImage.width = eventData.event_logo.width;
  eventImage.height = eventData.event_logo.height;
  eventWrapper.appendChild(eventImage);

  // Create the event video
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${eventData.videos[0].video_id}?autoplay=1&mute=1&controls=0`;
  iframe.allow = "autoplay; encrypted-media";
  iframe.height = 500;
  iframe.width = 800;
  iframe.allowFullscreen = true;
  iframe.setAttribute("title", `${eventData.videos[0].name}`);

  // Set the iframe attributes for autoplay, mute, and no tooltips
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
  );
  iframe.setAttribute("muted", "1");
  iframe.setAttribute("controls", "0");
  iframe.setAttribute("showinfo", "0");
  iframe.setAttribute("iv_load_policy", "3");
  iframe.setAttribute("modestbranding", "1");
  eventWrapper.appendChild(iframe);

  // Create the event title
  const eventTitle = document.createElement("h2");
  eventTitle.className = "event-title";
  eventTitle.textContent = eventData.name;
  eventWrapper.appendChild(eventTitle);

  // Create the event details
  const eventDetails = document.createElement("div");
  eventDetails.className = "event-details";

  // Create the start date
  const startDate = convertUnixToJson(eventData.start_time);
  const startDateElement = document.createElement("span");
  startDateElement.textContent = `Start Date: ${startDate.formattedDate}`;
  eventDetails.appendChild(startDateElement);

  // Create the event description
  const eventDescription = document.createElement("p");
  eventDescription.className = "event-description";
  eventDescription.textContent = eventData.description;
  eventDetails.appendChild(eventDescription);

  eventWrapper.appendChild(eventDetails);

  eventAdSection.appendChild(eventWrapper);

  closeButton.addEventListener("click", function () {
    eventWrapper.parentNode.removeChild(eventWrapper);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  await renderSlideshow();
  await renderEvent();
});

async function renderSlideshow() {
  const gamesData = await getSlideshowData();

  const sizes = [
    {
      name: "screenshot_med",
      mediaMax: 569,
    },
    {
      name: "720p",
      mediaMax: 1280,
    },
  ];
  const slideshow = document.querySelector(".slide-show");

  // Dynamically create picture elements for each game artwork
  gamesData.forEach((game) => {
    const picture = document.createElement("picture");
    picture.classList.add("hero-slide");

    sizes.forEach((size) => {
      const source = document.createElement("source");
      source.setAttribute("media", `(max-width: ${size.mediaMax}px)`);
      source.setAttribute(
        "srcset",
        `https://images.igdb.com/igdb/image/upload/t_${size.name}/${game.artworks[0].image_id}.webp`,
      );
      picture.appendChild(source);
    });

    const img = document.createElement("img");
    img.setAttribute(
      "src",
      `https://images.igdb.com/igdb/image/upload/t_1080p/${game.artworks[0].image_id}.webp`,
    );
    img.setAttribute("alt", game.name);
    img.classList.add("fit-image");
    picture.appendChild(img);

    slideshow.appendChild(picture);
  });

  const slides = document.querySelectorAll(".hero-slide");
  let currentSlide = 0;

  function showSlide(slideIndex) {
    slides.forEach((slide, index) => {
      if (index === slideIndex) {
        slide.classList.add("current");
      } else {
        slide.classList.remove("current");
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  setInterval(nextSlide, 5000);
}

async function getSlideshowData() {
  // Get the current date
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear(), 0, 1);
  const januaryFirstTimestamp = Math.floor(currentDate.getTime() / 1000);

  var body = `
  fields name,artworks.image_id,artworks.height,artworks.width;
  limit 10;
  where artworks != null & rating >= 80 & release_dates.date >= ${januaryFirstTimestamp} & platforms = [48,49,6,130,167] & themes != (42);
  `;

  let dataSource = new APIServer();
  let data = await dataSource.fetchData("/games", body);
  return data;
}

async function getEventData() {
  var body = `
  fields name,description,event_logo.image_id,event_logo.height,event_logo.width,start_time,time_zone,videos.video_id,videos.name,event_networks.network_type,event_networks.url;
  limit 1;
  `;

  let dataSource = new APIServer();
  let data = await dataSource.fetchData("/events", body);
  return data;
}

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

var body1 = `
fields name,category,cover.image_id,game_modes.name,genres.name,platforms.abbreviation;
limit 20;
where cover.url != null & rating >= 80 & release_dates.date > 1546300800 & platforms = [48,49,6,130,167] & themes != (42);
`;

const popGameList = new GameList(
  "/games",
  body1,
  ".popular-game-list",
  gameCardFunction,
);

popGameList.init();

var body2 = `
fields name,category,cover.image_id,cover.height,cover.width,game_modes.name,genres.name,platforms.abbreviation;
limit 20;
where cover.url != null & artworks.image_id != null & rating >= 80 & platforms = 48 & themes != (42);
`;

const ps4GameList = new GameList(
  "/games",
  body2,
  ".ps4-game-list",
  gameCardFunction,
);

ps4GameList.init();
