const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  branch_name: { type: String, required: true },
  location: { type: String, required: true },
  manager_name: { type: String },
  contact: { type: String }
});

module.exports = mongoose.model('Branch', branchSchema, 'branches');
