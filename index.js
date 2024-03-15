const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const databaseConnect = require("./Config/dbConnection");
const cookieParser = require("cookie-parser");
const customerRoute = require("./Routes/CustomerRoute");
const errorHandler = require("./Middleware/errorHandler");
const adminRoute = require("./Routes/adminRout");
const productRoute = require("./Routes/productRote");
dotenv.config({ path: "./Config/.env" });

databaseConnect();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api", customerRoute);

app.use("/api", adminRoute);

app.use("/api", productRoute);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
