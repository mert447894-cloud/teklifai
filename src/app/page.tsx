"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "./lib/supabase";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

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

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    const { data: offersData, error: offersError } =
      await supabase
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

    if (offersError) {
      alert(
        "Teklifler yüklenemedi: " +
          offersError.message
      );

      setLoading(false);
      return;
    }

    const { count, error: customerError } =
      await supabase
        .from("customers")
        .select("*", {
          count: "exact",
          head: true,
        });

    if (customerError) {
      alert(
        "Müşteriler yüklenemedi: " +
          customerError.message
      );

      setLoading(false);
      return;
    }

    setOffers(offersData ?? []);
    setCustomerCount(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalOffers = offers.length;

  const totalAmount = offers.reduce(
    (sum, offer) =>
      sum + Number(offer.total || 0),
    0
  );

  const sentOffers = offers.filter(
    (offer) => offer.status === "Gönderildi"
  ).length;

  const approvedOffers = offers.filter(
    (offer) => offer.status === "Onaylandı"
  ).length;

  const rejectedOffers = offers.filter(
    (offer) => offer.status === "Reddedildi"
  ).length;

  const draftOffers = offers.filter(
    (offer) =>
      !offer.status ||
      offer.status === "Taslak"
  ).length;

  const recentOffers = offers.slice(0, 5);

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
            <div>
              <h1 className="text-4xl font-bold text-blue-600">
                Dashboard
              </h1>

              <p className="text-gray-500 mt-2">
                TeklifAI yönetim paneline hoş geldiniz.
              </p>
            </div>

            <Link
              href="/offers"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              + Yeni Teklif
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <p className="text-gray-500 text-lg">
                Dashboard yükleniyor...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <p className="text-gray-500 font-medium">
                    Toplam Teklif
                  </p>

                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {totalOffers}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <p className="text-gray-500 font-medium">
                    Toplam Teklif Tutarı
                  </p>

                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ₺
                    {totalAmount.toLocaleString(
                      "tr-TR"
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <p className="text-gray-500 font-medium">
                    Toplam Müşteri
                  </p>

                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {customerCount}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <p className="text-gray-500 font-medium">
                    Onaylanan
                  </p>

                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {approvedOffers}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-gray-400">
                  <p className="text-gray-500">
                    Taslak
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    {draftOffers}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-400">
                  <p className="text-gray-500">
                    Gönderildi
                  </p>

                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {sentOffers}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                  <p className="text-gray-500">
                    Onaylandı
                  </p>

                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {approvedOffers}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
                  <p className="text-gray-500">
                    Reddedildi
                  </p>

                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {rejectedOffers}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow mt-8 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-2xl font-bold">
                    Son Teklifler
                  </h2>

                  <Link
                    href="/offers/list"
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Tümünü Gör →
                  </Link>
                </div>

                {recentOffers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Henüz teklif oluşturulmamış.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-4 text-left">
                            Müşteri
                          </th>

                          <th className="p-4 text-left">
                            Teklif
                          </th>

                          <th className="p-4 text-right">
                            Tutar
                          </th>

                          <th className="p-4 text-center">
                            Durum
                          </th>

                          <th className="p-4 text-center">
                            İşlem
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentOffers.map(
                          (offer) => {
                            const customer =
                              getCustomer(
                                offer.customers
                              );

                            return (
                              <tr
                                key={offer.id}
                                className="border-t hover:bg-gray-50"
                              >
                                <td className="p-4">
                                  <div className="font-semibold">
                                    {customer?.name ||
                                      "-"}
                                  </div>

                                  {customer?.company && (
                                    <div className="text-sm text-gray-500">
                                      {
                                        customer.company
                                      }
                                    </div>
                                  )}
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
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                      offer.status ===
                                      "Onaylandı"
                                        ? "bg-green-100 text-green-700"
                                        : offer.status ===
                                          "Gönderildi"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : offer.status ===
                                          "Reddedildi"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {offer.status ||
                                      "Taslak"}
                                  </span>
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
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}