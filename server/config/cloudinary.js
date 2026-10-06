//Import Cloudinary so Bakeau can upload and manage images
import { v2 as cloudinary } from "cloudinary";

//Connect Cloudinary using values stored in the environment file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Export Cloudinary so it can be reused in upload controllers
export default cloudinary;