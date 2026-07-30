const errorMiddleware = (err, req, res, next) => {

    console.error(err.name);
    console.error(err.message);


    const statusCode = err.statusCode || 500;


    res.status(statusCode).json({

        success: false,

        errorName: err.name || "InternalServerError",

        message: err.message || "Something went wrong",

        errors: err.errors || []

    });

};


module.exports = errorMiddleware;