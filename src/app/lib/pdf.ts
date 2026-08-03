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

export function generateOfferPdf({
  title,
  customerName,
  company,
  items,
  grandTotal,
}: GeneratePdfParams) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("TEKLİFAI", 14, 20);

  doc.setFontSize(16);
  doc.text(title, 14, 32);

  doc.setFontSize(11);
  doc.text(`Müşteri: ${customerName}`, 14, 44);
  doc.text(`Firma: ${company}`, 14, 52);

  autoTable(doc, {
    startY: 65,
    head: [["Ürün", "Adet", "Birim Fiyat", "Toplam"]],
    body: items.map((item) => [
      item.product,
      item.quantity,
      `₺${item.unitPrice.toLocaleString("tr-TR")}`,
      `₺${item.total.toLocaleString("tr-TR")}`,
    ]),
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.text(
    `Genel Toplam: ₺${grandTotal.toLocaleString("tr-TR")}`,
    14,
    finalY
  );

  doc.save("teklif.pdf");
}