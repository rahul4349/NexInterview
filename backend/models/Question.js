const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    question:  String,

    answer: String,
    
    
    isPinned: {
      type: Boolean,
      default: false,
    },
    note:String,
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);