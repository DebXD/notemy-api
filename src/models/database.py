from ..extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.LargeBinary, nullable=False)
    enc_key = db.Column(db.LargeBinary, unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=True)
    user_notes = db.relationship("Notes", backref="user")

    def __repr__(self) -> str:
        return f"USER =>> {self.username}"

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)


class Notes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.LargeBinary, nullable=True)
    content = db.Column(db.LargeBinary, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    def __repr__(self) -> str:
        return f"Notes : {self.id, self.title, self.content}"

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
