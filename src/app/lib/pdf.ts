import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfItem = {
  product: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type GeneratePdfParams = {
  offerNo: string;
  title: string;
  createdAt: string;
  validUntil: string | null;
  vatRate: number;
  notes: string;

  customerName: string;
  company: string;
  phone: string;
  email: string;

  items: PdfItem[];
  grandTotal: number;
};

async function loadArialFont(
  doc: jsPDF
) {
  const response = await fetch(
    "/fonts/Arial.ttf"
  );

  if (!response.ok) {
    throw new Error(
      "Arial.ttf yüklenemedi."
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  const bytes = new Uint8Array(
    arrayBuffer
  );

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    const chunk = bytes.subarray(
      i,
      Math.min(
        i + chunkSize,
        bytes.length
      )
    );

    binary += String.fromCharCode(
      ...chunk
    );
  }

  const base64 =
    btoa(binary);

  doc.addFileToVFS(
    "Arial.ttf",
    base64
  );

  doc.addFont(
    "Arial.ttf",
    "Arial",
    "normal"
  );

  doc.setFont(
    "Arial",
    "normal"
  );
}

async function createOfferPdf(
  params: GeneratePdfParams
) {
  const {
    offerNo,
    title,
    createdAt,
    validUntil,
    vatRate,
    notes,
    customerName,
    company,
    phone,
    email,
    items,
    grandTotal,
  } = params;

  const doc = new jsPDF();

  await loadArialFont(doc);

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  /*
   * BAŞLIK
   */

  doc.setFontSize(24);

  doc.text(
    "TeklifAI",
    20,
    25
  );

  doc.setFontSize(10);

  doc.text(
    "Yapay zekâ destekli teklif sistemi",
    20,
    32
  );

  /*
   * TEKLİF
   */

  doc.setFontSize(18);

  doc.text(
    title,
    20,
    48
  );

  doc.setFontSize(10);

  doc.text(
    `Teklif No: ${offerNo}`,
    20,
    57
  );

  doc.text(
    `Tarih: ${formatDate(createdAt)}`,
    20,
    64
  );

  if (validUntil) {
    doc.text(
      `Geçerlilik: ${formatDate(validUntil)}`,
      20,
      71
    );
  }

  /*
   * MÜŞTERİ BİLGİLERİ
   */

  const customerBoxY =
    validUntil ? 82 : 75;

  doc.setFillColor(
    245,
    247,
    250
  );

  doc.roundedRect(
    20,
    customerBoxY,
    pageWidth - 40,
    40,
    3,
    3,
    "F"
  );

  doc.setFontSize(11);

  doc.text(
    "Müşteri Bilgileri",
    25,
    customerBoxY + 9
  );

  doc.setFontSize(9);

  doc.text(
    `Ad Soyad: ${customerName || "-"}`,
    25,
    customerBoxY + 18
  );

  doc.text(
    `Firma: ${company || "-"}`,
    25,
    customerBoxY + 25
  );

  doc.text(
    `Telefon: ${phone || "-"}`,
    110,
    customerBoxY + 18
  );

  doc.text(
    `E-posta: ${email || "-"}`,
    110,
    customerBoxY + 25
  );

  /*
   * ÜRÜN TABLOSU
   */

  const tableStartY =
    customerBoxY + 50;

  autoTable(doc, {
    startY: tableStartY,

    head: [
      [
        "Ürün / Hizmet",
        "Birim",
        "Miktar",
        "Birim Fiyat",
        "Toplam",
      ],
    ],

    body: items.map((item) => [
      item.product,
      item.unit || "Adet",
      String(item.quantity),
      formatCurrency(
        item.unitPrice
      ),
      formatCurrency(
        item.total
      ),
    ]),

    styles: {
      font: "Arial",
      fontStyle: "normal",
      fontSize: 9,
      cellPadding: 4,
    },

    headStyles: {
      font: "Arial",
      fontStyle: "normal",
      fontSize: 9,
      fillColor: [
        37,
        99,
        235,
      ],
      textColor: [
        255,
        255,
        255,
      ],
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    columnStyles: {
      0: {
        cellWidth: 65,
      },

      1: {
        cellWidth: 25,
        halign: "center",
      },

      2: {
        cellWidth: 25,
        halign: "center",
      },

      3: {
        cellWidth: 35,
        halign: "right",
      },

      4: {
        cellWidth: 35,
        halign: "right",
      },
    },

    margin: {
      left: 20,
      right: 20,
    },
  });

  const finalY =
    (doc as any)
      .lastAutoTable?.finalY ??
    tableStartY + 20;

  /*
   * TOPLAMLAR
   */

  const vatAmount =
    grandTotal *
    (vatRate / 100);

  const subtotal =
    grandTotal - vatAmount;

  const totalsY =
    finalY + 15;

  doc.setFontSize(10);

  doc.text(
    `Ara Toplam: ${formatCurrency(
      subtotal
    )}`,
    pageWidth - 20,
    totalsY,
    {
      align: "right",
    }
  );

  doc.text(
    `KDV (%${vatRate}): ${formatCurrency(
      vatAmount
    )}`,
    pageWidth - 20,
    totalsY + 8,
    {
      align: "right",
    }
  );

  doc.setFillColor(
    37,
    99,
    235
  );

  doc.roundedRect(
    pageWidth - 95,
    totalsY + 15,
    75,
    15,
    3,
    3,
    "F"
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(10);

  doc.text(
    `Genel Toplam: ${formatCurrency(
      grandTotal
    )}`,
    pageWidth - 57.5,
    totalsY + 24.5,
    {
      align: "center",
    }
  );

  doc.setTextColor(
    0,
    0,
    0
  );

  /*
   * NOTLAR
   */

  if (notes.trim()) {
    const notesY =
      totalsY + 42;

    doc.setFontSize(11);

    doc.text(
      "Notlar",
      20,
      notesY
    );

    doc.setFontSize(9);

    const noteLines =
      doc.splitTextToSize(
        notes,
        pageWidth - 40
      );

    doc.text(
      noteLines,
      20,
      notesY + 8
    );
  }

  /*
   * ALT BİLGİ
   */

  doc.setFontSize(8);

  doc.setTextColor(
    120,
    120,
    120
  );

  doc.text(
    "TeklifAI - Profesyonel Teklif Yönetimi",
    20,
    pageHeight - 15
  );

  doc.text(
    "Sayfa 1",
    pageWidth - 20,
    pageHeight - 15,
    {
      align: "right",
    }
  );

  return doc;
}

/*
 * PDF oluştur + indir
 */

export async function generateOfferPdf(
  params: GeneratePdfParams
) {
  const doc =
    await createOfferPdf(params);

  doc.save(
    `${safeFileName(
      params.offerNo || "teklif"
    )}.pdf`
  );
}

/*
 * PDF oluştur + Base64 döndür
 *
 * E-posta gönderiminde kullanılacak.
 */

export async function generateOfferPdfBase64(
  params: GeneratePdfParams
) {
  const doc =
    await createOfferPdf(params);

  const dataUri =
    doc.output(
      "datauristring"
    );

  return dataUri.split(",")[1];
}

function formatCurrency(
  value: number
) {
  return `₺${Number(
    value || 0
  ).toLocaleString(
    "tr-TR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(
  value: string
) {
  if (!value) {
    return "-";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "tr-TR"
  );
}

function safeFileName(
  value: string
) {
  return String(value)
    .replace(
      /[<>:"/\\|?*]/g,
      "-"
    )
    .replace(
      /\s+/g,
      "-"
    );
}