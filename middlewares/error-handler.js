const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went wrong try again later",
  };
  // console.log("err", err);
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  if (err.code && err.code === 11000) {
    // 11000 is an error code for duplcate email
    customError.msg = `${Object.keys(err.keyValue)} already exists.`;
    customError.statusCode = 400;
  }
  if (err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = 404;
  }

  return res
    .status(customError.statusCode)
    .json({ success: false, message: customError.msg });
};

module.exports = errorHandlerMiddleware;
