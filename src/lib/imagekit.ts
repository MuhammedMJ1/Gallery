import ImageKit from "@imagekit/nodejs";

/**
 * ImageKit server-side client for uploads and URL generation.
 * Use only in server code (API routes, Server Actions).
 *
 * The new @imagekit/nodejs SDK only accepts `privateKey` in its constructor.
 * It reads the base URL from process.env['IMAGE_KIT_BASE_URL'] automatically.
 */
export function getImageKitClient() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "Missing ImageKit env var: IMAGEKIT_PRIVATE_KEY"
    );
  }

  return new ImageKit({
    privateKey,
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
