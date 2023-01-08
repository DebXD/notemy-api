from flask import Blueprint, request, jsonify
from src.database import Notes, db
from src.constants.http_status_codes import *
from flask_jwt_extended import get_jwt_identity , jwt_required


notes = Blueprint("notes",__name__, url_prefix="/api/v1/notes/")

@notes.route('/', methods=["GET", "POST"])
@jwt_required()
def getNotes():
    userId = get_jwt_identity()
    if request.method == 'POST':
        title = request.json.get("title", "")
        content = request.json.get("content", "")
    
        if title == "" and content == "":
            return jsonify({"error" : "title and the content must not be empty"}), HTTP_400_BAD_REQUEST
        if title.isspace() == True and content.isspace() == True:
            return jsonify({"error" : "title and content must not contain only whitespaces"}), HTTP_400_BAD_REQUEST
        
        note = Notes(title=title, content=content, user_id=userId )
        db.session.add(note)
        db.session.commit()
        return jsonify({
            'id' : note.id,
            'title' : note.title,
            'content' : note.content,
            'created_at' : note.created_at,
            'updated_at' : note.updated_at
        }), HTTP_201_CREATED

    else:
        page = request.args.get('page', 1, type=int)

        perPage = request.args.get('per_page', 5, int)
        notes = Notes.query.filter_by(user_id=userId).paginate(page=page, per_page=perPage)

        data = []
        for note in notes.items:
            data.append({
                'id' : note.id,
                'title' : note.title,
                'content' : note.content,
                'created_at' : note.created_at,
                'updated_at' : note.updated_at
            })
        meta = {
            "page" : notes.page,
            "pages" : notes.pages,
            "total_count" : notes.total,
            "prev" : notes.prev_num,
            "next_page" : notes.next_num,
            "has_next" : notes.has_next,
            "has_prev" : notes.has_prev

            }
        return jsonify({'data' : data, 'meta' : meta}), HTTP_200_OK


@notes.route("/<int:id>/", methods=["GET"])
@jwt_required()
def getNoteDetail(id):
    userId = get_jwt_identity()
    
    note =  Notes.query.filter_by(user_id=userId, id=id).first()

    if not note:
        return jsonify({"message" : "item not found" }), HTTP_404_NOT_FOUND

    return jsonify({
            'id' : note.id,
            'title' : note.title,
            'content' : note.content,
            'created_at' : note.created_at,
            'updated_at' : note.updated_at

    }), HTTP_200_OK

@notes.route("/<int:id>/", methods =['PUT', 'POST'])
@jwt_required()
def noteUpdate(id):
    if request.method == "PUT" or "POST":
        title = request.json.get("title")
        content = request.json.get("content")
        userId = get_jwt_identity()
        note = Notes.query.filter_by(user_id=userId, id=id).first()
        if note.title == title and note.content == content:
            return jsonify({"error" : "title and content are the same as before"}), HTTP_400_BAD_REQUEST
        
        if title == "" and content == "":
            return jsonify({"error" : "title and the content must not be empty"}), HTTP_400_BAD_REQUEST

        if title.isspace() == True and content.isspace() == True:
            return jsonify({"error" : "title and content must not contain only whitespaces"}), HTTP_400_BAD_REQUEST
        

        note.title = title
        note.content = content

        db.session.commit()

        return jsonify({
            'id' : note.id,
            'title' : note.title,
            'content' : note.content,
            'created_at' : note.created_at,
            'updated_at' : note.updated_at
        }), HTTP_200_OK

@notes.route("/<int:id>/", methods = ['DELETE'])
@jwt_required()
def deleteNote(id):
    userId = get_jwt_identity()
    
    note =  Notes.query.filter_by(user_id=userId, id=id).first()
    if not note:
        return jsonify({"message" : "item not found" }), HTTP_404_NOT_FOUND

    db.session.delete(note)
    db.session.commit()
    return jsonify({}), HTTP_204_NO_CONTENT
