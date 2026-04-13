const mongoose = require('mongoose');

const claimReviewSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  claim_id: { type: String, ref: 'Claim', required: true, index: true },
  surveyor_id: { type: String, ref: 'Surveyor', required: true, index: true },
  review_date: { type: Date, required: true },
  recommended_amount: { type: mongoose.Types.Decimal128 },
  remarks: { type: String }
});

module.exports = mongoose.model('ClaimReview', claimReviewSchema, 'claim_reviews');
