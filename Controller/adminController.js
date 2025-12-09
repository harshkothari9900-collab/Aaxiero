const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Admin } = require('../Models/Admin');

// POST /aaxiero/admin/login
const login = async (req, res) => {
  try {
    // Normalize body keys to accept case-insensitive fields (e.g., Email, EMAIL)
    const body = {};
    Object.keys(req.body || {}).forEach((k) => {
      body[k.toLowerCase()] = req.body[k];
    });

    const email = body.email;
    const password = body.password;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Retry logic for database timeout
    let admin = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Login attempt ${attempt}/3 for email: ${email}`);
        admin = await Admin.findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
          .lean();
        if (admin) break;
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err.message);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Exponential backoff
          continue;
        } else {
          throw err;
        }
      }
    }

    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h'
    });

    return res.json({ success: true, token, admin: { email: admin.email } });
  } catch (err) {
    console.error('Login error', err.message);
    return res.status(500).json({ success: false, message: 'Database connection issue. Please try again.' });
  }
};

module.exports = { login };
