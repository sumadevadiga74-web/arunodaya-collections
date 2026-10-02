import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary configuration is missing.",
        },
        { status: 500 }
      );
    }

    const cloudinaryFormData = new FormData();

    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset);
    cloudinaryFormData.append("folder", "arunodaya/products");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("CLOUDINARY UPLOAD ERROR:", result);

      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary upload failed.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      fullPublicId: result.asset_id,
      mediaType: "image",
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}