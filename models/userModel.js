import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // Email validation
  },
  password: { 
    type: String, 
    required: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: { 
    type: String, 
    required: false
  },
});

const WorkoutUser = mongoose.model('WorkoutUser', userSchema);

export default WorkoutUser;  // Correct export
