class AppError extends Error {
    constructor(message, statusCode, customError) {
        super(message)
        
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'Error' : 'Fail'
        this.isOperational = true;
        this.customError = customError

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError
