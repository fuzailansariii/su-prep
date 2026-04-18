import { isAdmin } from "@/src/lib/auth-helper";
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { success: false, message: "ImageKit credentials not found" },
        { status: 500 },
      );
    }
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: privateKey,
      publicKey: publicKey,
      expire: Math.floor(Date.now() / 1000 + 30),
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Failed to get upload auth params:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get upload auth params" },
      { status: 500 },
    );
  }
}
