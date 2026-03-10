from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db
from models.booking_event import BookingEvent

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.get("/bookings-over-time")
@jwt_required()
def bookings_over_time():
    """
    TimescaleDB time_bucket query — rezervácie per týždeň.
    Vyžaduje role admin alebo owner.
    """
    rows = db.session.execute(
        db.text("""
            SELECT
                time_bucket('7 days', event_time) AS week,
                COUNT(*) FILTER (WHERE event_type = 'reservation_created') AS created,
                COUNT(*) FILTER (WHERE event_type = 'confirmed')           AS confirmed,
                COUNT(*) FILTER (WHERE event_type = 'cancelled')           AS cancelled,
                COALESCE(SUM(amount) FILTER (WHERE event_type = 'confirmed'), 0) AS revenue
            FROM booking_events
            WHERE event_time >= NOW() - INTERVAL '12 weeks'
            GROUP BY week
            ORDER BY week DESC
        """)
    ).fetchall()

    return jsonify([
        {
            "week":      row.week.isoformat(),
            "created":   row.created,
            "confirmed": row.confirmed,
            "cancelled": row.cancelled,
            "revenue":   float(row.revenue),
        }
        for row in rows
    ])


@analytics_bp.get("/occupancy/<int:property_id>")
@jwt_required()
def occupancy(property_id):
    """Vyťaženosť nehnuteľnosti po mesiacoch (posledných 6)."""
    rows = db.session.execute(
        db.text("""
            SELECT
                time_bucket('30 days', event_time) AS month,
                COUNT(*) AS bookings,
                COALESCE(SUM(amount), 0) AS revenue
            FROM booking_events
            WHERE property_id = :pid
              AND event_type   = 'confirmed'
              AND event_time  >= NOW() - INTERVAL '6 months'
            GROUP BY month
            ORDER BY month DESC
        """),
        {"pid": property_id}
    ).fetchall()

    return jsonify([
        {
            "month":    row.month.isoformat(),
            "bookings": row.bookings,
            "revenue":  float(row.revenue),
        }
        for row in rows
    ])
