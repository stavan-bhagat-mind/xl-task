const LoggerMiddleware = (req, res, next) => {
    // Here we can access and modify the request and response object before it gets to the main controller function
    console.log("Logging from middleware");
    next();
};

module.exports = {LoggerMiddleware};
