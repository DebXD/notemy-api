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
        notes = Notes.query.filter_by(user_id=userId)
        data = []
        for note in notes:
            data.append({
                'id' : note.id,
                'title' : note.title,
                'content' : note.content,
                'created_at' : note.created_at,
                'updated_at' : note.updated_at
            })
        return jsonify({'data' : data}), HTTP_200_OK
