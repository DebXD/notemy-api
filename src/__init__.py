from flask import Flask, jsonify
import os
from src.auth import auth
from src.notes import notes
from src.database import db
from flask_jwt_extended import JWTManager

def create_app(test_config=None):
    app = Flask(__name__,
    instance_relative_config=True)

    if test_config is None:
        app.config.from_mapping(
            SECRET_KEY=os.environ.get("SECRET_KEY"),
            SQLALCHEMY_DATABASE_URI=os.environ.get("SQLALCHEMY_DB_URI"),
            JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY")
        )
    else:
        app.config.from_mapping(test_config)

    
    with app.app_context():
        db.app = app
        db.init_app(db.app)
    
    JWTManager(app)


    app.register_blueprint(auth)
    app.register_blueprint(notes)


    @app.route("/")
    def hello():
        return "hello world"

    @app.route("/hello/")
    def ola():
        return jsonify({"message" : "HELLO WORLD"})

    return app