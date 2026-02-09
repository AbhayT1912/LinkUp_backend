import { createRequire } from "module";
const require = createRequire(import.meta.url);

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("File buffer missing"));
    }

    if (!cloudinary.uploader) {
      return reject(new Error("Cloudinary uploader not available"));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

export default uploadToCloudinary;
