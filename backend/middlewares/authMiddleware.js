const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;  // ← must be INSIDE the function

    console.log("Token received:", token);

    if (token && token.startsWith("Bearer ")) {
  token = token.split(" ")[1];
  console.log("JWT_SECRET:", process.env.JWT_SECRET);  // ← add
  console.log("Token:", token);                          // ← add
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Decoded:", decoded);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      req.user = user;
      next();

    } else {
      return res.status(401).json({ message: "No token, unauthorized." });
    }

  } catch (error) {
    console.log("Token error:", error.message);
    res.status(401).json({ message: "Token is not valid." });
  }
};

module.exports = { protect };