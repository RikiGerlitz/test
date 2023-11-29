// 4
const indexR = require("./index");
const usersR = require("./users");
const countriesR = require("./countries");
const cakesR = require("./cakes");

exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users",usersR);
  app.use("/countries",countriesR);
  app.use("/cakes",cakesR);
}