import { RequestHandler, ErrorRequestHandler } from "express";

export const serverError: ErrorRequestHandler = (err, req, res, next) => {
    // Handle "SyntaxError: Unexpected end of JSON input"
    if (err instanceof SyntaxError) {
      return res.status(400).json({ message: "Bad Request" });
    }
  
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  };