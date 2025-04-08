// Optional: Smooth scroll for anchor links
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


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
          ${isFavorite ? "Remove" : "Save"}
        </button>
      </div>
    `;
    async function fetchAPOD() {
        const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
        const data = await res.json();
      
        const apodImg = document.getElementById("apod-img");
        const apodTitle = document.getElementById("apod-title");
        const apodDate = document.getElementById("apod-date");
        const apodDesc = document.getElementById("apod-desc");
      
        apodImg.src = data.url;
        apodTitle.textContent = data.title;
        apodDate.textContent = `Date: ${data.date}`;
        apodDesc.textContent = data.explanation;
      }
      
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
const apodPicker = document.getElementById("apod-date-picker");
const apodBtn = document.getElementById("fetch-apod-btn");
const apodContainer = document.getElementById("apod-container");

// Set max date to today
apodPicker.max = new Date().toISOString().split("T")[0];

// Load today's APOD on page load
fetchAPOD();

// Fetch APOD for a selected date
apodBtn.addEventListener("click", () => {
  const selectedDate = apodPicker.value;
  if (!selectedDate) return;
  fetchAPOD(selectedDate);
});

async function fetchAPOD(date = "") {
  const url = date
    ? `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${date}`
    : `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`;

  const res = await fetch(url);
  const data = await res.json();

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