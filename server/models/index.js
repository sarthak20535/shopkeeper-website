import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  website_name: { type: String, default: 'My Shop' },
  shopkeeper_name: { type: String, default: '' },
  mobile: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  primary_color: { type: String, default: '#2563eb' },
  accent_color: { type: String, default: '#1e40af' },
}, { timestamps: true });

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
}, { timestamps: true });

const tabSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sort_order: { type: Number, default: 0 },
  icon: { type: String, default: '📦' },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  tab_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tab', required: true },
  name: { type: String, required: true },
  image_url: { type: String, default: '' },
  size: { type: String, default: '' },
  price: { type: String, default: '' },
  description: { type: String, default: '' },
  tile_bg_color: { type: String, default: '#ffffff' },
  tile_text_color: { type: String, default: '#1f2937' },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

export const Settings = mongoose.model('Settings', settingsSchema);
export const Admin = mongoose.model('Admin', adminSchema);
export const Tab = mongoose.model('Tab', tabSchema);
export const Product = mongoose.model('Product', productSchema);

export function formatDoc(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const result = {
    ...obj,
    id: obj._id.toString(),
  };
  delete result._id;
  delete result.__v;
  if (obj.tab_id) {
    result.tab_id = obj.tab_id.toString();
  }
  return result;
}
