export function renderWithTemplate(data, parentElement, templateFn = (data)=>{return data}, position = "beforeend", clear = false) {
  const targetElement = document.querySelector(parentElement);

  if (!targetElement) {
    console.error(`Parent element "${parentElement}" not found.`);
    return;
  }

  if (clear) {
    targetElement.innerHTML = ""; 
  }

  let content;
  if (Array.isArray(data)) {
    const htmlStrings = data.map(templateFn);
    content = htmlStrings.join('');
  } else {
    content = templateFn(data);
  }

  targetElement.insertAdjacentHTML(position, content);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// Retrieve data from local storage
export function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// load the header and footer
export async function loadTemplate(path) {
  const html = await getTemplate(path)
  return html;
}

// Load the header and footer using templates
export async function loadHeaderFooter(headerId, footerId, headerPath, footerPath) {
  const headerPromise = loadTemplate(headerPath);
  const footerPromise = loadTemplate(footerPath);

  const [headerContent, footerContent] = await Promise.all([headerPromise, footerPromise]);

  renderWithTemplate(headerContent, headerId, (data) => {return data}, "afterbegin");
  renderWithTemplate(footerContent, footerId, (data) => {return data}, "afterbegin");
  
  // Return a promise that resolves when both header and footer are loaded
  return Promise.resolve();
}

// Fetch DOM from partials
async function getTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("Failed to fetch template");
  }
  return response.text();
}

// Custom Alert Message
export function alertMessage(message, scroll = true) {
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.innerHTML = `${message} <span class="close-btn">&times;</span>`;
  alert.querySelector('.close-btn').addEventListener('click', () => alert.remove());

  document.body.prepend(alert);

  if (scroll) {
    window.scrollTo(0, 0);
  }
}

// Remove all alert messages
export function removeAllAlerts() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => alert.remove());
}

export function getCategory(category) {
  switch(category) {
    case 0:
      return 'Game';
    case 1:
      return 'DLC';
    case 2:
      return 'Expansion';
    case 3:
      return 'Bundle';
    case 4:
      return 'Expansion';
    case 5:
      return 'Mod';
    case 6:
      return 'Episode';
    case 7:
      return 'Season';
    case 8:
      return 'Remake';
    case 9:
      return 'Remaster';
    case 10:
      return 'Expanded Game';
    case 11:
      return 'Port';
    case 12:
      return 'Fork';
    case 13:
      return 'Pack';
    case 14:
      return 'Update';
    default:
      return 'Unknown';
  }
};

export function getGameMode(mode) {
  switch(mode) {
    case 1:
      return 'Single player';
    case 2:
      return 'Multiplayer';
    case 3:
      return 'Co-op';
    case 4:
      return 'Split screen';
    case 5:
      return 'MMO';
    case 6:
      return 'Battle Royale';
    default:
      return 'Unknown';
  }
};