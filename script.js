const API_KEY = 'DEMO_KEY';
const imageLoader = document.getElementById('imageLoader');
const nasaImage = document.getElementById('nasaImage');
const imageDescription = document.getElementById('imageDescription');

function showLoader() {
    imageLoader.style.display = 'flex';
    nasaImage.style.display = 'none';
}

function hideLoader() {
    imageLoader.style.display = 'none';
    nasaImage.style.display = 'block';
}

function fetchNASAData() {
    showLoader();
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            nasaImage.src = data.url;
            imageDescription.textContent = data.explanation;
            hideLoader();
        })
        .catch(error => {
            console.error('Error fetching NASA data:', error);
            hideLoader();
            showToast('Failed to load image. Please try again.');
        });
}

function searchNASAImages() {
    const query = document.getElementById('searchQuery').value;
    if (!query) {
        showToast('Please enter a search term');
        return;
    }

    showLoader();
    fetch(`https://images-api.nasa.gov/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.collection.items.length > 0) {
                nasaImage.src = data.collection.items[0].links[0].href;
                imageDescription.textContent = data.collection.items[0].data[0].description;
            } else {
                showToast('No images found for your search');
            }
            hideLoader();
        })
        .catch(error => {
            console.error('Error searching NASA images:', error);
            hideLoader();
            showToast('Search failed. Please try again.');
        });
}

function fetchNASAImageByDate() {
    const date = document.getElementById('dateInput').value;
    if (!date) {
        showToast('Please select a date');
        return;
    }

    showLoader();
    fetch(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            nasaImage.src = data.url;
            imageDescription.textContent = data.explanation;
            hideLoader();
        })
        .catch(error => {
            console.error('Error fetching image by date:', error);
            hideLoader();
            showToast('Failed to load image for selected date');
        });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchNASAData();
});