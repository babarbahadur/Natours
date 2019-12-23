// First API using express 
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {
//     res
//     .status(200)
//     .json({message: 'Success', app: 'Coding'})
// })

// const port = 3000
// app.listen(3000, () => {
//     console.log('Server listening')
// })

////////////////////////////////////////////////////////////////

const express = require('express')
const app = express()
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

app.use(express.json())
app.use(express.static(__dirname + '/public'))

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
    app.use((req, res, next) => {
        console.log('Hello from middleware 😁')
        req.requestTime = new Date().toISOString()
        next()
    })
}



app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app

