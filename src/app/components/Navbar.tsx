export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-blue-600">
          TeklifAI
        </h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Giriş Yap
        </button>
      </div>
    </nav>
  );
}