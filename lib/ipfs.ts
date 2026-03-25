const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

/**
 * Upload an image file to IPFS via the local Next.js API route (which proxies
 * to Pinata). Returns the CID.
 */
export async function uploadImageToIPFS(
  file: File,
  name?: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);

  const res = await fetch("/api/ipfs", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Image upload failed");
  }
  const data = await res.json();
  return data.IpfsHash as string;
}

/**
 * Upload a JSON metadata object to IPFS. Returns the CID.
 */
export async function uploadJSONToIPFS(
  content: Record<string, unknown>,
  name?: string,
): Promise<string> {
  const res = await fetch("/api/ipfs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "JSON upload failed");
  }
  const data = await res.json();
  return data.IpfsHash as string;
}

/**
 * Convert an IPFS URI (ipfs://Qm... or just Qm...) to an HTTP gateway URL.
 */
export function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  const cid = uri.replace("ipfs://", "");
  if (!cid || cid === "placeholder_image_cid") return "";
  return `${IPFS_GATEWAY}/${cid}`;
}
