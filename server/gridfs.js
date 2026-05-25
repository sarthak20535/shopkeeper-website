import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

export function getUploadBucket() {
  return new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
}

export async function saveUpload(buffer, filename, contentType) {
  const bucket = getUploadBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
    uploadStream.on('error', reject);
    uploadStream.end(buffer);
  });
}

export function openDownloadStream(fileId) {
  const bucket = getUploadBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}

export async function getUploadMeta(fileId) {
  const bucket = getUploadBucket();
  const files = await bucket
    .find({ _id: new mongoose.Types.ObjectId(fileId) })
    .toArray();
  return files[0] || null;
}
