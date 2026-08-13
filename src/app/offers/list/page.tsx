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
  const [errorMessage, setErrorMessage] = useState("");

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("offers")
      .select(
        `
        id,
        title,
        total,
        created_at,
        customers (
          name,
          company
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Teklifler yüklenirken hata:", error);

      setErrorMessage(error.message);
      setOffers([]);
      setLoading(false);
      return;
    }

    console.log("Yüklenen teklifler:", data);

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
            <div>
              <h1 className="text-4xl font-bold text-blue-600">
                Teklifler
              </h1>

              <p className="text-gray-500 mt-2">
                Oluşturduğunuz tüm teklifler burada görünür.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadOffers}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg"
              >
                ↻ Yenile
              </button>

              <Link
                href="/offers"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
              >
                + Yeni Teklif
              </Link>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-red-100 border border-red-300 text-red-700 rounded-lg p-4">
              <strong>Teklifler yüklenemedi.</strong>

              <p className="mt-1">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-4 text-left">
                      Müşteri
                    </th>

                    <th className="p-4 text-left">
                      Firma
                    </th>

                    <th className="p-4 text-left">
                      Başlık
                    </th>

                    <th className="p-4 text-right">
                      Toplam
                    </th>

                    <th className="p-4 text-center">
                      Tarih
                    </th>

                    <th className="p-4 text-center">
                      İşlemler
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center p-10 text-gray-500"
                      >
                        Teklifler yükleniyor...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !errorMessage &&
                    offers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-10"
                        >
                          <div className="text-gray-500">
                            <div className="text-4xl mb-3">
                              📄
                            </div>

                            <p className="font-semibold">
                              Henüz teklif bulunmuyor.
                            </p>

                            <p className="text-sm mt-1">
                              İlk teklifinizi oluşturmak için
                              aşağıdaki butonu kullanabilirsiniz.
                            </p>

                            <Link
                              href="/offers"
                              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                            >
                              + Yeni Teklif Oluştur
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    !errorMessage &&
                    offers.map((offer) => (
                      <tr
                        key={offer.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-4">
                          {offer.customers?.name || "-"}
                        </td>

                        <td className="p-4">
                          {offer.customers?.company || "-"}
                        </td>

                        <td className="p-4 font-medium">
                          {offer.title || "Başlıksız Teklif"}
                        </td>

                        <td className="p-4 text-right font-semibold">
                          ₺
                          {Number(
                            offer.total
                          ).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        <td className="p-4 text-center">
                          {offer.created_at
                            ? new Date(
                                offer.created_at
                              ).toLocaleDateString("tr-TR")
                            : "-"}
                        </td>

                        <td className="p-4 text-center">
                          <Link
                            href={`/offers/${offer.id}`}
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                          >
                            Görüntüle
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && !errorMessage && offers.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Toplam{" "}
              <strong>{offers.length}</strong>{" "}
              teklif bulundu.
            </div>
          )}
        </main>
      </div>
    </>
  );
}