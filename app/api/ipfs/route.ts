import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API = "https://api.pinata.cloud";

/**
 * POST /api/ipfs
 *
 * Proxies file and JSON uploads to Pinata so the JWT never leaves the server.
 *
 * Two modes (detected automatically):
 *   1. multipart/form-data  → pin a file  (image upload)
 *   2. application/json     → pin JSON    (metadata upload)
 *
 * Returns: { IpfsHash, PinSize, Timestamp }
 */
export async function POST(req: NextRequest) {
  if (!PINATA_JWT) {
    return NextResponse.json(
      { error: "PINATA_JWT not configured" },
      { status: 500 },
    );
  }

  const contentType = req.headers.get("content-type") || "";

  // ── File upload (image) ────────────────────────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Re-build FormData for Pinata
    const pinataForm = new FormData();
    pinataForm.append("file", file);

    const nameFromForm = formData.get("name");
    const pinataMetadata = JSON.stringify({
      name: nameFromForm ? String(nameFromForm) : file.name,
    });
    pinataForm.append("pinataMetadata", pinataMetadata);

    const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: pinataForm,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  }

  // ── JSON upload (metadata) ─────────────────────────────────────────────────
  const body = await req.json();
  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: body.content,
      pinataMetadata: { name: body.name || "dpp-metadata.json" },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  return NextResponse.json(data);
}
