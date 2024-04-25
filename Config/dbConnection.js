const tryCatchHandler = require("../Middleware/trycatchHandler");
const mongoose = require("mongoose");

const databaseConnect = tryCatchHandler(async () => {
  const connect = await mongoose.connect(process.env.MONGO_DB_URL);
  if (connect) {
    console.log(
      `Database connected on ${connect.connection.host} - ${connect.connection.name}`
    );
  } else {
    console.log("Can't connect to database");
  }
});
module.exports = databaseConnect;
