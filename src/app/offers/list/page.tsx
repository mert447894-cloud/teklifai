"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

type Offer = {
  id: number;
  title: string;
  total: number;
  created_at: string;
  customers: {
    name: string;
    company: string;
  } | null;
};

export default function OffersListPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("offers")
      .select(`
        id,
        title,
        total,
        created_at,
        customers (
          name,
          company
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setOffers((data as Offer[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 bg-gray-100 min-h-screen p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600">
              Teklifler
            </h1>

            <Link
              href="/offers"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
            >
              + Yeni Teklif
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left">Müşteri</th>
                  <th className="p-4 text-left">Firma</th>
                  <th className="p-4 text-left">Başlık</th>
                  <th className="p-4 text-right">Toplam</th>
                  <th className="p-4 text-center">Tarih</th>
                  <th className="p-4 text-center">İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      Yükleniyor...
                    </td>
                  </tr>
                )}

                {!loading && offers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      Henüz teklif bulunmuyor.
                    </td>
                  </tr>
                )}

                {!loading &&
                  offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        {offer.customers?.name}
                      </td>

                      <td className="p-4">
                        {offer.customers?.company}
                      </td>

                      <td className="p-4">
                        {offer.title}
                      </td>

                      <td className="p-4 text-right font-semibold">
                        ₺{Number(offer.total).toLocaleString("tr-TR")}
                      </td>

                      <td className="p-4 text-center">
                        {new Date(
                          offer.created_at
                        ).toLocaleDateString("tr-TR")}
                      </td>

                      <td className="p-4 text-center">
                        <Link
                          href={`/offers/${offer.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Gör
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}