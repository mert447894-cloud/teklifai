"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";
import { generateOfferPdf } from "../../lib/pdf";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

type Offer = {
  id: number;
  title: string;
  total: number;
  created_at: string;
  customer_id: number;

  offer_no?: string | null;
  valid_until?: string | null;
  vat_rate?: number | null;
  notes?: string | null;

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
  unit: string;
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

  function handleGeneratePdf() {
    if (!offer) {
      return;
    }

    generateOfferPdf({
      offerNo: offer.offer_no ?? `TKF-${offer.id}`,
      title: offer.title,
      createdAt: offer.created_at,
      validUntil: offer.valid_until ?? null,
      vatRate: Number(offer.vat_rate ?? 0),
      notes: offer.notes ?? "",

      customerName: offer.customers?.name ?? "",
      company: offer.customers?.company ?? "",
      phone: offer.customers?.phone ?? "",
      email: offer.customers?.email ?? "",

      items: items.map((item) => ({
        product: item.product_name,
        unit: item.unit ?? "Adet",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        total: Number(item.total_price),
      })),

      grandTotal: Number(offer.total),
    });
  }

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
                {new Date(
                  offer.created_at
                ).toLocaleDateString("tr-TR")}
              </p>

              {offer.offer_no && (
                <p className="text-gray-500 mt-1">
                  Teklif No:{" "}
                  <strong>{offer.offer_no}</strong>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGeneratePdf}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold"
              >
                📄 PDF Oluştur
              </button>

              <Link
                href="/offers/list"
                className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg"
              >
                ← Teklif Listesi
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Müşteri Bilgileri
                </h2>

                <p>
                  <strong>Ad:</strong>{" "}
                  {offer.customers?.name || "-"}
                </p>

                <p>
                  <strong>Firma:</strong>{" "}
                  {offer.customers?.company || "-"}
                </p>

                <p>
                  <strong>Telefon:</strong>{" "}
                  {offer.customers?.phone || "-"}
                </p>

                <p>
                  <strong>E-posta:</strong>{" "}
                  {offer.customers?.email || "-"}
                </p>
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold mb-4">
                  Genel Toplam
                </h2>

                <div className="text-4xl font-bold text-blue-600">
                  ₺
                  {Number(
                    offer.total
                  ).toLocaleString("tr-TR")}
                </div>

                {offer.vat_rate !== null &&
                  offer.vat_rate !== undefined && (
                    <p className="text-gray-500 mt-2">
                      KDV: %{Number(offer.vat_rate)}
                    </p>
                  )}

                {offer.valid_until && (
                  <p className="text-gray-500 mt-1">
                    Geçerlilik:{" "}
                    {new Date(
                      offer.valid_until
                    ).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left">
                      Ürün / Hizmet
                    </th>

                    <th className="p-3 text-center">
                      Birim
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
                        {item.unit || "Adet"}
                      </td>

                      <td className="p-3 text-center">
                        {item.quantity}
                      </td>

                      <td className="p-3 text-center">
                        ₺
                        {Number(
                          item.unit_price
                        ).toLocaleString("tr-TR")}
                      </td>

                      <td className="p-3 text-center font-semibold">
                        ₺
                        {Number(
                          item.total_price
                        ).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-gray-500"
                      >
                        Bu teklifte henüz kalem bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {offer.notes && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-bold mb-2">
                  Notlar
                </h2>

                <p className="text-gray-700 whitespace-pre-wrap">
                  {offer.notes}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}