const mongoose = require('mongoose');

const surveyorSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  license_no: { type: String, unique: true, required: true },
  phone: { type: String }
});

module.exports = mongoose.model('Surveyor', surveyorSchema, 'surveyors');
