const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: { type: [String], required: true },
  salary: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

jobSchema.pre('save', function (next) {
  this.slug = slugify(`${this.title}-${Date.now()}`, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Job', jobSchema);
