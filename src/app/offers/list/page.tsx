"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

type Customer = {
  name: string;
  company: string;
};

type Offer = {
  id: number;
  title: string;
  total: number;
  created_at: string;
  status: string | null;
  customers: Customer[] | null;
};

const statuses = [
  "Taslak",
  "Gönderildi",
  "Onaylandı",
  "Reddedildi",
];

export default function OffersListPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(
    null
  );

  const loadOffers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("offers")
      .select(`
        id,
        title,
        total,
        created_at,
        status,
        customers (
          name,
          company
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setOffers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  async function updateStatus(
    offerId: number,
    status: string
  ) {
    setUpdatingId(offerId);

    const { error } = await supabase
      .from("offers")
      .update({
        status,
      })
      .eq("id", offerId);

    if (error) {
      alert(
        "Durum güncellenemedi: " +
          error.message
      );

      setUpdatingId(null);
      return;
    }

    setOffers((currentOffers) =>
      currentOffers.map((offer) =>
        offer.id === offerId
          ? {
              ...offer,
              status,
            }
          : offer
      )
    );

    setUpdatingId(null);
  }

  function getStatusClass(
    status: string | null
  ) {
    switch (status) {
      case "Gönderildi":
        return "bg-yellow-100 text-yellow-700";

      case "Onaylandı":
        return "bg-green-100 text-green-700";

      case "Reddedildi":
        return "bg-red-100 text-red-700";

      case "Taslak":
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getCustomer(
    customers: Customer[] | null
  ) {
    return customers?.[0] ?? null;
  }

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
                      Durum
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
                        colSpan={7}
                        className="text-center p-8"
                      >
                        Yükleniyor...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    offers.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center p-8 text-gray-500"
                        >
                          Henüz teklif bulunmuyor.
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    offers.map((offer) => {
                      const customer =
                        getCustomer(
                          offer.customers
                        );

                      const currentStatus =
                        offer.status ||
                        "Taslak";

                      return (
                        <tr
                          key={offer.id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="p-4">
                            {customer?.name ||
                              "-"}
                          </td>

                          <td className="p-4">
                            {customer?.company ||
                              "-"}
                          </td>

                          <td className="p-4">
                            {offer.title}
                          </td>

                          <td className="p-4 text-right font-semibold">
                            ₺
                            {Number(
                              offer.total
                            ).toLocaleString(
                              "tr-TR"
                            )}
                          </td>

                          <td className="p-4 text-center">
                            {new Date(
                              offer.created_at
                            ).toLocaleDateString(
                              "tr-TR"
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <select
                              value={currentStatus}
                              disabled={
                                updatingId ===
                                offer.id
                              }
                              onChange={(e) =>
                                updateStatus(
                                  offer.id,
                                  e.target.value
                                )
                              }
                              className={`px-3 py-2 rounded-lg font-semibold border-0 cursor-pointer ${getStatusClass(
                                currentStatus
                              )}`}
                            >
                              {statuses.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>
                                )
                              )}
                            </select>
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
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}