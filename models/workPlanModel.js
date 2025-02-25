import mongoose from "mongoose"
const WorkoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  title: { type: String, required: true },
  day: { type: String, required: true },
});

export default mongoose.model('WorkoutPlan', WorkoutPlanSchema);
