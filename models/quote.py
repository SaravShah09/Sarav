from pymongo import MongoClient
import os

client = MongoClient(os.getenv('MONGO_URI'))
db = client.quote_of_the_day

class Quote:
    def __init__(self, text, author):
        self.text = text
        self.author = author
        self.likes = 0

    def save(self):
        db.quotes.insert_one({
            'text': self.text,
            'author': self.author,
            'likes': self.likes
        })

    @staticmethod
    def find_by_author(author):
        return list(db.quotes.find({'author': {'$regex': author, '$options': 'i'}}))

    @staticmethod
    def get_all():
        return list(db.quotes.find())

    @staticmethod
    def like_quote(id):
        db.quotes.update_one({'_id': id}, {'$inc': {'likes': 1}})
