const API_URL = "https://images-api.nasa.gov/search?q=";
const API_KEY = "DEMO_KEY"; // Use your own API key if needed

const form = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsSection = document.getElementById("results");
const favoritesSection = document.getElementById("favorites-section");
const apodPicker = document.getElementById("apod-date-picker");
const apodBtn = document.getElementById("fetch-apod-btn");
const apodContainer = document.getElementById("apod-container");

// Initialize favorites
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Set max date for picker to today's date
apodPicker.max = new Date().toISOString().split("T")[0];

// Event listener for the search form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    const results = await fetchImages(query);
    renderImages(results, resultsSection, false);
  }
});

// Event listener for the APOD date picker
apodBtn.addEventListener("click", async () => {
  const selectedDate = apodPicker.value;
  if (!selectedDate) return;
  fetchAPOD(selectedDate);
});

// Fetch images from NASA's API based on the search query
async function fetchImages(query) {
  const res = await fetch(`${API_URL}${query}`);
  const data = await res.json();
  return data.collection.items.filter(item => item.links && item.links[0].href).slice(0, 9);
}

// Fetch the Astronomy Picture of the Day (APOD)
async function fetchAPOD(date = "") {
  const url = date
    ? `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`
    : `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
    
  const res = await fetch(url);
  const data = await res.json();

  // Handle non-image APODs
  if (data.media_type !== "image") {
    apodContainer.innerHTML = "<p class='text-red-400'>No image available for this date.</p>";
    return;
  }

  document.getElementById("apod-img").src = data.url;
  document.getElementById("apod-title").textContent = data.title;
  document.getElementById("apod-date").textContent = `Date: ${data.date}`;
  document.getElementById("apod-desc").textContent = data.explanation;
  apodContainer.classList.remove("hidden");
}

// Render images to the results section
function renderImages(items, container, isFavorite) {
  container.innerHTML = "";
  items.forEach(({ data, links }) => {
    const title = data[0].title;
    const imgUrl = links[0].href;

    const card = document.createElement("div");
    card.className = "image-card bg-gray-800 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition duration-300";
    card.innerHTML = `
      <img src="${imgUrl}" alt="${title}" class="w-full h-56 object-cover">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">${title}</h3>
        <button class="favorite-btn px-4 py-2 bg-pink-600 hover:bg-pink-800 text-white rounded">
          ${isFavorite ? "Remove from Favorites" : "❤"}
        </button>
      </div>
    `;

    card.querySelector(".favorite-btn").addEventListener("click", () => {
      if (isFavorite) {
        removeFromFavorites(imgUrl);
      } else {
        addToFavorites({ title, imgUrl });
      }
      renderFavorites();
    });

    container.appendChild(card);
  });
}

// Add an image to favorites
function addToFavorites(item) {
  favorites.push(item);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Remove an image from favorites
function removeFromFavorites(imgUrl) {
  favorites = favorites.filter(fav => fav.imgUrl !== imgUrl);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Render the favorites section
function renderFavorites() {
  renderImages(favorites, favoritesSection, true);
}

// Load featured images and render favorites on page load
(async () => {
  const featured = await fetchImages("galaxy");
  renderImages(featured, resultsSection, false);
  renderFavorites();
})();
