const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  policy_number: { type: String, required: true, unique: true },
  premium_amount: { type: mongoose.Types.Decimal128 },
  coverage_amount: { type: mongoose.Types.Decimal128 },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  policy_holder_id: { type: String, ref: 'PolicyHolder', required: true, index: true },
  branch_id: { type: String, ref: 'Branch', required: true, index: true },
  event_id: { type: String, ref: 'Event', required: true, index: true }
});

module.exports = mongoose.model('Policy', policySchema, 'policies');
