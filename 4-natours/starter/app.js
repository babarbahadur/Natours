const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

//Middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
    // app.use((req, res, next) => {
    //     console.log('Hello from middleware 😁')
    //     req.requestTime = new Date().toISOString()
    //     next()
    // })
}

app.use(express.json())
app.use(express.static(__dirname + '/public'))


//Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*',  (req, res, next) => {
 
    // const err = new Error(`${req.url} is not a valid`)
    // err.statusCode = 400
    // err.status = 'Fail'
    // next(err)

    // const err = new AppError(`${req.url} is not a valid`, 400)
    // next(err)

    next(new AppError(`Cant find ${req.url} on this server`, 404))

})

app.use(GlobalErrorHandler)



module.exports = app

