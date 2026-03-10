import PropertyList from "../components/PropertyList";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Nájdite si ideálne<br />
          <span className="text-primary-600">krátkodobé ubytovanie</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Stovky nehnuteľností v najlepších destinaciách. Rezervujte rýchlo, bezpečne a bez poplatkov.
        </p>
      </div>

      <PropertyList />
    </div>
  );
}
