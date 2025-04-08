const API_URL = "https://images-api.nasa.gov/search?q=";
const DEFAULT_QUERY = "galaxy";
const form = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsSection = document.getElementById("results");
const favoritesSection = document.getElementById("favorites-section");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function fetchImages(query) {
  const res = await fetch(`${API_URL}${query}`);
  const data = await res.json();
  return data.collection.items.filter(item => item.links && item.links[0].href).slice(0, 9);
}

function renderImages(items, container, isFavorite) {
  container.innerHTML = "";
  items.forEach(({ data, links }) => {
    const title = data[0].title;
    const imgUrl = links[0].href;

    const card = document.createElement("div");
    card.className = "bg-gray-800 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition duration-300";

    card.innerHTML = `
      <img src="${imgUrl}" alt="${title}" class="w-full h-56 object-cover">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">${title}</h3>
        <button class="favorite-btn px-4 py-2 bg-pink-600 hover:bg-pink-800 text-white rounded">
          ${isFavorite ? "Remove" : "❤ Save"}
        </button>
      </div>
    `;

    card.querySelector(".favorite-btn").addEventListener("click", () => {
      if (isFavorite) {
        favorites = favorites.filter(fav => fav.imgUrl !== imgUrl);
      } else {
        favorites.push({ title, imgUrl });
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    });

    container.appendChild(card);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim() || DEFAULT_QUERY;
  const results = await fetchImages(query);
  renderImages(results, resultsSection, false);
});

function renderFavorites() {
  renderImages(favorites, favoritesSection, true);
}

// Load featured images on start
(async () => {
  const featured = await fetchImages(DEFAULT_QUERY);
  renderImages(featured, resultsSection, false);
  renderFavorites();
})();
