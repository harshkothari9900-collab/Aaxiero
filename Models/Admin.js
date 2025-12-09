const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createDefaultAdminIfNotExists() {
  try {
    const email = process.env.ADMIN_EMAIL || 'Aaxiero@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'Aaxiero@1709';

    // Try with retries
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let admin = await Admin.findOne({ email });
        
        if (!admin) {
          const hash = await bcrypt.hash(password, 10);
          admin = new Admin({ email, password: hash });
          await admin.save();
          console.log('✅ Default admin created successfully');
        } else {
          console.log('✅ Default admin already exists');
        }
        return admin;
      } catch (err) {
        console.warn(`Attempt ${attempt} to create default admin failed: ${err.message}`);
        if (attempt < 3) {
          // Exponential backoff: 1s, 2s, 3s
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    console.warn('⚠️ Failed to create default admin after 3 attempts');
  } catch (error) {
    console.error('❌ Failed to create default admin:', error.message);
    throw error;
  }
}

module.exports = { Admin, createDefaultAdminIfNotExists };
