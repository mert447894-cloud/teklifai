"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    getCustomers();
  }, []);

  async function getCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setCustomers(data || []);
    }
  }

  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 bg-gray-100 min-h-screen p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-blue-600">
              Müşteriler
            </h1>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
              + Yeni Müşteri
            </button>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="text-left p-4">Ad Soyad</th>
                  <th className="text-left p-4">Firma</th>
                  <th className="text-left p-4">Telefon</th>
                  <th className="text-left p-4">E-posta</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-4">{customer.name}</td>
                    <td className="p-4">{customer.company}</td>
                    <td className="p-4">{customer.phone}</td>
                    <td className="p-4">{customer.email}</td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center p-8 text-gray-500"
                    >
                      Henüz müşteri bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}