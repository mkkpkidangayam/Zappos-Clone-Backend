const dotenv = require("dotenv");
dotenv.config({ path: "./Config/.env" });
const express = require("express");
const cors = require("cors");
const app = express();
const databaseConnect = require("./Config/dbConnection");
const cookieParser = require("cookie-parser");
const customerRoute = require("./Routes/CustomerRoute");
const errorHandler = require("./Middleware/errorHandler");
const adminRoute = require("./Routes/adminRout");
const productRoute = require("./Routes/productRote");

databaseConnect();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://mkkp-zappos.vercel.app",
    // origin: "http://localhost:3000",
    credentials: true,
  })
);

// Cron-job--------------------------------
app.get('/run-scheduled-task', async (req, res) => {
  try {
      await performScheduledTask(); 
      res.send('Cron job executed');
  } catch (error) {
      res.status(500).send('Error executing cron job');
  }
});

const performScheduledTask = async () => {
  console.log('Scheduled task executed');
};
 
app.use("/api", customerRoute);

app.use("/api", adminRoute);

app.use("/api", productRoute);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
