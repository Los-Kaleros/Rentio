export default function PropertyCard({ property, onBook }) {
  const { title, city, price_per_night, max_guests, description } = property;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-5xl">
        🏠
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{title}</h3>
          <span className="shrink-0 text-sm font-bold text-primary-600 whitespace-nowrap">
            {price_per_night} €<span className="text-gray-400 font-normal">/noc</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <span>📍</span>
          <span>{city}</span>
          <span className="mx-1">·</span>
          <span>👥 max {max_guests} hostí</span>
        </div>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>
        )}

        <button
          onClick={() => onBook(property)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Rezervovať
        </button>
      </div>
    </div>
  );
}
