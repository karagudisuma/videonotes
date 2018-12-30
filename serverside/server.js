const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const VideoData = require("./data");
const path = require('path');

const API_PORT = 3001;
const app = express();
const router = express.Router();

// this is our MongoDB database
const dbRoute = "mongodb://admin:password123@ds151222.mlab.com:51222/videonotes";

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

let staticPath = (path.resolve(__dirname + '/../public'));
app.use(express.static(staticPath));

let hPath = (path.resolve(__dirname + '/../index.html'));
app.get('/', (req, res) => res.sendFile(hPath));

// this is our get method
// this method fetches all available data in our database
router.get("/getData", (req, res) => {
  VideoData.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({data});
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
  const { id, update } = req.body;
  VideoData.findOneAndUpdate(id, update, err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  VideoData.findOneAndDelete(id, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// this is our create method
// this method adds new data in our database
router.post("/putData", (req, res) => {
  //console.log(`putData:  ${JSON.stringify(req.body)}`);
  console.log(`VideoSchemaData: ${VideoData}`);
  if (!req.body) {
    return res.json({
      success: false,
      error: "INVALID INPUTS"
    });
  }
  let data = new VideoData({
     url:  req.body.url,
     attacherNotes: req.body.attacherNotes
  })
  
  console.log(`data: ${JSON.stringify(data)}`);
  data.save(err => {
    if (err) {
      console.log("In error");
      return res.json({ success: false, error: err });
    }   
    else{
      console.log("Data inserted");
      return res.json({ success: true });
    }
  });
});


// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

