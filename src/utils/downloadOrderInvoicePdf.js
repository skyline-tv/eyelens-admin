import { api } from "../api/axiosInstance";

/** Parse RFC 5987 / quoted filename from Content-Disposition when present */
function filenameFromDisposition(header) {
  if (!header || typeof header !== "string") return null;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      return encoded[1].trim();
    }
  }
  const quoted = header.match(/filename="([^"]+)"/i);
  if (quoted?.[1]) return quoted[1].trim();
  const plain = header.match(/filename=([^;\s]+)/i);
  return plain?.[1] ? plain[1].replace(/^"+|"+$/g, "").trim() : null;
}

/**
 * Streams the Eyelens order PDF (invoice + lens / Rx receipt template) from API.
 */
export async function downloadOrderInvoicePdf(orderId) {
  const id = String(orderId ?? "").trim();
  if (!id) throw new Error("Missing order id");

  const res = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });

  const fromHeader = filenameFromDisposition(res.headers["content-disposition"]);
  const filename = fromHeader || `eyelens-invoice-${id.slice(-8)}.pdf`;

  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
