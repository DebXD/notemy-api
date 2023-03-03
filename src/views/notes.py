from flask import Blueprint, request, jsonify
from src.models.database import Notes, User, db
from src.constants.http_status_codes import *
from flask_jwt_extended import get_jwt_identity , jwt_required
from src.utils.enc_dec import encryptNote, decryptNote
from flasgger import swag_from


notes = Blueprint("notes",__name__, url_prefix="/api/v1/notes/")


@notes.route('/', methods=["POST"])
@jwt_required()
@swag_from('../docs/notes/add_note.yaml')
def addNotes():
    userId = get_jwt_identity()
    # get the encryption key
    enc_key = User.query.filter_by(id=userId).first().enc_key
    title = request.json.get("title", "")
    content = request.json.get("content", "")

    if title == "" and content == "":
        return jsonify({"message": "title and the content must not be empty"}), HTTP_400_BAD_REQUEST
    if title.isspace() == True and content.isspace() == True:
        return jsonify({"message": "title and content must not contain only whitespaces"}), HTTP_400_BAD_REQUEST

    # encrypt title and note
    enc_title, enc_content = encryptNote(enc_key, title, content)

    note = Notes(title=enc_title, content=enc_content, user_id=userId)
    db.session.add(note)
    db.session.commit()
    # decrypt title and content and return it
    dec_title, dec_content = decryptNote(enc_key, note.title, note.content)

    return jsonify({
        'id': note.id,
        'title': dec_title,
        'content': dec_content,
        'created_at': note.created_at,
        'updated_at': note.updated_at
    }), HTTP_201_CREATED


@notes.route("/", methods=["GET"])
@jwt_required()
@swag_from('../docs/notes/get_notes.yaml')
def getNotes():
    userId = get_jwt_identity()
    # get the encryption key
    enc_key = User.query.filter_by(id=userId).first().enc_key

    # pagination
    page = request.args.get('page', 1, type=int)

    perPage = request.args.get('per_page', 5, int)
    notes = Notes.query.filter_by(user_id=userId).paginate(
        page=page, per_page=perPage)

    data = []
    for note in notes.items:
        dec_title, dec_content = decryptNote(enc_key, note.title, note.content)
        if len(dec_title) > 30:
            dec_title = dec_title[:26] + " ..."
        if len(dec_content) > 80:
            dec_content = dec_content[:76] + " ..."

        data.append({
            'id': note.id,
            'title': dec_title,
            'content': dec_content,
            'created_at': note.created_at,
            'updated_at': note.updated_at
        })
    meta = {
        "page": notes.page,
        "pages": notes.pages,
        "total_count": notes.total,
        "prev": notes.prev_num,
        "next_page": notes.next_num,
        "has_next": notes.has_next,
        "has_prev": notes.has_prev

    }
    return jsonify({'data': data, 'meta': meta}), HTTP_200_OK



@notes.route("/<int:id>/", methods=["GET"])
@jwt_required()
@swag_from('../docs/notes/details_note.yaml')
def getNoteDetail(id):
    userId = get_jwt_identity()
    # get the encryption key
    enc_key = User.query.filter_by(id= userId).first().enc_key
    
    note =  Notes.query.filter_by(user_id=userId, id=id).first()

    if not note:
        return jsonify({"message" : "item not found" }), HTTP_404_NOT_FOUND
    dec_title, dec_content = decryptNote(enc_key, note.title, note.content)
    return jsonify({
            'id' : note.id,
            'title' : dec_title,
            'content' : dec_content,
            'created_at' : note.created_at,
            'updated_at' : note.updated_at

    }), HTTP_200_OK


@notes.route("/<int:id>/", methods=['PATCH'])
@jwt_required()
@swag_from('../docs/notes/update_note.yaml')
def updateNote(id):
    if request.method == "PATCH":
        title = request.json.get("title")
        content = request.json.get("content")

        userId = get_jwt_identity()
        note = Notes.query.filter_by(user_id=userId, id=id).first()
        if not note:
            return jsonify({"message" : "item not found" }), HTTP_404_NOT_FOUND
        # get the encryption key
        enc_key = User.query.filter_by(id= userId).first().enc_key
        # decrypt title and content
        dec_title, dec_content = decryptNote(enc_key, note.title, note.content)
        if dec_title == title and dec_content == content:
            return jsonify({"message" : "note must not be same as before"}), HTTP_400_BAD_REQUEST
        
        if title == "" and content == "":
            return jsonify({"message" : "note must not be empty"}), HTTP_400_BAD_REQUEST

        if title.isspace() == True and content.isspace() == True:
            return jsonify({"message" : "title and content must not contain only whitespaces"}), HTTP_400_BAD_REQUEST
        
        
        #encrypt title and note
        enc_title, enc_content = encryptNote(enc_key, title, content)
        # add the updated encryped title and content to db
        note.title = enc_title
        note.content = enc_content

        db.session.commit()
        # decrypt title and content and return with modification
        dec_title, dec_content = decryptNote(enc_key, note.title, note.content)
        return jsonify({
            'id' : note.id,
            'title' : dec_title,
            'content' : dec_content,
            'created_at' : note.created_at,
            'updated_at' : note.updated_at
        }), HTTP_200_OK

@notes.route("/<int:id>/", methods = ['DELETE'])
@jwt_required()
@swag_from('../docs/notes/delete_note.yaml')
def deleteNote(id):
    userId = get_jwt_identity()
    
    note =  Notes.query.filter_by(user_id=userId, id=id).first()
    if not note:
        return jsonify({"message" : "item not found" }), HTTP_404_NOT_FOUND

    db.session.delete(note)
    db.session.commit()
    return jsonify({'message': "item deleted"}), HTTP_204_NO_CONTENT

@notes.route("/search/", methods=['GET'])
@jwt_required()
@swag_from('../docs/notes/search_notes.yaml')
def searchNote():
    search = request.args.get('query')
    # if search == '':
    #     return jsonify({'message' : 'no query given'}), HTTP_400_BAD_REQUEST
     
    userId = get_jwt_identity()
    userNotes = Notes.query.filter_by(user_id=userId).all()
    enc_key = User.query.filter_by(id=userId).first().enc_key
    
    foundNotes = []
    for note in userNotes:
        dec_title, dec_content = decryptNote(enc_key, note.title, note.content)
        # combine note and title for search_text
        text = dec_title.lower() + ' ' + dec_content.lower()
        search_text = search.lower()

        # find if there any maching words available
        if text.find(search_text) == -1:
            pass

        else:
            # append it to list as dic/key value pair
            data = {    'id' : note.id,
                        'title': dec_title,
                        'content': dec_content,
                        'created_at' : note.created_at,
                        'updated_at' : note.updated_at
                    }
            foundNotes.append(data)
            
    if len(foundNotes) == 0:
        return jsonify({'message' : 'no results found'}), HTTP_404_NOT_FOUND
    
    return jsonify({ 'data' : foundNotes}), HTTP_200_OK


