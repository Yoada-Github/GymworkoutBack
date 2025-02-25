import mongoose from "mongoose"
const PerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Number, // Stored as timestamp
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  exerciseName: {
    type: String,
    required: true
  },
  load: {
    type: Number,
    required: true
  },
  reps: {
    type: Number,
    required: true
  }
});

export default mongoose.model('Performance', PerformanceSchema);

