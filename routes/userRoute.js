import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import WorkoutUser from "../models/userModel.js";
import dotenv from "dotenv";


const router = express.Router();

dotenv.config()
// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
          user: process.env.EMAIL, 
          pass: process.env.EMAIL_PASSWORD, 
      },
  }); 

  const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="https://gymworkoutback-1.onrender.com/user/verify?token=${token}">here</a> to verify your email.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

//sign up end point
router.post('/signup', async (req, res) => {
  try {
    
    const { username, email, password } = req.body;
    console.log('Request body:', req.body);

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await WorkoutUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ username,email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const newUser = new WorkoutUser({
      username, 
      email, 
      password: hashedPassword, 
      verificationToken: token,
      isEmailVerified: false,
    });

    await newUser.save();
    await sendVerificationEmail(email, token);
    console.log(newUser)

    return res.status(201).json({ message: 'User created successfully. Please verify your email.', token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

async function logger(){
  console.log("-------------------")
  console.log(await WorkoutUser.find())
  console.log("---------------")

}

logger()
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Received verification request with token:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await WorkoutUser.findOne({ verificationToken: token });
    console.log(user)

    if (!user) {
      console.log("User not found for token:", token);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.verificationToken = "none"; // Clearing token after verification
    await user.save();

    console.log("User verified successfully:", user);

    res.redirect("http://backend-vo93.onrender.com/user/login"); 
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// **User Login (Only if Verified)**
router.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await WorkoutUser.findOne({ email });
    console.log("User found in DB:", user); 

    if (!user || user.username !== username) {
      return res.status(401).json({ error: "Invalid username or email" });
    }
     
    console.log("User email verified:", user.isEmailVerified); 

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken(user._id);

    res.json({ username: user.username, email: user.email, userId: user._id, token });
  } catch (error) {
    res.status(500).json({ error: "Login error" });
  }
});


// ✅ **Get User Profile**
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await WorkoutUser.findById(req.params.userId).select("password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

// ✅ **Update Password**
router.put("/update/:userId", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await WorkoutUser.findByIdAndUpdate(req.params.userId, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating password" });
  }
});

// ✅ **Delete User Account**
router.delete("/delete/:userId", async (req, res) => {
  try {
    await WorkoutUser.findByIdAndDelete(req.params.userId);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting account" });
  }
});

export default router