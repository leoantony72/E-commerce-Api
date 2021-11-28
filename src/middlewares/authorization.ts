import { Request, Response, NextFunction } from "express";
const client = require("../config/database");

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
export async function Managervalidate(
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
      if (result.rows[0].user_role === "ADMIN" || "Manager") {
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
    const query = "SELECT user_role FROM users WHERE userid = $1";
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

export async function Shippervalidate(
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
      if (result.rows[0].user_role === "ADMIN" || "Manager" || "Shipper") {
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

export function isLoggedIn(req: Request) {
  if (req.session.newsession) return true;
  else return false;
}

export function logout(req: Request, res: Response) {
  // destroy user session
  req.session.destroy((err) => {
    // if err, then return to Home page
    if (err) return res.redirect("/");

    // clear out cookies
    res.clearCookie("SESSION");

    // return to Login page
    return res.redirect("/api/err/sessiontimout");
  });
}

export async function active(req: Request, res: Response, next: NextFunction) {
  // check if user isloggedIn
  if (isLoggedIn(req) === true) {
    // get time stamp NOW
    const now = Date.now();
    const twentyfive: number = 3600000 * 60 * 10;
    //console.log("this one ", Date.now() - 3600000 * 60 * 10);
    // get time stamp BEFORE (the one created once the user loggedIn)
    const createdAt = req.session.createdAt;

    // check if user already exceed (active/non-active) time in the system
    if (now > createdAt + twentyfive) {
      return await logout(req, res);
    }
  }
  next();
}
