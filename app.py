from flask import Flask
from main_routes import main_routes

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-very-secret-key!@#12345y'  # Replace with your generated secret key

app.register_blueprint(main_routes)

if __name__ == '__main__':
    app.run(debug=True)
