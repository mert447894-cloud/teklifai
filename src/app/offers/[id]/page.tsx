"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

type Offer = {
  id: number;
  title: string;
  total: number;
  created_at: string;
  customer_id: number;
  customers: {
    name: string;
    company: string;
    phone: string;
    email: string;
  } | null;
};

type OfferItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffer = useCallback(async () => {
    setLoading(true);

    const { data: offerData, error: offerError } = await supabase
      .from("offers")
      .select(
        `
        *,
        customers (
          name,
          company,
          phone,
          email
        )
      `
      )
      .eq("id", id)
      .single();

    if (offerError) {
      alert(offerError.message);
      setLoading(false);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("offer_items")
      .select("*")
      .eq("offer_id", id)
      .order("id");

    if (itemError) {
      alert(itemError.message);
      setLoading(false);
      return;
    }

    setOffer(offerData as Offer);
    setItems((itemData as OfferItem[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-10">
            <h2 className="text-2xl font-bold">
              Yükleniyor...
            </h2>
          </main>
        </div>
      </>
    );
  }

  if (!offer) {
    return (
      <>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-10">
            <h2 className="text-2xl font-bold text-red-600">
              Teklif bulunamadı.
            </h2>

            <Link
              href="/offers/list"
              className="inline-block mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              ← Tekliflere Dön
            </Link>
          </main>
        </div>
      </>
    );
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
                {offer.title}
              </h1>

              <p className="text-gray-500 mt-2">
                {new Date(offer.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>

            <Link
              href="/offers/list"
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg"
            >
              ← Teklif Listesi
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow p-8">

            <div className="grid grid-cols-2 gap-8 mb-10">

              <div>
                <h2 className="text-xl font-bold mb-4">
                  Müşteri Bilgileri
                </h2>

                <p>
                  <strong>Ad:</strong>{" "}
                  {offer.customers?.name}
                </p>

                <p>
                  <strong>Firma:</strong>{" "}
                  {offer.customers?.company}
                </p>

                <p>
                  <strong>Telefon:</strong>{" "}
                  {offer.customers?.phone}
                </p>

                <p>
                  <strong>E-posta:</strong>{" "}
                  {offer.customers?.email}
                </p>
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold mb-4">
                  Genel Toplam
                </h2>

                <div className="text-4xl font-bold text-blue-600">
                  ₺{Number(offer.total).toLocaleString("tr-TR")}
                </div>
              </div>

            </div>

            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">
                    Ürün / Hizmet
                  </th>

                  <th className="p-3 text-center">
                    Miktar
                  </th>

                  <th className="p-3 text-center">
                    Birim Fiyat
                  </th>

                  <th className="p-3 text-center">
                    Toplam
                  </th>
                </tr>
              </thead>

              <tbody>

                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="p-3">
                      {item.product_name}
                    </td>

                    <td className="p-3 text-center">
                      {item.quantity}
                    </td>

                    <td className="p-3 text-center">
                      ₺
                      {Number(item.unit_price).toLocaleString("tr-TR")}
                    </td>

                    <td className="p-3 text-center font-semibold">
                      ₺
                      {Number(item.total_price).toLocaleString("tr-TR")}
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