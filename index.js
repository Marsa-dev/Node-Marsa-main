require("express-async-errors");
require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const https = require("https");
const http = require("http");
const cors = require("cors");
const fs = require("fs");

const connectDB = require("./config/db.config");
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

const app = express();

app.use(cors());
const webhookController = require("./controllers/payment.controller");

app.use(morgan("dev"));
app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  webhookController.stripeCallBack
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send(
    "<h1 style='display: flex; justify-content: center;  align-items: center; font-size:9rem; margin-top:16rem;'>Welcome to Marsa API server.</h1>"
  );
});

app.use("/api", require("./routes"));

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
};

let server;

if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/marsa-app.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/marsa-app.com/fullchain.pem"),
  };

  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const port = process.env.PORT || 8900;
server.listen(port, () =>
  console.log(`Server is running and listenning on ${port}`)
);

start();
