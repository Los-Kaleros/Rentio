from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_

from app import db
from models.property import Property
from models.reservation import Reservation

properties_bp = Blueprint("properties", __name__)


@properties_bp.get("")
def list_properties():
    """Zoznam nehnuteľností s voliteľnými filtrami."""
    city      = request.args.get("city")
    guests    = request.args.get("guests", type=int)
    date_from = request.args.get("date_from")
    date_to   = request.args.get("date_to")

    query = Property.query.filter_by(status="active")

    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if guests:
        query = query.filter(Property.max_guests >= guests)

    # Vylúčiť nehnuteľnosti s potvrdenou/aktívnou pending rezerváciou v danom termíne
    if date_from and date_to:
        conflicting = db.session.query(Reservation.property_id).filter(
            Reservation.status.in_(["confirmed", "pending"]),
            Reservation.date_from < date_to,
            Reservation.date_to   > date_from,
        ).subquery()
        query = query.filter(Property.id.notin_(conflicting))

    props = query.all()
    return jsonify([p.to_dict() for p in props])


@properties_bp.get("/<int:property_id>")
def get_property(property_id):
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({"error": "Nehnuteľnosť nenájdená.", "code": "NOT_FOUND"}), 404
    return jsonify(prop.to_dict())


@properties_bp.post("")
@jwt_required()
def create_property():
    user_id = int(get_jwt_identity())
    data    = request.get_json()

    required = ("title", "city", "price_per_night", "max_guests")
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Chýbajú povinné polia.", "code": "MISSING_FIELDS"}), 400

    prop = Property(
        owner_id        = user_id,
        title           = data["title"],
        description     = data.get("description"),
        city            = data["city"],
        address         = data.get("address"),
        price_per_night = data["price_per_night"],
        max_guests      = data["max_guests"],
    )
    db.session.add(prop)
    db.session.commit()
    return jsonify(prop.to_dict()), 201


@properties_bp.get("/<int:property_id>/availability")
def availability(property_id):
    """Vráti zoznam blokovaných termínov pre daný mesiac."""
    month = request.args.get("month")  # formát: YYYY-MM

    query = Reservation.query.filter(
        Reservation.property_id == property_id,
        Reservation.status.in_(["confirmed", "pending"]),
    )
    if month:
        query = query.filter(
            db.func.to_char(Reservation.date_from, "YYYY-MM") == month
        )

    blocked = [
        {"from": r.date_from.isoformat(), "to": r.date_to.isoformat(), "status": r.status}
        for r in query.all()
    ]
    return jsonify({"blocked": blocked})
