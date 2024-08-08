document.addEventListener('DOMContentLoaded', () => {
    const getRandomQuoteButton = document.getElementById('get-random-quote');
    const randomQuoteDisplay = document.getElementById('random-quote-display');
    const authorInput = document.getElementById('author-name');
    const suggestions = document.getElementById('suggestions');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const favoritesList = document.getElementById('favorites-list');
    const clearFavoritesButton = document.getElementById('clear-favorites');
    const messageDiv = document.getElementById('message');

    let theme = 'dark-theme-1';
    document.body.classList.add(theme);

    async function loadFavorites() {
        try {
            const response = await fetch('/get-favorites');
            if (!response.ok) throw new Error('Failed to fetch favorites.');
            const data = await response.json();
            favoritesList.innerHTML = data.length > 0
                ? data.map(fav => `
                    <div class="favorite-item" data-quote="${fav.quote}" data-author="${fav.author}">
                        <p>${fav.quote}</p>
                        <p><strong>- ${fav.author}</strong></p>
                        <button class="remove-favorite">Remove</button>
                    </div>
                `).join('')
                : '<p>No favorites found.</p>';
            attachRemoveListeners();
        } catch (error) {
            console.error('Error loading favorites:', error);
            favoritesList.innerHTML = '<p>Error loading favorites. Please try again later.</p>';
        }
    }

    async function handleFavoriteQuote(e) {
        if (e.target.classList.contains('favorite-quote-button')) {
            const quote = e.target.getAttribute('data-quote');
            const author = e.target.getAttribute('data-author');
            try {
                const response = await fetch('/add-favorite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quote, author })
                });
                const data = await response.json();
                showMessage(data.message);
                if (window.location.pathname === '/favorites') {
                    loadFavorites();
                }
            } catch (error) {
                console.error('Error adding quote to favorites:', error);
                showMessage('Error adding quote to favorites.');
            }
        }

        if (e.target.classList.contains('remove-favorite')) {
            const quote = e.target.closest('.favorite-item').getAttribute('data-quote');
            const author = e.target.closest('.favorite-item').getAttribute('data-author');
            try {
                const response = await fetch('/remove-favorite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quote, author })
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message);
                    e.target.closest('.favorite-item').remove();
                } else {
                    showMessage('Error removing quote from favorites.');
                }
            } catch (error) {
                console.error('Error removing quote from favorites:', error);
                showMessage('Error removing quote from favorites.');
            }
        }
    }

    async function clearFavorites() {
        try {
            const response = await fetch('/clear-favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (response.ok) {
                showMessage(data.message);
                favoritesList.innerHTML = '<p>No favorites found.</p>';
            } else {
                showMessage('Error clearing favorites.');
            }
        } catch (error) {
            console.error('Error clearing favorites:', error);
            showMessage('Error clearing favorites.');
        }
    }

    function showMessage(message) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        messageDiv.style.opacity = '1';
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.style.display = 'none', 500); // Hide after transition
        }, 3000); // Show message for 3 seconds
    }

    function attachRemoveListeners() {
        const removeButtons = document.querySelectorAll('.remove-favorite');
        removeButtons.forEach(button => {
            button.addEventListener('click', handleFavoriteQuote);
        });
    }

    toggleThemeButton?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-1');
        document.body.classList.toggle('dark-theme-2');
        theme = theme === 'dark-theme-1' ? 'dark-theme-2' : 'dark-theme-1';
    });

    getRandomQuoteButton?.addEventListener('click', async () => {
        try {
            const response = await fetch('/random-quote');
            if (!response.ok) throw new Error('Failed to fetch random quote.');
            const data = await response.json();
            randomQuoteDisplay.innerHTML = `
                <div class="quote-card">
                    <p>${data.quote}</p>
                    <p><strong>- ${data.author}</strong></p>
                    <button class="favorite-quote-button" data-quote="${data.quote}" data-author="${data.author}">Add to Favorites</button>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching random quote:', error);
            randomQuoteDisplay.innerHTML = '<p>Error fetching quote. Please try again.</p>';
        }
    });

    authorInput?.addEventListener('input', async () => {
        const authorName = authorInput.value.trim();
        if (authorName.length > 0) {
            try {
                const response = await fetch(`/search/${authorName}`);
                if (!response.ok) throw new Error('Failed to search quotes.');
                const data = await response.json();
                suggestions.innerHTML = data.length > 0
                    ? data.map(quote => `
                        <div class="suggestion-item" data-quote="${quote.text}" data-author="${quote.author}">
                            <p>${quote.text}</p>
                            <p><strong>- ${quote.author}</strong></p>
                            <button class="add-to-quote-button">Use this quote</button>
                        </div>
                    `).join('')
                    : '<p>No suggestions found.</p>';
            } catch (error) {
                console.error('Error searching quotes:', error);
                suggestions.innerHTML = '<p>Error searching quotes. Please try again later.</p>';
            }
        } else {
            suggestions.innerHTML = '';
        }
    });

    suggestions?.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-quote-button')) {
            const quote = e.target.closest('.suggestion-item').getAttribute('data-quote');
            const author = e.target.closest('.suggestion-item').getAttribute('data-author');
            randomQuoteDisplay.innerHTML = `
                <div class="quote-card">
                    <p>${quote}</p>
                    <p><strong>- ${author}</strong></p>
                    <button class="favorite-quote-button" data-quote="${quote}" data-author="${author}">Add to Favorites</button>
                </div>
            `;
        }
    });

    clearFavoritesButton?.addEventListener('click', clearFavorites);

    // Load favorites on favorites page load
    if (window.location.pathname === '/favorites') {
        loadFavorites();
    }

    document.addEventListener('click', handleFavoriteQuote);
});
