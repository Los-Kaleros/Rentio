import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const STATUS_LABELS = {
  pending: { label: "Čaká na platbu", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Potvrdená", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Zrušená", color: "bg-gray-100 text-gray-500" },
};

function ReservationRow({ res, onCancel }) {
  const s = STATUS_LABELS[res.status] ?? STATUS_LABELS.cancelled;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900 text-sm">{res.property_title ?? `Nehnuteľnosť #${res.property_id}`}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {res.date_from} → {res.date_to} · {res.total_price} €
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
        {res.status === "pending" && (
          <button
            onClick={() => onCancel(res.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Zrušiť
          </button>
        )}
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/bookings-over-time")
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />;
  if (!data || !data.length) return (
    <p className="text-sm text-gray-400 text-center py-8">Zatiaľ žiadne analytické dáta.</p>
  );

  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">Rezervácie za posledné týždne (TimescaleDB time_bucket)</p>
      <div className="flex items-end gap-2 h-32">
        {data.slice(-12).map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{d.count}</span>
            <div
              className="w-full bg-primary-400 rounded-t"
              style={{ height: `${Math.round((d.count / max) * 80)}px`, minHeight: "4px" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    api.get("/users/me/reservations")
      .then((r) => setReservations(r.data))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const cancelReservation = async (id) => {
    try {
      await api.post(`/reservations/${id}/cancel`);
      setReservations((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r)
      );
    } catch (err) {
      alert(err.response?.data?.error || "Nepodarilo sa zrušiť rezerváciu.");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Vitajte, <strong>{user.name}</strong> · rola: <span className="capitalize">{user.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Moje rezervácie</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Zatiaľ žiadne rezervácie.{" "}
              <a href="/" className="text-primary-600 hover:underline">Prezrieť nehnuteľnosti →</a>
            </p>
          ) : (
            <div>
              {reservations.map((r) => (
                <ReservationRow key={r.id} res={r} onCancel={cancelReservation} />
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Štatistiky</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Celkom rezervácií</span>
                <span className="font-medium">{reservations.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Potvrdených</span>
                <span className="font-medium text-green-600">
                  {reservations.filter((r) => r.status === "confirmed").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Čakajúcich</span>
                <span className="font-medium text-yellow-600">
                  {reservations.filter((r) => r.status === "pending").length}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics (admin/owner only) */}
          {(user.role === "admin" || user.role === "owner") && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Analytika rezervácií</h2>
              <AnalyticsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
