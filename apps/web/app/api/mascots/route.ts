import { readdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

/**
 * GET /api/mascots
 * Dynamically reads public/ and returns all image files (excluding logo).
 * Drop any PNG into public/ and it will auto-appear on the landing page.
 */
export async function GET() {
  try {
    const publicDir = join(process.cwd(), "public");
    const files = await readdir(publicDir);
    const images = files
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f) && !/logo/i.test(f))
      .map(f => `/${f}`);
    return NextResponse.json(
      { images },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch {
    return NextResponse.json({ images: [] });
  }
}
