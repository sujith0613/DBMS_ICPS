const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const match = {};
    if (req.user.role === 'policyholder') {
      const Policy = mongoose.model('Policy');
      const policies = await Policy.find({ policy_holder_id: req.user.reference_id });
      const policyIds = policies.map(p => p._id);
      match.policy_id = { $in: policyIds };
    } else if (req.user.role === 'service_provider') {
      match.provider_id = req.user.reference_id;
    } else if (req.user.role === 'surveyor') {
      const ClaimReview = mongoose.model('ClaimReview');
      const reviews = await ClaimReview.find({ surveyor_id: req.user.reference_id });
      const reviewedClaimIds = reviews.map(r => r.claim_id);
      match._id = { $in: reviewedClaimIds };
    }

    // 1. Total claims, Pending, Approved
    const totalClaims = await Claim.countDocuments(match);
    const approvedClaims = await Claim.countDocuments({ ...match, claim_status: 'Approved' });
    const pendingClaims = await Claim.countDocuments({ ...match, claim_status: 'Submitted' });
    const underReviewClaims = await Claim.countDocuments({ ...match, claim_status: 'Under Review' });
    const rejectedClaims = await Claim.countDocuments({ ...match, claim_status: 'Rejected' });

    const approvalRate = totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(1) : 0;

    // 2. Avg processing time
    // For simplicity, we simulate this or calculate based on history. 
    // Mongoose aggregation for time difference between Submitted and Approved/Rejected:
    const processingStats = await Claim.aggregate([
      { $match: { ...match, claim_status: { $in: ['Approved', 'Rejected'] } } },
      {
        $project: {
          processing_time: {
            $subtract: [
              { $arrayElemAt: ["$status_history.status_date", -1] },
              { $arrayElemAt: ["$status_history.status_date", 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgProcessTimeMs: { $avg: "$processing_time" }
        }
      }
    ]);
    const avgProcessingDays = processingStats.length > 0 
      ? (processingStats[0].avgProcessTimeMs / (1000 * 60 * 60 * 24)).toFixed(1)
      : 0;

    // 3. Claims by event type
    const claimsByEvent = await Claim.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: "$event.event_name",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format to match recharts { name, value }
    const eventChartData = claimsByEvent.map(e => ({ name: e._id, value: e.count }));

    // 4. Monthly Trend
    const monthlyTrend = await Claim.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$claim_date" },
            month: { $month: "$claim_date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendChartData = monthlyTrend.map(t => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      claims: t.count
    }));

    res.json({
      kpis: {
        totalClaims,
        pendingClaims: pendingClaims + underReviewClaims,
        approvalRate: parseFloat(approvalRate),
        avgProcessingDays: parseFloat(avgProcessingDays)
      },
      claimsByEvent: eventChartData,
      monthlyTrend: trendChartData,
      statusDistribution: [
        { name: 'Approved', value: approvedClaims, fill: '#22c55e' }, // green
        { name: 'Pending', value: pendingClaims + underReviewClaims, fill: '#f59e0b' }, // amber
        { name: 'Rejected', value: rejectedClaims, fill: '#ef4444' } // red
      ]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
