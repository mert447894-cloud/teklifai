"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import OfferItemsTable, {
  OfferItem,
} from "../components/OfferItemsTable";

type Customer = {
  id: number;
  name: string;
  company: string;
};

export default function OffersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");

  const [items, setItems] = useState<OfferItem[]>([
    {
      product: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const loadCustomers = useCallback(async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setCustomers(data ?? []);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const grandTotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  }, [items]);

  async function saveOffer() {
    if (!customerId) {
      alert("Lütfen müşteri seçiniz.");
      return;
    }

    if (!title.trim()) {
      alert("Teklif başlığı giriniz.");
      return;
    }

    const validItems = items.filter(
      (i) => i.product.trim() !== ""
    );

    if (validItems.length === 0) {
      alert("En az bir ürün giriniz.");
      return;
    }

    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .insert({
        customer_id: Number(customerId),
        title: title,
        total: grandTotal,
      })
      .select()
      .single();

    if (offerError) {
      alert(offerError.message);
      return;
    }

    const rows = validItems.map((item) => ({
      offer_id: offer.id,
      product_name: item.product,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.quantity * item.price,
    }));

    const { error: itemsError } = await supabase
      .from("offer_items")
      .insert(rows);

    if (itemsError) {
      alert(itemsError.message);
      return;
    }

    alert("✅ Teklif başarıyla kaydedildi.");

    setCustomerId("");
    setTitle("");

    setItems([
      {
        product: "",
        quantity: 1,
        price: 0,
      },
    ]);
  }

  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 bg-gray-100 min-h-screen p-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-8">
            Yeni Teklif
          </h1>

          <div className="bg-white rounded-xl shadow p-8 max-w-6xl">
            <div className="mb-6">
              <label className="block font-semibold mb-2">
                Müşteri
              </label>

              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="">Müşteri Seçiniz</option>

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

            <div className="mb-8">
              <label className="block font-semibold mb-2">
                Teklif Başlığı
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Villa Elektrik Tesisatı"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <OfferItemsTable
              items={items}
              setItems={setItems}
            />

            <div className="mt-8 flex justify-end">
              <div className="text-3xl font-bold text-blue-600">
                Genel Toplam: ₺
                {grandTotal.toLocaleString("tr-TR")}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={saveOffer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Teklifi Kaydet
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}