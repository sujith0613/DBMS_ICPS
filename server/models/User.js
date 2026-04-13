const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'branch_manager', 'policyholder', 'surveyor', 'service_provider'], required: true },
  reference_id: { type: String }, // Links to PolicyHolder, Surveyor, Branch, or ServiceProvider depending on role
});

module.exports = mongoose.model('User', userSchema, 'users');
