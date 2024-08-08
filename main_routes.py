from flask import Blueprint, render_template, jsonify, request
import requests

main_routes = Blueprint('main_routes', __name__)

favorites = []

def fetch_random_quote():
    try:
        response = requests.get('https://type.fit/api/quotes')
        if response.status_code == 200:
            quotes = response.json()
            from random import choice
            quote = choice(quotes)
            author = quote['author'].split(',')[0] if quote['author'] else 'Unknown'
            return {'quote': quote['text'], 'author': author}
        else:
            return None
    except Exception as e:
        print(f"Error fetching quotes: {e}")
        return None

@main_routes.route('/')
def home():
    return render_template('index.html')

@main_routes.route('/favorites')
def favorites_page():
    return render_template('favorites.html')

@main_routes.route('/get-favorites')
def get_favorites():
    return jsonify(favorites)

@main_routes.route('/add-favorite', methods=['POST'])
def add_favorite():
    data = request.json
    quote = data.get('quote')
    author = data.get('author')

    if quote and author:
        if not any(fav['quote'] == quote and fav['author'] == author for fav in favorites):
            favorites.append({'quote': quote, 'author': author})
            return jsonify({'message': 'Quote added to favorites.'}), 200
        else:
            return jsonify({'message': 'Quote already in favorites.'}), 200
    return jsonify({'message': 'Invalid data.'}), 400

@main_routes.route('/remove-favorite', methods=['POST'])
def remove_favorite():
    data = request.json
    quote = data.get('quote')
    author = data.get('author')

    global favorites
    if quote and author:
        favorites = [fav for fav in favorites if not (fav['quote'] == quote and fav['author'] == author)]
        return jsonify({'message': 'Quote removed from favorites.'}), 200
    return jsonify({'message': 'Invalid data.'}), 400

@main_routes.route('/clear-favorites', methods=['POST'])
def clear_favorites():
    global favorites
    favorites = []
    return jsonify({'message': 'All favorites cleared.'}), 200

@main_routes.route('/random-quote')
def random_quote():
    quote = fetch_random_quote()
    if quote:
        return jsonify(quote)
    else:
        return jsonify({'message': 'Failed to fetch quote.'}), 500

@main_routes.route('/search/<author_name>')
def search(author_name):
    try:
        response = requests.get('https://type.fit/api/quotes')
        if response.status_code == 200:
            quotes = response.json()
            matched_quotes = [quote for quote in quotes if author_name.lower() in (quote['author'] or 'Unknown').lower()]
            for quote in matched_quotes:
                quote['author'] = quote['author'].split(',')[0] if quote['author'] else 'Unknown'
            return jsonify(matched_quotes)
        else:
            return jsonify([])
    except Exception as e:
        print(f"Error searching quotes: {e}")
        return jsonify([])
