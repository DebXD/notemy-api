from flask import Flask, jsonify
from src.views.auth import auth
from src.views.notes import notes
from src.models.database import db
from flask_jwt_extended import JWTManager
from src.constants.http_status_codes import *
from flasgger import Swagger
from src.config.swagger import template, swagger_config
import psycopg2
from .extensions import db
from decouple import config

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = config("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = config("SQLALCHEMY_DB_URI")
    app.config['JWT_SECRET_KEY'] = config("JWT_SECRET_KEY")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth)
    app.register_blueprint(notes)

    Swagger(app, config=swagger_config,  template=template)

    # error handling
    @app.errorhandler(HTTP_404_NOT_FOUND)
    def page_not_found(error):
        return jsonify({"message": "this page doesn't exist"}), HTTP_404_NOT_FOUND

    @app.errorhandler(HTTP_500_INTERNAL_SERVER_ERROR)
    def server_error(error):
        return jsonify({"message": "something Went wrong on our side"}), HTTP_500_INTERNAL_SERVER_ERROR

    return app
