const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  provider_name: { type: String, required: true },
  provider_type: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  phone: { type: String },
  license_no: { type: String, unique: true, required: true },
  recommended_amount: { type: mongoose.Types.Decimal128 },
  remarks: { type: String }
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema, 'service_providers');
