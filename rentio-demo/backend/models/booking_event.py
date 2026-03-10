from app import db


class BookingEvent(db.Model):
    """TimescaleDB hypertable — výlučne pre analytiku."""
    __tablename__ = "booking_events"

    event_time     = db.Column(db.DateTime(timezone=True), primary_key=True, nullable=False)
    event_type     = db.Column(db.String(30), nullable=False)
    reservation_id = db.Column(db.Integer)
    property_id    = db.Column(db.Integer)
    guest_id       = db.Column(db.Integer)
    amount         = db.Column(db.Numeric(10, 2))
    metadata       = db.Column(db.JSON)
