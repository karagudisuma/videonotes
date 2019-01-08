const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/*
// this will be our data base's data structure 
const LoginSchema = new Schema(
  {
    id: Number,
    username: String,
    password: String
  },
  { timestamps: true }
);*/

let VideoDataSchema = new Schema({
  email: {type: String, required: true},
  role: {type: String, required: true},
  url: {type: String, required: true},
  attacherNotes: [
    {
      vTime: {type: Number, required: true},
      quillOps: {type: Array, required: true}
    }
  ]
});


// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("VideoData", VideoDataSchema);
//module.exports = mongoose.model("LoginData", LoginSchema);
