import QRCode from "qrcode";

export async function generatePaymentQr(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error("Payment QR requires a public HTTPS destination without credentials.");
  }
  return QRCode.toDataURL(url, { errorCorrectionLevel: "M", width: 416, margin: 4 });
}
