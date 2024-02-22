const { tryCatch } = require("../Middleware/trycatchHandler");
const mongoose = require("mongoose");

const databaseConnect = tryCatch(async () => {
  const connect = await mongoose.connect(process.env.MONGO_DB_URL);
  console.log(
    `Database connected on ${connect.connection.host} - ${connect.connection.name}`
  );
});
module.exports = databaseConnect;
