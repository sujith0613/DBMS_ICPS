const mongoose = require('mongoose');

const claimDocumentSchema = new mongoose.Schema({
  document_id: { type: String, required: true },
  file_path: { type: String, required: true },
  document_type: { type: String, required: true },
  upload_date: { type: Date, default: Date.now }
}, { _id: false });

const claimStatusHistorySchema = new mongoose.Schema({
  status_id: { type: String, required: true },
  status: { type: String, required: true },
  status_date: { type: Date, default: Date.now },
  updated_by: { type: String, required: true }
}, { _id: false });

const claimSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  claim_number: { type: String, required: true, unique: true },
  claim_date: { type: Date, required: true },
  claim_amount: { type: mongoose.Types.Decimal128, required: true },
  claim_status: { type: String, required: true, index: true },
  event_id: { type: String, ref: 'Event', required: true, index: true },
  policy_id: { type: String, ref: 'Policy', required: true, index: true },
  provider_id: { type: String, ref: 'ServiceProvider', required: true, index: true },
  documents: [claimDocumentSchema],
  status_history: [claimStatusHistorySchema]
});

module.exports = mongoose.model('Claim', claimSchema, 'claims');
