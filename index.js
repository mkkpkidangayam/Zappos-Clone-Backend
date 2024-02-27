const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
dotenv.config({ path: "./Config/.env" });
const databaseConnect = require("./Config/dbConnection");
const cookieParser = require("cookie-parser");
const customerRoute = require("./Routes/CustomerRoute")

databaseConnect(); 

app.use(express.json());
//app.use(cors());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());


app.use("/api", customerRoute)
 
 

 


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
