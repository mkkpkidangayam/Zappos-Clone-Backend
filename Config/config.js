
// module.exports = {
//     email: {
//       user: process.env.Nodemail_email, 
//       pass: process.env.Nodemail_password,
//       // user: "mkkpkdm@gmail.com", 
//       // pass: "jgmz feea dzht phnx",   
//     },
//   };  

  require("dotenv").config();

module.exports = {
  email: {
    user: process.env.Nodemail_email,
    pass: process.env.Nodemail_password,
  },
};
