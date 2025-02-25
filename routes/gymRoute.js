import express from "express";
import mongoose from "mongoose";
import gymModel from "../models/gymModel.js";
import performance from "../models/performanceModel.js"
import workPlanModel from "../models/workPlanModel.js"


const router = express.Router();

// Add a new exercise 
router.post("/", async (req, res) => {
  try {
      const { title, load, reps, userId } = req.body;
      if (!title || !load || !reps || !userId) {
          return res.status(400).send({ message: "All levels and details are required." });
      }

      const newGym = {
          title,
          load,
          reps,
          user: userId,
      };

      const gym = await gymModel.create(newGym);
      return res.status(201).send(gym);
  } catch (error) {
      console.error("Error saving gym exercise:", error.message);
      res.status(500).send({ message: "Internal Server Error" });
  }
});
//  Fetch all exercises for a user
router.get("/gyms/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const gyms = await gymModel.find({ user: new mongoose.Types.ObjectId(userId) });

    if (!gyms.length) {
      return res.status(404).json({ message: "No workouts found" });
    }

    res.status(200).json(gyms);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//  Fetch a single exercise by ID
router.get("/exercise/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid exercise ID format" });
    }

    const exercise = await gymModel.findById(id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.status(200).json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//  Update an exercise by ID
router.put("/exercise/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, load, reps } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid exercise ID format" });
    }

    const updatedGym = await gymModel.findByIdAndUpdate(
      id,
      { title, load, reps },
      { new: true } 
    );

    if (!updatedGym) {
      return res.status(404).json({ message: "Workout exercise not found" });
    }

    res.status(200).json({ message: "Workout exercise updated successfully", updatedGym });
  } catch (error) {
    console.error("Error updating workout exercise:", error);
    res.status(500).json({ message: "Failed to update workout exercise" });
  }
});

// Fetch workout plan
router.get("/workout-plan/", async (req, res) => {
  const {userId} = req.query

    try {
      const workoutPlan = await workPlanModel.find({ userId: userId });
      res.json(workoutPlan);
    } catch (error) {
      res.status(500).json({ error: "Error fetching workout plan" });
    }
  });
  
  // Add new workout
  router.post("/workout-plan", async (req, res) => {
    try {
      const newWorkout = new workPlanModel(req.body);
      await newWorkout.save();
      res.status(201).json(newWorkout);
    } catch (error) {
      res.status(500).json({ error: "Error adding workout" });
    }
  });
  
  // Delete workout
  router.delete("/workout-plan/:id", async (req, res) => {
    try {
      await workPlanModel.findByIdAndDelete(req.params.id);
      res.json({ message: "Workout deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting workout" });
    }
  });
  
//  Delete an Exercise
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await gymModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Gym exercise not found" });
    }

    return res.status(200).json({ message: "Gym exercise deleted successfully" });
  } catch (error) {
    console.error("Error deleting gym exercise:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

  
  //fetch single workout  by id
  router.get('/workout-plan/:id', async (req, res) => {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
  
    try {
      const workoutPlan = await workPlanModel.findById(id);
      if (!workoutPlan) {
        return res.status(404).json({ error: 'Workout plan not found' });
      }
      res.status(200).json(workoutPlan);
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // Edit Workout Plan
router.put("/workout-plan/:id", async (req, res) => {
  
    try {
      const { id } = req.params;
      const { title, day } = req.body;
      
      // Find the workout plan by ID and update it
      const updatedWorkout = await workPlanModel.findByIdAndUpdate(
        id,
        { title, day },
        { new: true } 
      );

    
      if (!updatedWorkout) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
  
      res.status(200).json({ message: "Workout plan updated successfully", updatedWorkout });
    } catch (error) {
      console.error("Error updating workout plan:", error);
      res.status(500).json({ message: "Failed to update workout plan" });
    }
  });


  // Get performance data for a user
router.get('/performance/:userId', async (req, res) => {
  try {
    const performances = await performance.find({ userId: req.params.userId });
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance data', error });
  }
});

// Save performance data
router.post('/performance', async (req, res) => {
  try {
    const newPerformance = new performance(req.body);
    await newPerformance.save();
    res.status(201).json({ message: 'Performance saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving performance', error });
  }
});

// Delete a performance record
router.delete('/performance/:id', async (req, res) => {
  try {
    await performance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Performance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting performance', error });
  }
});

  
  export default router;