from flask import Blueprint, jsonify, render_template
import requests
import random

main_routes = Blueprint('main_routes', __name__)

@main_routes.route('/')
def index():
    return render_template('index.html')

@main_routes.route('/random-quote')
def random_quote():
    try:
        response = requests.get('https://type.fit/api/quotes')
        response.raise_for_status()
        quotes = response.json()
        quote = random.choice(quotes)
        author = quote['author'].split(',')[0].strip() if quote.get('author') else 'Unknown'
        if author.endswith(','):
            author = author[:-1]
        return jsonify({
            'quote': quote['text'],
            'author': author
        })
    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching quotes'}), 500

@main_routes.route('/search/<author_name>')
def search(author_name):
    try:
        response = requests.get('https://type.fit/api/quotes')
        response.raise_for_status()
        quotes = response.json()
        filtered_quotes = [
            {
                'quote': quote['text'],
                'author': quote['author'].split(',')[0].strip() if quote.get('author') else 'Unknown'
            }
            for quote in quotes if quote.get('author') and author_name.lower() in quote['author'].lower()
        ]
        for quote in filtered_quotes:
            if quote['author'].endswith(','):
                quote['author'] = quote['author'][:-1]
        return jsonify(filtered_quotes)
    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching quotes'}), 500
