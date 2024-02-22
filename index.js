const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
dotenv.config({ path: "./Config/.env" });
const databaseConnect = require("./Config/dbConnection");
const CustomerModel = require('./Models/customerModel')

databaseConnect();

app.use(express.json());
app.use(cors());


app.post('/register', (req, res) => {
    CustomerModel.create(req.body)
    .then(customer => res.json(customer))
    .catch(err => res.json  (err))
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
