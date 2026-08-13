"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function NewCustomer() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const saveCustomer = async () => {
    if (!name.trim()) {
      alert("Lütfen müşteri adını girin.");
      return;
    }

    const { error } = await supabase.from("customers").insert({
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });

    if (error) {
      alert("Hata: " + error.message);
      return;
    }

    alert("✅ Müşteri başarıyla kaydedildi!");

    setName("");
    setCompany("");
    setPhone("");
    setEmail("");
  };

  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 bg-gray-100 min-h-screen p-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-8">
            Yeni Müşteri
          </h1>

          <div className="bg-white rounded-xl shadow p-8 max-w-xl">
            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Ad Soyad
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Müşteri adı"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Firma
              </label>

              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Firma adı"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Telefon
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Telefon"
              />
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2">
                E-posta
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="E-posta"
              />
            </div>

            <button
              type="button"
              onClick={saveCustomer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Müşteriyi Kaydet
            </button>
          </div>
        </main>
      </div>
    </>
  );
}