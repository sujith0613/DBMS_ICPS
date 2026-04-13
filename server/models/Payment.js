const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  claim_id: { type: String, ref: 'Claim', required: true, index: true },
  payment_date: { type: Date, required: true },
  payment_amount: { type: mongoose.Types.Decimal128, required: true },
  payment_mode: { type: String, required: true },
  transaction_ref_no: { type: String, unique: true, required: true }
});

module.exports = mongoose.model('Payment', paymentSchema, 'payments');
