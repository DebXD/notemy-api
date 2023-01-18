from flask import Blueprint, request, jsonify
from src.models.database import User, db
from src.constants.http_status_codes import *
import bcrypt
from src.utils.pwd_checker import is_password_complex
import validators
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from cryptography.fernet import Fernet
from flasgger import swag_from

auth = Blueprint("auth",__name__, url_prefix="/api/v1/auth/")
enc_key = Fernet.generate_key()

@auth.route('/register/', methods=["POST"])
@swag_from('../docs/auth/register.yaml')
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


@auth.route('/login/', methods=["POST"])
@swag_from('../docs/auth/login.yaml')
def login():
        email = request.json.get("email", "")
        password = request.json.get("password", "")

        user = User.query.filter_by(email=email).first()

        if user:
            # convert the password to byte-array
            # bytePwd = password
            # verify password
            is_pass_correct = bcrypt.checkpw(password.encode(
                'utf-8'), user.password)  # user.password is taken from db
            if is_pass_correct:
                refresh = create_refresh_token(identity=user.id)
                access = create_access_token(identity=user.id)
            if True :
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
        else:
            return jsonify({"message" : "wrong credentials"}), HTTP_401_UNAUTHORIZED


@auth.route('/me/', methods=["GET"])

@jwt_required()
@swag_from('../docs/auth/me.yaml')
def getMe():
    user_id = get_jwt_identity()    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "username" : user.username,
        "email" : user.email,
        "created_at" : user.created_at,
        "updated_at" : user.updated_at
    }), HTTP_200_OK


@auth.route('/token/refresh/', methods=["POST"])
@jwt_required(refresh=True)
@swag_from('../docs/auth/refresh_token.yaml')
def refreshUserToken():
    identity = get_jwt_identity()
    access = create_access_token(identity=identity)
    return jsonify({
        "access token" : access
    }), HTTP_200_OK