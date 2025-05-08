const mongoose = require('mongoose');
const slugify = require('slugify');

const jobApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  resume: {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    fileName: { type: String, required: true },
  },
  coverLetter: { type: String, required: true },
  experience: { type: Number, required: true },
  linkedin: { type: String },
  portfolio: { type: String },
  github: { type: String },
  atsScore: { type: Number, default: 0 },
  slug: { type: String, unique: true },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected'],
    default: 'applied'
  },
  shortlisted: { type: Boolean, default: false }
},{ timestamps: true });

jobApplicationSchema.pre('save', function (next) {
  const baseSlug = `${this.name}-${Date.now()}`;
  this.slug = slugify(baseSlug, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
