import mongoose from 'mongoose';

const HelpOrdersSchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: null,
    },
    answer_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('help_orders', HelpOrdersSchema);
