const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  event_name: { type: String, required: true },
  event_description: { type: String },
  risk_level: { type: String, enum: ['Low', 'Medium', 'High', 'Very High'] }
});

module.exports = mongoose.model('Event', eventSchema, 'events');
