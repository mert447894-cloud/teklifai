import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      to,
      customerName,
      offerNo,
      title,
      pdfBase64,
    } = body;

    if (!to) {
      return NextResponse.json(
        {
          error:
            "Müşterinin e-posta adresi bulunamadı.",
        },
        { status: 400 }
      );
    }

    if (!pdfBase64) {
      return NextResponse.json(
        {
          error: "PDF dosyası bulunamadı.",
        },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY bulunamadı.",
        },
        { status: 500 }
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL ||
      "onboarding@resend.dev";

    const result = await resend.emails.send({
      from: `TeklifAI <${from}>`,
      to: [to],

      subject: `TeklifAI - ${offerNo} - ${title}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            color: #1f2937;
          "
        >
          <div
            style="
              background: #2563eb;
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
            "
          >
            <h1 style="margin: 0;">
              TeklifAI
            </h1>

            <p style="margin-bottom: 0;">
              Teklifiniz hazırlanmıştır.
            </p>
          </div>

          <div
            style="
              padding: 25px;
              border: 1px solid #e5e7eb;
              border-top: none;
            "
          >
            <p>
              Merhaba
              <strong>
                ${escapeHtml(customerName || "")}
              </strong>,
            </p>

            <p>
              Tarafınıza hazırlanan teklif
              ekte PDF olarak gönderilmiştir.
            </p>

            <div
              style="
                background: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
              "
            >
              <p style="margin: 5px 0;">
                <strong>Teklif No:</strong>
                ${escapeHtml(offerNo || "-")}
              </p>

              <p style="margin: 5px 0;">
                <strong>Teklif:</strong>
                ${escapeHtml(title || "-")}
              </p>
            </div>

            <p>
              Teklif detaylarını ekte bulunan PDF
              dosyasından inceleyebilirsiniz.
            </p>

            <p>
              İyi çalışmalar dileriz.
            </p>

            <hr
              style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 25px 0;
              "
            />

            <p
              style="
                color: #6b7280;
                font-size: 12px;
              "
            >
              Bu e-posta TeklifAI tarafından
              gönderilmiştir.
            </p>
          </div>
        </div>
      `,

      attachments: [
        {
          filename: `${safeFileName(
            offerNo || "teklif"
          )}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (result.error) {
      console.error(
        "Resend error:",
        result.error
      );

      return NextResponse.json(
        {
          error: result.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
    });
  } catch (error) {
    console.error(
      "Send offer error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "E-posta gönderilemedi.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeFileName(value: string) {
  return String(value)
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "-");
}