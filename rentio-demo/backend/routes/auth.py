import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db
from models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name     = data.get("name", "").strip()
    role     = data.get("role", "guest")

    if not email or not password or not name:
        return jsonify({"error": "Chýbajú povinné polia.", "code": "MISSING_FIELDS"}), 400

    if role not in ("guest", "owner"):
        return jsonify({"error": "Neplatná rola.", "code": "INVALID_ROLE"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "E-mail je už registrovaný.", "code": "EMAIL_EXISTS"}), 409

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, password_hash=pw_hash, name=name, role=role)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Neplatné prihlasovacie údaje.", "code": "INVALID_CREDENTIALS"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Užívateľ nenájdený.", "code": "NOT_FOUND"}), 404
    return jsonify(user.to_dict())
