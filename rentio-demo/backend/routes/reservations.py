from datetime import date, datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select

from app import db
from models.reservation import Reservation
from models.property import Property
from models.booking_event import BookingEvent

reservations_bp = Blueprint("reservations", __name__)

PENDING_TIMEOUT_MINUTES = 15


def _has_conflict(property_id, date_from, date_to, exclude_id=None):
    """Skontroluje kolíziu termínov — volaná v transakcii so zámkom."""
    q = Reservation.query.filter(
        Reservation.property_id == property_id,
        Reservation.status.in_(["confirmed", "pending"]),
        Reservation.date_from < date_to,
        Reservation.date_to   > date_from,
    )
    if exclude_id:
        q = q.filter(Reservation.id != exclude_id)
    return q.with_for_update().first() is not None


@reservations_bp.post("")
@jwt_required()
def create_reservation():
    """
    Vytvorí rezerváciu so stavom Pending a zamkne termín na 15 minút.
    Kritické: beží v ACID transakcii s pesimistickým zamknutím (SELECT FOR UPDATE).
    """
    user_id = int(get_jwt_identity())
    data    = request.get_json()

    property_id = data.get("property_id")
    date_from   = data.get("date_from")
    date_to     = data.get("date_to")

    if not all([property_id, date_from, date_to]):
        return jsonify({"error": "Chýbajú povinné polia.", "code": "MISSING_FIELDS"}), 400

    try:
        date_from_d = date.fromisoformat(date_from)
        date_to_d   = date.fromisoformat(date_to)
    except ValueError:
        return jsonify({"error": "Neplatný formát dátumu (YYYY-MM-DD).", "code": "INVALID_DATE"}), 400

    if date_from_d >= date_to_d:
        return jsonify({"error": "date_to musí byť po date_from.", "code": "INVALID_RANGE"}), 400

    prop = db.session.get(Property, property_id)
    if not prop or prop.status != "active":
        return jsonify({"error": "Nehnuteľnosť nie je dostupná.", "code": "NOT_AVAILABLE"}), 404

    # ACID transakcia — zamkneme riadky pred kontrolou kolízie
    with db.session.begin_nested():
        if _has_conflict(property_id, date_from_d, date_to_d):
            return jsonify({"error": "Termín je obsadený.", "code": "DATE_CONFLICT"}), 409

        nights      = (date_to_d - date_from_d).days
        total_price = float(prop.price_per_night) * nights
        expires_at  = datetime.now(timezone.utc) + timedelta(minutes=PENDING_TIMEOUT_MINUTES)

        reservation = Reservation(
            guest_id    = user_id,
            property_id = property_id,
            date_from   = date_from_d,
            date_to     = date_to_d,
            total_price = total_price,
            status      = "pending",
            expires_at  = expires_at,
        )
        db.session.add(reservation)
        db.session.flush()

        # Zápis do TimescaleDB hypertable
        db.session.add(BookingEvent(
            event_time     = datetime.now(timezone.utc),
            event_type     = "reservation_created",
            reservation_id = reservation.id,
            property_id    = property_id,
            guest_id       = user_id,
            amount         = total_price,
        ))

    db.session.commit()
    return jsonify(reservation.to_dict()), 201


@reservations_bp.post("/<int:reservation_id>/confirm")
@jwt_required()
def confirm_reservation(reservation_id):
    """Potvrdenie rezervácie po úspešnej platbe (mock)."""
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation:
        return jsonify({"error": "Rezervácia nenájdená.", "code": "NOT_FOUND"}), 404

    if reservation.status != "pending":
        return jsonify({"error": "Rezervácia nie je v stave Pending.", "code": "INVALID_STATE"}), 400

    reservation.status = "confirmed"
    reservation.expires_at = None

    db.session.add(BookingEvent(
        event_time     = datetime.now(timezone.utc),
        event_type     = "confirmed",
        reservation_id = reservation.id,
        property_id    = reservation.property_id,
        guest_id       = reservation.guest_id,
        amount         = reservation.total_price,
    ))
    db.session.commit()
    return jsonify(reservation.to_dict())


@reservations_bp.post("/<int:reservation_id>/cancel")
@jwt_required()
def cancel_reservation(reservation_id):
    reservation = db.session.get(Reservation, reservation_id)
    if not reservation:
        return jsonify({"error": "Rezervácia nenájdená.", "code": "NOT_FOUND"}), 404

    if reservation.status == "cancelled":
        return jsonify({"error": "Rezervácia je už zrušená.", "code": "ALREADY_CANCELLED"}), 400

    reservation.status = "cancelled"

    db.session.add(BookingEvent(
        event_time     = datetime.now(timezone.utc),
        event_type     = "cancelled",
        reservation_id = reservation.id,
        property_id    = reservation.property_id,
        guest_id       = reservation.guest_id,
        amount         = reservation.total_price,
    ))
    db.session.commit()
    return jsonify(reservation.to_dict())


@reservations_bp.get("/my")
@jwt_required()
def my_reservations():
    user_id = int(get_jwt_identity())
    reservations = Reservation.query.filter_by(guest_id=user_id).order_by(
        Reservation.created_at.desc()
    ).all()
    return jsonify([r.to_dict() for r in reservations])
