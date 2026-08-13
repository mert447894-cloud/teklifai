"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import OfferItemsTable, {
  OfferItem,
} from "../../../components/OfferItemsTable";

type Customer = {
  id: number;
  name: string;
  company: string;
};

type ExistingOffer = {
  id: number;
  customer_id: number;
  title: string;
};

type ExistingOfferItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export default function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");

  const [items, setItems] = useState<OfferItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: customersData, error: customersError } =
      await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

    if (customersError) {
      alert(customersError.message);
      setLoading(false);
      return;
    }

    const { data: offerData, error: offerError } =
      await supabase
        .from("offers")
        .select("id, customer_id, title")
        .eq("id", id)
        .single();

    if (offerError) {
      alert(offerError.message);
      setLoading(false);
      return;
    }

    const { data: itemsData, error: itemsError } =
      await supabase
        .from("offer_items")
        .select("id, product_name, quantity, unit_price")
        .eq("offer_id", id)
        .order("id");

    if (itemsError) {
      alert(itemsError.message);
      setLoading(false);
      return;
    }

    setCustomers((customersData as Customer[]) ?? []);

    const offer = offerData as ExistingOffer;

    setCustomerId(String(offer.customer_id));
    setTitle(offer.title);

    const formattedItems: OfferItem[] = (
      (itemsData as ExistingOfferItem[]) ?? []
    ).map((item) => ({
      product: item.product_name,
      quantity: Number(item.quantity),
      price: Number(item.unit_price),
    }));

    setItems(
      formattedItems.length > 0
        ? formattedItems
        : [
            {
              product: "",
              quantity: 1,
              price: 0,
            },
          ]
    );

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const grandTotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.price || 0),
      0
    );
  }, [items]);

  async function updateOffer() {
    if (!customerId) {
      alert("Lütfen müşteri seçiniz.");
      return;
    }

    if (!title.trim()) {
      alert("Teklif başlığı giriniz.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.product.trim() !== "" &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("En az bir ürün/hizmet giriniz.");
      return;
    }

    setSaving(true);

    try {
      /*
       * 1. TEKLİFİ GÜNCELLE
       */

      const { error: offerError } = await supabase
        .from("offers")
        .update({
          customer_id: Number(customerId),
          title: title.trim(),
          total: grandTotal,
        })
        .eq("id", id);

      if (offerError) {
        throw offerError;
      }

      /*
       * 2. ESKİ KALEMLERİ SİL
       */

      const { error: deleteItemsError } =
        await supabase
          .from("offer_items")
          .delete()
          .eq("offer_id", id);

      if (deleteItemsError) {
        throw deleteItemsError;
      }

      /*
       * 3. YENİ KALEMLERİ EKLE
       */

      const rows = validItems.map((item) => ({
        offer_id: Number(id),
        product_name: item.product.trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        total_price:
          Number(item.quantity) *
          Number(item.price),
      }));

      const { error: insertItemsError } =
        await supabase
          .from("offer_items")
          .insert(rows);

      if (insertItemsError) {
        throw insertItemsError;
      }

      alert("✅ Teklif başarıyla güncellendi.");

      router.push(`/offers/${id}`);
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Teklif güncellenirken bir hata oluştu."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex">
          <Sidebar />

          <main className="flex-1 bg-gray-100 min-h-screen p-8">
            <h1 className="text-3xl font-bold text-blue-600">
              Teklif yükleniyor...
            </h1>
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
                Teklifi Düzenle
              </h1>

              <p className="text-gray-500 mt-2">
                Teklif No: #{id}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`/offers/${id}`)
              }
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg"
            >
              ← Teklife Dön
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-8 max-w-6xl">
            {/* MÜŞTERİ */}

            <div className="mb-6">
              <label className="block font-semibold mb-2">
                Müşteri
              </label>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              >
                <option value="">
                  Müşteri Seçiniz
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                    {customer.company
                      ? ` - ${customer.company}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* BAŞLIK */}

            <div className="mb-8">
              <label className="block font-semibold mb-2">
                Teklif Başlığı
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Örn: Villa Elektrik Tesisatı"
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ÜRÜNLER */}

            <OfferItemsTable
              items={items}
              setItems={setItems}
            />

            {/* TOPLAM */}

            <div className="mt-8 flex justify-end">
              <div className="text-3xl font-bold text-blue-600">
                Genel Toplam: ₺
                {grandTotal.toLocaleString("tr-TR")}
              </div>
            </div>

            {/* BUTONLAR */}

            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={() =>
                  router.push(`/offers/${id}`)
                }
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={updateOffer}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold"
              >
                {saving
                  ? "Güncelleniyor..."
                  : "💾 Teklifi Güncelle"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}