import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 bg-gray-100 min-h-screen p-8">
          <h1 className="text-4xl font-bold text-blue-600">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Hoş geldin Mert 👋
          </p>

          <div className="grid grid-cols-3 gap-6 mt-10">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">
              <h2 className="font-bold">👥 Müşteriler</h2>
              <p className="text-3xl mt-2">0</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">
              <h2 className="font-bold">📄 Teklifler</h2>
              <p className="text-3xl mt-2">0</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">
              <h2 className="font-bold">💰 Gelir</h2>
              <p className="text-3xl mt-2">₺0</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}