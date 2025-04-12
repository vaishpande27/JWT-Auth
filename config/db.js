const mongoose = require("mongoose");

  const connectDB = async () => {
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/Job_portal", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ Connected to Database");
    } catch (err) {
      console.error("❌ Database Connection Failed:", err);
      process.exit(1); // Exit process if DB connection fails
    }
  };


module.exports = connectDB;
