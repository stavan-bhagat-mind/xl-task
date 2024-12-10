// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("cloudinary").v2;
// require("dotenv").config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "xl-sheets",
//     allowed_formats: ["jpg", "jpeg", "png", "gif", "xlsx", "xls"],
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;

//----------

// const multer = require("multer");
// const path = require("path");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("cloudinary").v2;
// require("dotenv").config();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Create Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "xl-sheets",
//     allowed_formats: ["jpg", "jpeg", "png", "gif", "xlsx", "xls", "csv"],
//   },
//   filename: (req, file, cb) => {
//     console.log("Filename callback:", file.originalname);
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "application/vnd.ms-excel",
//       "text/csv",
//     ];
//     console.log("File MIME type:", file.mimetype);
//     console.log(
//       "MIME type match:",
//       allowedMimes.includes(file.mimetype.trim())
//     );
//     console.log(req.headers);
//     console.log("Uploaded file:", req.file);
//     console.log("file", file);
//     console.log("Uploading file:", file.originalname);
//     console.log("MIME type:", file.mimetype);
//     if (allowedMimes.includes(file.mimetype.trim())) {
//       console.log("File accepted:", file.originalname);
//       return cb(null, true);
//     }
//     console.log("File rejected:", file.originalname);
//     cb(
//       new Error(
//         "Error: File upload only supports the following filetypes - " +
//           allowedMimes.join(", ")
//       )
//     );
//   },
// });

// module.exports = upload;
// -----------

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "xl-sheets",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "xlsx", "xls", "csv"],
    resource_type: "raw", // Set resource type to raw for non-image files
    upload_preset: "non_image_files", // Use the upload preset created in Cloudinary
  },
  filename: (req, file, cb) => {
    console.log("Filename callback executed");
    console.log("Original filename:", file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv", // Added CSV MIME type
    ];

    console.log("File MIME type:", file.mimetype);
    console.log("Allowed MIME types:", allowedMimes);
    console.log(
      "MIME type match:",
      allowedMimes.includes(file.mimetype.trim())
    );

    if (allowedMimes.includes(file.mimetype.trim())) {
      console.log("File accepted:", file.originalname);
      return cb(null, true);
    }

    console.log("File rejected:", file.originalname);
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          allowedMimes.join(", ")
      )
    );
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

module.exports = upload;
