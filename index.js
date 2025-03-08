const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const ProblemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  submissionLink: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
});

const Problem = mongoose.model("Problem", ProblemSchema);

app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post(
  "/problems",
  authenticateToken,
  [
    body("name").notEmpty(),
    body("rating").isNumeric(),
    body("link").isURL(),
    body("submissionLink").isURL(),
    body("tags").isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, rating, link, submissionLink, tags } = req.body;

    try {
      const newProblem = new Problem({
        name,
        rating,
        link,
        submissionLink,
        tags,
      });
      await newProblem.save();
      res.status(201).json({ message: "Problem created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating problem" });
    }
  },
);

app.get("/problems", async (req, res) => {
  const { tag } = req.query;

  try {
    let problems;
    if (tag) {
      problems = await Problem.find({ tags: { $in: [tag] } });
    } else {
      problems = await Problem.find();
    }
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching problems" });
  }
});

app.patch("/problems/:id/solve", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findByIdAndUpdate(
      id,
      { solved: true },
      { new: true },
    );
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json({ message: "Problem marked as solved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking problem as solved" });
  }
});

app.delete("/problems/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting problem" });
  }
});
// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  solvedProblems: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Problem",
    default: [],
  },
});

const User = mongoose.model("User", UserSchema);

// User registration
app.post(
  "/register",
  [
    body("username").notEmpty().isString().trim(),
    body("password").notEmpty().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newUser = new User({ username, password });
      await newUser.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating user" });
    }
  },
);

// User login
app.post(
  "/login",
  [
    body("username").notEmpty().isString().trim(),
    body("password").notEmpty().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
      );
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error logging in" });
    }
  },
);

// Delete user account
app.delete("/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Update user profile
app.patch(
  "/users/:id",
  authenticateToken,
  [
    body("username").optional().isString().trim(),
    body("password").optional().isString(),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (username) {
        user.username = username;
      }
      if (password) {
        user.password = password;
      }

      await user.save();
      res.json({ message: "User profile updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating user profile" });
    }
  },
);

// Get site statistics
app.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const solvedProblemsCount = await Problem.countDocuments({ solved: true });
    const unsolvedProblemsCount = await Problem.countDocuments({
      solved: false,
    });

    const stats = {
      totalUsers,
      totalProblems,
      solvedProblemsCount,
      unsolvedProblemsCount,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching site statistics" });
  }
});
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
