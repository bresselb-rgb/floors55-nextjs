import FilterManager from "../../../components/FilterManager";

// Tell Google to completely ignore this hidden admin page
export const metadata = {
  title: 'Filter Admin | Floors 55',
  robots: 'noindex, nofollow' 
};

export default function AdminFiltersPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex-1">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">System Admin</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Global Filtering Configuration</p>
      </div>
      
      {/* This loads the interactive dashboard component you just created */}
      <FilterManager />
      
    </main>
  );
}