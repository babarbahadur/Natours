const express = require('express')
const morgan = require('morgan')
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')

const app = express()

//Set security HTTP headers
app.use(helmet())

// Data sanitization against NoSQL querry injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))

//Middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
    // app.use((req, res, next) => {
    //     console.log('Hello from middleware 😁')
    //     req.requestTime = new Date().toISOString()
    //     next()
    // })
}

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5
  });

app.use("/api/v1/users/login", apiLimiter);

//Allows the user to pass JSON objects in body
app.use(express.json({ limit: '10kb'}))

//Serving static files
app.use(express.static(__dirname + '/public'))


//Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

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

