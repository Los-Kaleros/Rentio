from app import db


class Reservation(db.Model):
    __tablename__ = "reservations"

    id          = db.Column(db.Integer, primary_key=True)
    guest_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id"), nullable=False)
    date_from   = db.Column(db.Date, nullable=False)
    date_to     = db.Column(db.Date, nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    status      = db.Column(db.String(20), nullable=False, default="pending")
    expires_at  = db.Column(db.DateTime(timezone=True))
    created_at  = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    def to_dict(self):
        return {
            "id":          self.id,
            "guest_id":    self.guest_id,
            "property_id": self.property_id,
            "date_from":   self.date_from.isoformat(),
            "date_to":     self.date_to.isoformat(),
            "total_price": float(self.total_price),
            "status":      self.status,
            "expires_at":  self.expires_at.isoformat() if self.expires_at else None,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
        }
