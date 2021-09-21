import express, { Request, Response, NextFunction } from "express";
const client = require("../config/database");
const { redis } = require("../config/redis");

export async function Adminvalidate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sess = req.session.newsession;
  const userid = req.session.userid;
  if (!sess) {
    next({
      status: 403,
      message: "You Stepped In The Wrong Path",
    });
  } else {
    const query = "SELECT user_role FROM users WHERE userid = $1";
    const result = await client.query(query, [userid]);
    if (result.rowCount === 0) {
      next({
        status: 403,
        message: "You Stepped In The Wrong Path",
      });
    } else {
      if (result.rows[0].user_role === "ADMIN") {
        next();
      } else {
        next({
          status: 403,
          message: "You Stepped In The Wrong Path",
        });
      }
    }
  }
}

export async function Usersvalidate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sess = req.session.newsession;
  const userid = req.session.userid;
  if (!req.session.newsession) {
    next({
      status: 401,
      message: "Please Login To Use This Feature",
    });
  } else {
    const query = "SELECT * FROM users WHERE userid = $1";
    const result = await client.query(query, [userid]);
    if (result.rowCount === 0) {
      next({
        status: 401,
        message: "Please Login To Use This Feature",
      });
    } else {
      if (result.rows[0].user_role === "USER" || "ADMIN") {
        next();
      } else {
        next({
          status: 401,
          message: "Please Login To Use This Feature",
        });
      }
    }
  }
}
