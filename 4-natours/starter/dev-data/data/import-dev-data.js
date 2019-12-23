const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const Tour = require('./../../model/tourModel')


dotenv.config({ path: './config.env' });
// const local = process.env.DATABASE_LOCAL
// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose
  .connect("mongodb://babar_bahadur:babar1996@natours-app-shard-00-00-ybksz.mongodb.net:27017,natours-app-shard-00-01-ybksz.mongodb.net:27017,natours-app-shard-00-02-ybksz.mongodb.net:27017/natours?ssl=true&replicaSet=natours-app-shard-0&authSource=admin&retryWrites=true", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful ❤️!'));

const Tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))


const importData = async () => {
  try {
    await Tour.create(Tours)
    console.log('Data loaded successfully')
  }
  catch (err) {
    console.log(err)
  }
  process.exit();
}

const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data deleted successfully')
  }
  catch (err) {
    console.log(err)
  }
  process.exit();
}

if(process.argv[2] === '--load') {
  importData()

} else if(process.argv[2] === '--delete') {
  deleteData()
}

console.log(process.argv)
