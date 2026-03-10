from app import db


class Review(db.Model):
    __tablename__ = "reviews"

    id             = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey("reservations.id"), unique=True, nullable=False)
    author_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating         = db.Column(db.SmallInteger, nullable=False)
    text           = db.Column(db.Text)
    created_at     = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    def to_dict(self):
        return {
            "id":             self.id,
            "reservation_id": self.reservation_id,
            "author_id":      self.author_id,
            "rating":         self.rating,
            "text":           self.text,
            "created_at":     self.created_at.isoformat() if self.created_at else None,
        }
