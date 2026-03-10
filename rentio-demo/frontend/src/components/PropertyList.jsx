import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import PropertyCard from "./PropertyCard";
import ReservationModal from "./ReservationModal";

const CITIES = ["Všetky mestá", "Praha", "Brno", "Krkonoše", "Split"];

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (city) params.city = city;
      if (guests) params.guests = guests;
      const res = await api.get("/properties", { params });
      setProperties(res.data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [city, guests]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  return (
    <section>
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mesto</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value === "Všetky mestá" ? "" : e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CITIES.map((c) => (
              <option key={c} value={c === "Všetky mestá" ? "" : c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hostia</label>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Počet"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          onClick={fetchProperties}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Hľadať
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg">Žiadne nehnuteľnosti nenájdené</p>
          <p className="text-sm mt-1">Skúste zmeniť filtre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} onBook={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <ReservationModal
          property={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
