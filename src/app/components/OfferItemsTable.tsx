"use client";

export type OfferItem = {
  product: string;
  quantity: number;
  price: number;
};

type Props = {
  items: OfferItem[];
  setItems: React.Dispatch<React.SetStateAction<OfferItem[]>>;
};

export default function OfferItemsTable({
  items,
  setItems,
}: Props) {
  function updateItem(
    index: number,
    field: keyof OfferItem,
    value: string | number
  ) {
    const newItems = [...items];

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    setItems(newItems);
  }

  function addRow() {
    setItems([
      ...items,
      {
        product: "",
        quantity: 1,
        price: 0,
      },
    ]);
  }

  function removeRow(index: number) {
    const newItems = items.filter((_, i) => i !== index);

    if (newItems.length === 0) {
      setItems([
        {
          product: "",
          quantity: 1,
          price: 0,
        },
      ]);
      return;
    }

    setItems(newItems);
  }

  const grandTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">
        Teklif Kalemleri
      </h2>

      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3 text-left">Ürün / Hizmet</th>
            <th className="p-3 text-center">Miktar</th>
            <th className="p-3 text-center">Birim Fiyat</th>
            <th className="p-3 text-center">Toplam</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">
                <input
                  value={item.product}
                  onChange={(e) =>
                    updateItem(index, "product", e.target.value)
                  }
                  className="border rounded p-2 w-full"
                  placeholder="Ürün veya Hizmet"
                />
              </td>

              <td className="p-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  className="border rounded p-2 w-full text-center"
                />
              </td>

              <td className="p-2">
                <input
                  type="number"
                  min={0}
                  value={item.price}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "price",
                      Number(e.target.value)
                    )
                  }
                  className="border rounded p-2 w-full text-center"
                />
              </td>

              <td className="p-2 text-center font-semibold">
                ₺
                {(item.quantity * item.price).toLocaleString("tr-TR")}
              </td>

              <td className="p-2 text-center">
                <button
                  onClick={() => removeRow(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={addRow}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          + Satır Ekle
        </button>

        <div className="text-2xl font-bold text-blue-600">
          Genel Toplam: ₺{grandTotal.toLocaleString("tr-TR")}
        </div>
      </div>
    </div>
  );
}