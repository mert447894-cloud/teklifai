import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfItem = {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type GeneratePdfParams = {
  title: string;
  customerName: string;
  company: string;
  items: PdfItem[];
  grandTotal: number;
};

export async function generateOfferPdf({
  title,
  customerName,
  company,
  items,
  grandTotal,
}: GeneratePdfParams) {
  const doc = new jsPDF();

  /*
   * Türkçe karakter desteği için Windows Arial fontunu kullanıyoruz.
   * Font dosyası:
   * public/fonts/Arial.ttf
   */

  try {
    const response = await fetch("/fonts/Arial.ttf");

    if (!response.ok) {
      throw new Error("Arial.ttf bulunamadı.");
    }

    const arrayBuffer = await response.arrayBuffer();

    const uint8Array = new Uint8Array(arrayBuffer);

    let binary = "";

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < uint8Array.length;
      i += chunkSize
    ) {
      binary += String.fromCharCode(
        ...uint8Array.subarray(
          i,
          Math.min(
            i + chunkSize,
            uint8Array.length
          )
        )
      );
    }

    const base64 = btoa(binary);

    doc.addFileToVFS(
      "Arial.ttf",
      base64
    );

    doc.addFont(
      "Arial.ttf",
      "Arial",
      "normal"
    );

    doc.addFont(
      "Arial.ttf",
      "Arial",
      "bold"
    );

    doc.setFont(
      "Arial",
      "normal"
    );
  } catch (error) {
    console.error(
      "Arial font yüklenemedi:",
      error
    );

    alert(
      "Türkçe PDF fontu yüklenemedi. " +
        "public/fonts/Arial.ttf dosyasını kontrol edin."
    );

    return;
  }

  /*
   * BAŞLIK
   */

  doc.setFont(
    "Arial",
    "bold"
  );

  doc.setFontSize(22);

  doc.text(
    "TeklifAI",
    14,
    20
  );

  doc.setFontSize(16);

  doc.text(
    title || "Teklif",
    14,
    32
  );

  /*
   * MÜŞTERİ BİLGİLERİ
   */

  doc.setFont(
    "Arial",
    "normal"
  );

  doc.setFontSize(11);

  doc.text(
    `Müşteri: ${customerName || "-"}`,
    14,
    45
  );

  doc.text(
    `Firma: ${company || "-"}`,
    14,
    53
  );

  /*
   * ÜRÜN TABLOSU
   */

  autoTable(doc, {
    startY: 65,

    head: [
      [
        "Ürün / Hizmet",
        "Adet",
        "Birim Fiyat",
        "Toplam",
      ],
    ],

    body: items.map((item) => [
      item.product || "-",
      String(item.quantity),
      `₺${Number(
        item.unitPrice
      ).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      `₺${Number(
        item.total
      ).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]),

    styles: {
      font: "Arial",
      fontStyle: "normal",
      fontSize: 9,
    },

    headStyles: {
      font: "Arial",
      fontStyle: "bold",
    },

    bodyStyles: {
      font: "Arial",
      fontStyle: "normal",
    },

    margin: {
      left: 14,
      right: 14,
    },
  });

  /*
   * GENEL TOPLAM
   */

  const finalY =
    ((doc as any).lastAutoTable?.finalY || 65) +
    15;

  doc.setFont(
    "Arial",
    "bold"
  );

  doc.setFontSize(14);

  doc.text(
    `Genel Toplam: ₺${Number(
      grandTotal
    ).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    14,
    finalY
  );

  /*
   * PDF
   */

  doc.save("teklif.pdf");
}