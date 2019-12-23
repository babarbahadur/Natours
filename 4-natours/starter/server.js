const dotenv = require('dotenv')
var mongodb = require('mongodb');
const mongoose = require('mongoose')
dotenv.config({path: './config.env'})
const app = require('./app')

const local = process.env.DATABASE_LOCAL
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose
  .connect("mongodb://babar_bahadur:babar1996@natours-app-shard-00-00-ybksz.mongodb.net:27017,natours-app-shard-00-01-ybksz.mongodb.net:27017,natours-app-shard-00-02-ybksz.mongodb.net:27017/natours?ssl=true&replicaSet=natours-app-shard-0&authSource=admin&retryWrites=true", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful ❤️!'));



// const newTour = Tour({
//     name: 'Main Coder',
//     rating: 3,
//     price: 400
// })

// newTour.save().then(doc => console.log(doc)).catch(err => console.log('Fucking error ❌', err._message));



// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb://babar_bahadur:babar1996@natours-app-ybksz.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   //const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log("connection established");
//   client.close();
// });





const port = process.env.PORT || 3000

// console.log(process.env)
app.listen(port, () => {
    console.log('Server listening')
})