from app import db


class Property(db.Model):
    __tablename__ = "properties"

    id              = db.Column(db.Integer, primary_key=True)
    owner_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title           = db.Column(db.String(200), nullable=False)
    description     = db.Column(db.Text)
    city            = db.Column(db.String(100), nullable=False)
    address         = db.Column(db.String(255))
    price_per_night = db.Column(db.Numeric(10, 2), nullable=False)
    max_guests      = db.Column(db.SmallInteger, nullable=False)
    status          = db.Column(db.String(20), nullable=False, default="active")
    created_at      = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    reservations = db.relationship("Reservation", backref="property", lazy="dynamic")

    def to_dict(self):
        return {
            "id":              self.id,
            "owner_id":        self.owner_id,
            "title":           self.title,
            "description":     self.description,
            "city":            self.city,
            "address":         self.address,
            "price_per_night": float(self.price_per_night),
            "max_guests":      self.max_guests,
            "status":          self.status,
            "created_at":      self.created_at.isoformat() if self.created_at else None,
        }
