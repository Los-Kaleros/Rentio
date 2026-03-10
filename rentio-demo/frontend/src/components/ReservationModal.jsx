import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const STEPS = ["Termín", "Platba", "Potvrdenie"];

function diffDays(from, to) {
  const a = new Date(from), b = new Date(to);
  return Math.max(0, Math.round((b - a) / 86400000));
}

export default function ReservationModal({ property, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nights = diffDays(dateFrom, dateTo);
  const total = nights * property.price_per_night;
  const today = new Date().toISOString().split("T")[0];

  const handleBook = async () => {
    if (!user) { setError("Musíte byť prihlásený."); return; }
    if (nights < 1) { setError("Vyberte platný termín (min. 1 noc)."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/reservations", {
        property_id: property.id,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setReservation(res.data);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.error || "Termín je obsadený alebo nastala chyba.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (cardNum.replace(/\s/g, "").length < 12) {
      setError("Zadajte platné číslo karty.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post(`/reservations/${reservation.id}/confirm`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Platba zlyhala.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Rezervácia</h2>
            <p className="text-sm text-gray-500 mt-0.5">{property.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${i < step ? "bg-green-500 text-white" : i === step ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`ml-1.5 text-sm hidden sm:block ${i === step ? "text-primary-600 font-medium" : "text-gray-400"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-3" />}
            </div>
          ))}
        </div>

        {/* Step 0 — Date selection */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dátum príchodu</label>
                <input
                  type="date"
                  min={today}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dátum odchodu</label>
                <input
                  type="date"
                  min={dateFrom || today}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="bg-primary-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-gray-700">{nights} nocí × {property.price_per_night} €</span>
                <span className="font-bold text-primary-700 text-lg">{total} €</span>
              </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handleBook}
              disabled={loading || !dateFrom || !dateTo}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Overujem dostupnosť..." : "Zablokovať termín"}
            </button>
            <p className="text-xs text-center text-gray-400">
              Termín bude dočasne zablokovaný na 15 minút počas platby.
            </p>
          </div>
        )}

        {/* Step 1 — Payment */}
        {step === 1 && reservation && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              Termín <strong>{reservation.date_from} — {reservation.date_to}</strong> bol úspešne zablokovaný.
              Rezervácia expiruje o 15 minút.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Číslo karty</label>
              <input
                type="text"
                maxLength="19"
                value={cardNum}
                onChange={(e) => setCardNum(e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim())}
                placeholder="1234 5678 9012 3456"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex justify-between">
              <span className="text-sm text-gray-600">Celková suma</span>
              <span className="font-bold text-gray-900">{reservation.total_price} €</span>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Spracovávam platbu..." : `Zaplatiť ${reservation.total_price} €`}
            </button>
            <p className="text-xs text-center text-gray-400">
              Demo platba — žiadne reálne transakcie
            </p>
          </div>
        )}

        {/* Step 2 — Confirmation */}
        {step === 2 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-900">Rezervácia potvrdená!</h3>
            <p className="text-gray-600 text-sm">
              Vaša rezervácia pre <strong>{property.title}</strong> bola úspešne zaplatená a potvrdená.
              Detaily sme odoslali na váš e-mail.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Zavrieť
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
