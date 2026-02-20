import ImageKit from "@imagekit/nodejs";

/**
 * ImageKit server-side client for uploads and URL generation.
 * Use only in server code (API routes, Server Actions).
 */
export function getImageKitClient() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !publicKey || !urlEndpoint) {
    throw new Error(
      "Missing ImageKit env vars: IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT"
    );
  }

  return new ImageKit({
    privateKey,
    publicKey,
    urlEndpoint,
  });
}

/**
 * Get the public URL endpoint for client-side image display.
 */
export function getImageKitUrlEndpoint(): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!endpoint) {
    throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
  }
  return endpoint;
}
