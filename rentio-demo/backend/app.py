from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=[app.config["FRONTEND_URL"]], supports_credentials=True)

    # Registrácia blueprintov
    from routes.auth import auth_bp
    from routes.properties import properties_bp
    from routes.reservations import reservations_bp
    from routes.analytics import analytics_bp

    app.register_blueprint(auth_bp,         url_prefix="/api/auth")
    app.register_blueprint(properties_bp,   url_prefix="/api/properties")
    app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
    app.register_blueprint(analytics_bp,    url_prefix="/api/analytics")

    # CLI príkaz: flask seed
    @app.cli.command("seed")
    def seed():
        """Naplní databázu demo dátami."""
        import bcrypt
        from models.user import User
        from models.property import Property

        if User.query.count() > 0:
            print("Databáza už obsahuje dáta, seed preskočený.")
            return

        password_hash = bcrypt.hashpw(b"demo1234", bcrypt.gensalt()).decode()

        users = [
            User(email="host@rentio.demo",  password_hash=password_hash, name="Jana Horáčková", role="guest"),
            User(email="owner@rentio.demo", password_hash=password_hash, name="Peter Novák",    role="owner"),
            User(email="admin@rentio.demo", password_hash=password_hash, name="Admin Rentio",   role="admin"),
        ]
        db.session.add_all(users)
        db.session.flush()

        owner = users[1]
        properties = [
            Property(owner_id=owner.id, title="Útulný apartmán v centre Prahy",
                     description="Krásny 2-izbový apartmán priamo na Starometskom námestí.",
                     city="Praha", address="Staroměstské náměstí 12",
                     price_per_night=2800.00, max_guests=4),
            Property(owner_id=owner.id, title="Moderný byt pri Václavskom námestí",
                     description="Štýlový byt po kompletnej rekonštrukcii, 5 min od metra.",
                     city="Praha", address="Václavské náměstí 54",
                     price_per_night=1950.00, max_guests=2),
            Property(owner_id=owner.id, title="Chata v Krkonoších s krbom",
                     description="Romantická horská chata pre 6 osôb. Sauna, krb, terasa.",
                     city="Špindlerův Mlýn", address="Horská 8",
                     price_per_night=4500.00, max_guests=6),
            Property(owner_id=owner.id, title="Loftový byt — Brno centrum",
                     description="Priestranný industriálny loft 80m².",
                     city="Brno", address="Náměstí Svobody 3",
                     price_per_night=2200.00, max_guests=5),
            Property(owner_id=owner.id, title="Štúdio pri mori — Chorvátsko",
                     description="Klimatizované štúdio 50m od pláže v Splite.",
                     city="Split", address="Ulica Mira 21",
                     price_per_night=3100.00, max_guests=2),
        ]
        db.session.add_all(properties)
        db.session.commit()
        print("✅ Seed dokončený: 3 užívatelia, 5 nehnuteľností.")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
