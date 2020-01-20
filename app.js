const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression')

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const checkoutRouter = require('./routes/checkoutRouter')
const viewRouter = require('./routes/viewRoutes');

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//Serving static files
app.use(express.static(path.join(__dirname, 'public')))

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

app.use(compression())

app.use((req, res, next) => {
    // console.log('Hello from middleware 😁')
    req.requestTime = new Date().toISOString()
    console.log(req.cookies, 'These are cookies')
    next()
})

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

app.use(cookieParser());
app.enable('trust proxy');




//Routes
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/checkout', checkoutRouter)

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

