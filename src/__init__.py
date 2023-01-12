from flask import Flask, jsonify
import os
from src.views.auth import auth
from src.views.notes import notes
from src.models.database import db
from flask_jwt_extended import JWTManager
from src.constants.http_status_codes import *
from flasgger import Swagger, swag_from
from src.config.swagger import template, swagger_config
import psycopg2
from .extensions import db


def create_app():
    app = Flask(__name__)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY"),
        SQLALCHEMY_DATABASE_URI=os.environ.get("SQLALCHEMY_DB_URI"),
        JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY"),

        SWAGGER={
            'title': 'Notemy API',
            'uiversion': 3

        }

    )

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
