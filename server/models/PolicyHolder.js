const mongoose = require('mongoose');

const policyHolderSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['M', 'F', 'Other'] },
  aadhaar_no: { type: String, required: true, unique: true },
  phones: [{ type: String }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  }
});

module.exports = mongoose.model('PolicyHolder', policyHolderSchema, 'policyholders');
