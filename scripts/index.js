// Fetch news and events from API and populate the page
let allArticles = []; // Store all articles

function fetchNewsAndEvents() {
    console.log('Fetching news and events...');
    return fetch('http://localhost:3000/api/getArticles')
        .then(response => {
            console.log('Response received:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received from API:', data);
            allArticles = data; // Store all articles
            
            // Initially display news (assuming 'news' tab is active by default)
            displayArticles('news');

            // Add event listeners for cards and tabs
            addTabEventListeners();
        })
        .catch(error => {
            console.error('Error fetching and parsing articles:', error);
            alert('An error occurred while loading articles. Please try again later.');
        });
}

function displayArticles(category) {
    const newsContainer = document.getElementById('newsContainer');
    const eventContainer = document.getElementById('eventContainer');

    // Hide both containers initially
    newsContainer.style.display = 'none';
    eventContainer.style.display = 'none';

    // Determine which container to use
    const container = category === 'news' ? newsContainer : eventContainer;
    container.style.display = 'grid'; // Show the relevant container

    container.innerHTML = ''; // Clear existing content

    const filteredArticles = allArticles.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
    );

    if (filteredArticles.length === 0) {
        container.innerHTML = '<p>No articles found for this category.</p>';
    } else {
        filteredArticles.forEach(article => {
            const card = document.createElement('div');
            card.classList.add('event_p1');
            card.setAttribute('data-article-id', article.id);

            card.innerHTML = `
                <img src="${article.image_url}" alt="${article.title}">
                <div class="content">
                    <h3>${article.title}</h3>
                    <p>${article.body.substring(0, 100)}...</p>
                    <div class="date">${new Date(article.created_at).toLocaleDateString()}</div>
                    <div class="read-more">
                        <a href="#" class="read-more-link">Read More</a>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // Adjust the container's height based on its content
    const containerParent = container.parentElement;
    containerParent.style.height = `${container.offsetHeight}px`;

    addCardEventListeners();
}

function addCardEventListeners() {
    document.querySelectorAll('.event_p1').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('read-more-link')) {
                e.preventDefault(); // Prevent default link behavior
            }
            const articleId = this.getAttribute('data-article-id');
            openModal(articleId);
        });
    });
}

function addTabEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.getAttribute('data-tab');
            displayArticles(tabName);
            
            // Add a small delay to allow content to render before adjusting height
            setTimeout(adjustContainerHeight, 50);
        });
    });
}

// Modal functionality
function openModal(articleId) {
    const modal = document.getElementById('articleModal');
    const articleTitle = document.getElementById('articleTitle');
    const articleBody = document.getElementById('articleBody');
    


    // Show the modal
    modal.style.display = 'block';

    // Set loading placeholders
    articleTitle.textContent = 'Loading...';
    articleBody.textContent = 'Please wait while the content loads...';

    // Fetch the article content by ID
    fetch(`http://localhost:3000/api/getArticle?id=${articleId}`)
        .then(response => {
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            

            // Update modal content
            articleTitle.textContent = data.title || 'No title found';
            articleBody.textContent = data.body || 'No content found';
        })
        .catch(error => {
            // Handle errors
            console.error('Error fetching article:', error);
            articleTitle.textContent = 'Error';
            articleBody.textContent = error.message || 'Failed to load the article.';
        });
}

// Close the modal functionality
document.querySelector('.close').onclick = function () {
    const modal = document.getElementById('articleModal');
    modal.style.display = 'none';
};

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById('articleModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};


// Close the modal
document.querySelector('.close').onclick = function () {
    const modal = document.getElementById('articleModal');
    modal.style.display = 'none';
};

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById('articleModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Scroll-based image fade-in/fade-out animations
let lastScrollY = 100;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    document.querySelectorAll('.image').forEach((img) => {
        if (currentScrollY >= 600) {
            img.classList.add('fadeOut');
            img.classList.remove('fadeIn');
        } else {
            img.classList.add('fadeIn');
            img.classList.remove('fadeOut');
        }
    });

    lastScrollY = currentScrollY;
});

// Flip animation for news section after 1 second
const newsBox = document.querySelector('.news');
setTimeout(() => {
    newsBox.classList.add('flip-out'); // Add flip-out animation class

    newsBox.addEventListener('animationend', () => {
        newsBox.classList.remove('flip-out'); // Remove the flip-out class
        newsBox.classList.add('flip-in'); // Add flip-in animation class (optional)
    });
}, 1000); // Trigger after 1 second

// Fetch the data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchNewsAndEvents();
    setTimeout(adjustContainerHeight, 50);
});

function toggleNav() {
    var sidePanel = document.getElementById("sidePanel");
    if (sidePanel.style.width === "250px") {
        sidePanel.style.width = "0"; // Close the panel
    } else {
        sidePanel.style.width = "250px"; // Open the panel
    }
}

// Add this function at the end of your JavaScript file
function adjustContainerHeight() {
    const activeContainer = document.querySelector('.article-grid[style*="display: grid"]');
    if (activeContainer) {
        const containerParent = activeContainer.parentElement;
        containerParent.style.height = `${activeContainer.offsetHeight}px`;
    }
}

// New hamburger menu code
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    hamburger.addEventListener("click", mobileMenu);

    function mobileMenu() {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    }

    // Close mobile menu when clicking on a nav link
    const navLink = document.querySelectorAll(".nav-menu li a");

    navLink.forEach(n => n.addEventListener("click", closeMenu));

    function closeMenu() {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }

    // Existing DOMContentLoaded event listener content
    fetchNewsAndEvents();
    setTimeout(adjustContainerHeight, 50);
});
