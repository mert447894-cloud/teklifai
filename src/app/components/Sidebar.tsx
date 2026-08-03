"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-6">
      <nav className="space-y-3">
        <Link
          href="/"
          className="block p-3 rounded-lg hover:bg-blue-100"
        >
          Dashboard
        </Link>

        <Link
          href="/customers"
          className="block p-3 rounded-lg hover:bg-blue-100"
        >
          Müşteriler
        </Link>

        <Link
          href="/new-customer"
          className="block p-3 rounded-lg hover:bg-blue-100"
        >
          Yeni Müşteri
        </Link>

        <Link
          href="/offers"
          className="block p-3 rounded-lg hover:bg-blue-100"
        >
          Teklif Oluştur
        </Link>
      </nav>
    </aside>
  );
}