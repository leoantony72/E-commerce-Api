import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";

export const validation = [
  check("username")
    .exists()
    .matches(/^[A-Za-z$#%0-9\s]+$/)
    .withMessage("Name must be alphabetic.")
    .isLength({ min: 3, max: 128 })
    .withMessage("Username must be minimum 4 characters long"),
  check("email", "email is not valid").isEmail().normalizeEmail(),
  check(
    "password",
    "Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. "
  )
    .trim()
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("password must be minimum 8 length")
    .matches(/(?=.*?[a-z])/)
    .withMessage("At least one Lowercase")
    .matches(/(?=.*?[0-9])/)
    .withMessage("At least one Number")
    .matches(/(?=.*?[#!@$%^&*-])/)
    .withMessage("At least one special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("White space not allowed"),
  (req: Request, res: Response, next: NextFunction) => {
    //returns err from validation
    const errors = validationResult(req);
    const extractedErrors: any = [];
    errors
      .array({ onlyFirstError: true })
      .map((err: any) => extractedErrors.push({ [err.param]: err.msg }));
    if (!errors.isEmpty()) {
      return res.json({ error: extractedErrors });
    }
    next();
  },
];

export const Emailvalidation = [
  check("email", "email is not valid").isEmail().normalizeEmail(),

  (req: Request, res: Response, next: NextFunction) => {
    //returns err from validation
    const errors = validationResult(req);
    const extractedErrors: any = [];
    errors
      .array({ onlyFirstError: true })
      .map((err: any) => extractedErrors.push({ [err.param]: err.msg }));
    if (!errors.isEmpty()) {
      return res.json({ error: extractedErrors });
    }
    next();
  },
];

export const Loginvalidation = [
  check("username")
    .exists()
    .matches(/^[A-Za-z$#%0-9\s]+$/)
    .withMessage("Name must be alphabetic.")
    .isLength({ min: 3, max: 128 })
    .withMessage("Username must be minimum 4 characters long"),
  check("email", "email is not valid").isEmail().normalizeEmail(),
  check(
    "password",
    "Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. "
  )
    .trim()
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("password must be minimum 8 length")
    .matches(/(?=.*?[a-z])/)
    .withMessage("At least one Lowercase")
    .matches(/(?=.*?[0-9])/)
    .withMessage("At least one Number")
    .matches(/(?=.*?[#!@$%^&*-])/)
    .withMessage("At least one special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("White space not allowed"),

  (req: Request, res: Response, next: NextFunction) => {
    //returns err from validation
    const errors = validationResult(req);
    const extractedErrors: any = [];
    errors
      .array({ onlyFirstError: true })
      .map((err: any) => extractedErrors.push({ [err.param]: err.msg }));
    if (!errors.isEmpty()) {
      return res.json({ error: extractedErrors });
    }
    next();
  },
];

export const Product = [
  check("title")
    .exists()
    .matches(/^[A-Za-z$#%0-9\s]+$/)
    .withMessage("Name must be alphabetic.")
    .isLength({ min: 3, max: 128 })
    .withMessage("title must be minimum 4 characters long"),
  check("summary", "Please Provide A Summary ")
    .notEmpty()
    .withMessage("Summary required")
    .isLength({ min: 10 })
    .withMessage("Summary must be minimum 8 length"),
  check("price")
    .notEmpty()
    .withMessage("Price required")
    .isNumeric()
    .withMessage("Only Numbers allowed"),
  check("stock")
    .notEmpty()
    .withMessage("Price required")
    .isNumeric()
    .withMessage("Only Numbers allowed"),
  check("category", "Please Provide A category ")
    .notEmpty()
    .withMessage("category required")
    .isLength({ min: 2 })
    .withMessage("minimum 2 length"),
  (req: Request, res: Response, next: NextFunction) => {
    //returns err from validation
    const errors = validationResult(req);
    const extractedErrors: any = [];
    errors
      .array({ onlyFirstError: true })
      .map((err: any) => extractedErrors.push({ [err.param]: err.msg }));
    if (!errors.isEmpty()) {
      return res.json({ error: extractedErrors });
    }
    next();
  },
];

export const BillingDetails = [
  check("address_line1")
    .exists()
    .matches(/^[A-Za-z$#%0-9\s]+$/)
    .withMessage("address_line1 must be alphabetic.")
    .isLength({ min: 3, max: 275 })
    .withMessage("addresline1 Not Provided"),
  check("address_line2")
    .matches(/^[A-Za-z$#%0-9\s]+$/)
    .withMessage("address_line2 must be alphabetic.")
    .isLength({ min: 3, max: 275 })
    .withMessage("addresline2 Not Provided"),
  check("mobile")
    .notEmpty()
    .withMessage("mobile required")
    .isNumeric()
    .withMessage("Only Numbers allowed")
    .isLength({ min: 2 })
    .withMessage("minimum 2 length"),
  check("postalCode")
    .notEmpty()
    .withMessage("PostalCode required")
    .isNumeric()
    .withMessage("Only Numbers allowed")
    .isLength({ min: 2 })
    .withMessage("minimum 2 length"),
  check("city", "Please Provide A city ")
    .notEmpty()
    .withMessage("city required")
    .isLength({ min: 2 })
    .withMessage("minimum 2 length"),
  check("country", "Please Provide A country ")
    .notEmpty()
    .withMessage("country required")
    .isLength({ min: 2 })
    .withMessage("minimum 2 length"),
  (req: Request, res: Response, next: NextFunction) => {
    //returns err from validation
    const errors = validationResult(req);
    const extractedErrors: any = [];
    errors
      .array({ onlyFirstError: true })
      .map((err: any) => extractedErrors.push({ [err.param]: err.msg }));
    if (!errors.isEmpty()) {
      return res.json({ error: extractedErrors });
    }
    next();
  },
];
export const ratingDetail = [
  check("rating", "Rating must be a number between 0 and 5")
    .notEmpty()
    .withMessage("rating required")
    .isFloat({ min: 0, max: 5 }),
  check("comment")
    .notEmpty()
    .matches(/^[A-Za-z$#%0-9\s]+$/)
    .withMessage(" must be alphabetic.")
    .isLength({ min: 1, max: 300 })
    .withMessage("Comment Not Provided"),
  (req: Request, res: Response, next: NextFunction) => {
    //returns err from validation
    const errors = validationResult(req);
    const extractedErrors: any = [];
    errors
      .array({ onlyFirstError: true })
      .map((err: any) => extractedErrors.push({ [err.param]: err.msg }));
    if (!errors.isEmpty()) {
      return res.json({ error: extractedErrors });
    }
    next();
  },
];
