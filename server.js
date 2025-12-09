const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { createDefaultAdminIfNotExists } = require('./Models/Admin');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000,
})
	.then(async () => {
		console.log('✅ MongoDB connected successfully');
		// Create default admin if not exists
		await createDefaultAdminIfNotExists();
	})
	.catch((err) => {
		console.error('❌ MongoDB connection error:', err.message);
		process.exit(1);
	});

// Mount routes
const adminRoutes = require('./Routes/adminRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');

app.use('/aaxiero', adminRoutes);
app.use('/aaxiero', categoryRoutes);

// Health check route
app.get('/health', (req, res) => {
	res.status(200).json({ message: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`🚀 AAXIERO Server running on port ${PORT}`);
});
