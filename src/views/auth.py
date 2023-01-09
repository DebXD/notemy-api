from flask import Blueprint, request, jsonify
from src.models.database import User, db
from werkzeug.security import check_password_hash, generate_password_hash
from src.constants.http_status_codes import *
from flask_bcrypt import bcrypt
from src.utils.pwd_checker import is_password_complex
import validators
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from cryptography.fernet import Fernet


auth = Blueprint("auth",__name__, url_prefix="/api/v1/auth/")
enc_key = Fernet.generate_key()

@auth.route('/register/', methods=["POST"])
def register():
    username = request.json['username'];
    email = request.json['email']
    password = request.json['password']

    if len(password) < 6:
        return jsonify({"message": "password is too short"}), HTTP_400_BAD_REQUEST

    if len(username) < 4:
        return jsonify({"message": "username is too short"}), HTTP_400_BAD_REQUEST

    if not username.isalnum() or " " in username:
        return jsonify({"message": "username should be alphanumeric, also no spaces allowed"}), HTTP_400_BAD_REQUEST
    
    if not (is_password_complex(password)):
        return jsonify({"message" : "use a stronger password"}), HTTP_400_BAD_REQUEST

    if not validators.email(email):
        return jsonify({"message" : "email is not valid"}), HTTP_400_BAD_REQUEST

    if User.query.filter_by(email=email).first() is not None:
        return jsonify({"message" : "email exists"}), HTTP_409_CONFLICT
    
    if User.query.filter_by(username=username).first() is not None:
        return jsonify({"message" : "username exists"}), HTTP_409_CONFLICT

    # convert the password to byte-array(string)
    bytePwd = password.encode('utf-8')
    genSalt = bcrypt.gensalt()
    pwd_hash = bcrypt.hashpw(bytePwd, genSalt)

    user = User(username = username, password=pwd_hash, email=email, enc_key=enc_key)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message" : "User created", 
                    "user":{
                        "username" : username,
                        "email" : email,
                        
                    }}), HTTP_201_CREATED


@auth.route('/login/', methods= ["GET", "POST"])
def login():
        email = request.json.get("email", "")
        password = request.json.get("password", "")

        user = User.query.filter_by(email=email).first()

        if user:
            # convert the password to byte-array
            bytePwd = password.encode('utf-8')
            # verify password
            is_pass_correct = bcrypt.checkpw(bytePwd, user.password)  # user.password is taken from db
            if is_pass_correct:
                refresh = create_refresh_token(identity=user.id)
                access = create_access_token(identity=user.id)
            return jsonify(
                {
                    "user" : {
                        "refresh token" : refresh,
                        "access token"  : access,
                        "username" : user.username,
                        "email" : user.email,
                    }
                }
            ), HTTP_200_OK

        return jsonify({"message" : "wrong credentials"}), HTTP_401_UNAUTHORIZED


@auth.route('/me/', methods=["GET", "POST"])
@jwt_required()
def getMe():
    user_id = get_jwt_identity()    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "username" : user.username,
        "email" : user.email
    }), HTTP_200_OK

@auth.route('/token/refresh/', methods=["GET", "POST"])
@jwt_required(refresh=True)
def refreshUserToken():
    identity = get_jwt_identity()
    access = create_access_token(identity=identity)
    return jsonify({
        "access token" : access
    }), HTTP_200_OK