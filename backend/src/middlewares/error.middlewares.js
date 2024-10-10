import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  console.log("Error received in handler:", err); // Log the error

  let error = err;

  // If it's not an instance of ApiError, create a new ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error.errors || [], error.stack);
  }

  // Construct the response object
  const response = {
    statusCode: error.statusCode,
    message: error.message,
    errors: error.error || null,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };
  console.log(response);
  // Send the error response
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
