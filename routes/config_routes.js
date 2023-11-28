// 4
const indexR = require("./index");
const usersR = require("./users");
const countriesR = require("./countries");

exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users",usersR);
  app.use("/countries",countriesR);
}