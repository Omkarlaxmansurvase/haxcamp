import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'

// CLOUDINARY_URL is picked up automatically: cloudinary://<api_key>:<api_secret>@<cloud_name>
cloudinary.config({ secure: true })
// console.log('Cloudinary cloud:', cloudinary.config().cloud_name)

export function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'luma/products',
        resource_type: 'image',
        // cap size and compress on upload so pages stay fast
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })
}

export function removeImage(publicId) {
  return cloudinary.uploader.destroy(publicId)
}