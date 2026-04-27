const mongoose = require('mongoose');

const counselorSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    email:      { type: String, default: '', trim: true },
    phone:      { type: String, default: '', trim: true },
    image:      { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
    // Return _id as id in JSON responses, remove __v
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.models.Counselor || mongoose.model('Counselor', counselorSchema);
