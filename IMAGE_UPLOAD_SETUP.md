# Profile Image Upload Setup

## ✅ What's Been Set Up

### 1. **Backend Setup**
- ✅ Installed `multer` package for handling file uploads
- ✅ Created `server/middleware/upload.js` - Multer configuration for image uploads
- ✅ Created `server/routes/upload.js` - Upload endpoint (`POST /api/upload/profile-image`)
- ✅ Created `server/uploads/profile-images/` directory for storing images
- ✅ Server configured to serve static files from `/uploads` directory

### 2. **Frontend Setup**
- ✅ Added `uploadAPI.uploadProfileImage()` function in `src/utils/api.js`
- ✅ Updated `ProfileScreen.jsx` to upload files instead of base64
- ✅ Added loading state during image upload
- ✅ Image URLs are stored as file paths (e.g., `/uploads/profile-images/userId-timestamp-filename.jpg`)

## 📁 File Structure

```
server/
├── middleware/
│   └── upload.js          # Multer configuration
├── routes/
│   └── upload.js          # Upload endpoint
└── uploads/
    └── profile-images/    # Stored images (gitignored)
```

## 🔧 How It Works

1. **User selects image** → Frontend validates file (size, type)
2. **File uploaded** → POST to `/api/upload/profile-image` with FormData
3. **Server saves file** → Stores in `server/uploads/profile-images/` with unique filename
4. **Server returns URL** → Returns `/uploads/profile-images/filename.jpg`
5. **Frontend stores URL** → Saves URL in form state
6. **Profile updated** → URL saved to database when user clicks "Save"
7. **Images served** → Express serves static files from `/uploads` directory

## 🌐 Image URLs

- **Development**: `http://localhost:3001/uploads/profile-images/filename.jpg`
- **Production**: `/uploads/profile-images/filename.jpg` (relative path)

## 📝 API Endpoint

### `POST /api/upload/profile-image`
- **Auth**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Body**: FormData with `image` field
- **Response**:
  ```json
  {
    "success": true,
    "imageUrl": "/uploads/profile-images/userId-timestamp-filename.jpg",
    "filename": "userId-timestamp-filename.jpg",
    "size": 123456
  }
  ```

## 🔒 Security Features

- ✅ Authentication required (users can only upload their own images)
- ✅ File type validation (only images: jpeg, jpg, png, gif, webp)
- ✅ File size limit (5MB max)
- ✅ Unique filenames (prevents overwrites)
- ✅ Sanitized filenames (removes special characters)

## 📦 Dependencies

- `multer` - File upload middleware for Express

## 🚀 Next Steps (Optional)

1. **Cloud Storage**: Consider migrating to AWS S3, Cloudinary, or similar for production
2. **Image Optimization**: Add image compression/resizing (e.g., sharp, jimp)
3. **CDN**: Use CDN for faster image delivery
4. **Cleanup**: Add cron job to delete old unused images

## 🧪 Testing

1. Go to Profile screen
2. Click "Click to upload photo"
3. Select an image file
4. Image should upload and display preview
5. Click "Save" to save profile
6. Image URL should be saved to database
