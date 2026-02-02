import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (base64Image, folder = "linkup") => {
  try {
    console.log("🌐 Sending image to Cloudinary...");
    console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY?.substring(0, 5) + "...");
    console.log("API Secret:", process.env.CLOUDINARY_API_SECRET?.substring(0, 5) + "...");
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "auto",
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("✅ Cloudinary response:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);
    console.error("Error details:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
