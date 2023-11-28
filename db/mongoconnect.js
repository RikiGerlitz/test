// 2
const mongoose = require('mongoose');
const {config} =require("../config/secret")

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery' , false);
    
  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster1.sly989d.mongodb.net/black23`);
  console.log("mongo connect black 22 a")
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}