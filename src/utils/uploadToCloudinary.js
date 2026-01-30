import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file, folder = "linkup") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(file.buffer);
  });
};

export default uploadToCloudinary;
