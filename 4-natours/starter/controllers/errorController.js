const AppError = require('./../utils/appError');

handleCastErrorDB = err => {
    const message = `${err.value} is invalid ${err.path}`
    return new AppError(message, 400);
}

handleUniqueKeyErrorDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)
    const message = `${value[0]} is not valid as it is not unique!`

    return new AppError(message, 400);
}

handleValidationsError = err => {
    const validations = Object.values(err.errors).map(err => err.message)
    const message = `Following validations errrors occured: ${validations.join(', ')}`

    return new AppError(message, 400);
}

handleForgedTokenError = () => {
    return new AppError('Provided token is not a valid token', 401)
}

handleExpiredTokenError = () => {
    return new AppError('Your token has expired! Please login again', 401)
}

handleHeaderError = () => {
    return new AppError('Header not provided', 400)
}

const developmentError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const productionError = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        //Console the error
        console.error('Error 💥', err)

        //Send generic error to user in case of development error in production environment
        res.status(500).json({
            status: 'Fail',
            message: 'Something went very wrong'
        })
    }
}


module.exports = (err, req, res, next) => {
    // console.log(err.stack)
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Error'

    if(process.env.NODE_ENV === 'development') {
        developmentError(err, res)
    } 
    else if (process.env.NODE_ENV === 'production') {
        let error = {...err}
        if(err.name === 'CastError') error = handleCastErrorDB(error)
        if(err.code === 11000) error = handleUniqueKeyErrorDB(error)
        if(err.name === "ValidationError") error = handleValidationsError(error)
        if(err.name === "JsonWebTokenError") error = handleForgedTokenError()
        if(err.name === "TokenExpiredError") error = handleExpiredTokenError()
        if(err.customError === "header") error = handleHeaderError()

        productionError(error, res)
    }
   
}
