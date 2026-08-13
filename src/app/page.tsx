import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
          <h1 className="text-3xl font-bold text-center text-blue-600">
            TeklifAI
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Yapay zekâ destekli teklif oluşturma sistemi
          </p>

          <Link
            href="/offers/list"
            className="block w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-center"
          >
            Başlayalım
          </Link>
        </div>
      </main>
    </>
  );
}