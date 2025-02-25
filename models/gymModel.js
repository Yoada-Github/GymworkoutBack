import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  load: {
    type: Number,
    required: [true, "Load is required"],
  },
  reps: {
    type: Number,
    required: [true, "Reps are required"],
  },
  user: 
  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Ensure ObjectId

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Gym = mongoose.model("Gym", gymSchema);

export default Gym; 