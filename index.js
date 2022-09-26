const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
require("./db/conn");
const dotenv = require("dotenv");
const path = require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config();

// const obj = {
//   name: "vishal",
//   age: 13,
// };
// const obj2 = obj;

// obj2.age = 15;
// console.log(obj2);
// console.log(obj);

app.use("/user", require("./routes/user.route"));

// app.get("/", (req, res) => {
//   res.json({ msg: "Namasthe World" });
// });

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
