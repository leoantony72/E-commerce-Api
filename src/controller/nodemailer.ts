import express, { NextFunction, Request, response, Response } from "express";
const nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

//Send Email Verification
module.exports.sendEmailVerification = async (email: string, token: string) => {
  const link = `http://localhost:${process.env.PORT}/api/verify/?vif=` + token;

  const mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: any;
  } = {
    from: "apiblogbackend@gmail.com",
    to: email,
    subject: "Please confirm your Email account",
    html: `<html>
    <head>
      <style type="text/css">
        body, p, div {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 14px;
        }
        a {
          text-decoration: none;
        }
      </style>
      <title></title>
    </head>
    <body>
    <center>
      <p><a href=${link}>Click Here To Verify Your Email</a></p>
    </center>
    </body>
  </html></a>`,
  };
  smtpTransport.sendMail(mailOptions, function (error: any, res: any) {
    if (error) {
      res.end("error");
    } else {
      res.status(200).json({ success: "User created successfully" });
    }
  });
};

//Reset password
module.exports.sendResetPassword = async (
  email: string,
  token: string,
  userid: string
) => {
  const link =
    `http://localhost:${process.env.PORT}/api/auth/reset-password/?rec=` +
    token +
    `&id=` +
    userid;

  const mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: any;
  } = {
    from: "apiblogbackend@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `<html>
    <head>
      <style type="text/css">
        body, p, div {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 14px;
        }
        a {
          text-decoration: none;
        }
      </style>
      <title></title>
    </head>
    <body>
    <center>
      <p><a href=${link}>Click Here To Reset your Password</a></p>
    </center>
    </body>
  </html></a>`,
  };
  smtpTransport.sendMail(mailOptions, function (error: any, res: any) {
    if (error) {
      res.end("error");
    } 
  });
};

//Login Alert
module.exports.sendLoginalert = async (email: string) => {
  const link = `http://localhost:${process.env.PORT}/api/auth/forgotpassword`;

  const mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: any;
  } = {
    from: "apiblogbackend@gmail.com",
    to: email,
    subject: "New Login Alert",
    html: `<html>
    <head>
      <style type="text/css">
        body, p, div {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 14px;
        }
        a {
          text-decoration: none;
        }
      </style>
      <title></title>
    </head>
    <body>
    <center>
      <p>Someone Just Logged Into Your Account,If It Isn't You Who Logged In Please Click The link Below To change The Password</p>
      <p><a href=${link}>Click here To reset password</a></p> 
    </center>
    </body>
  </html></a>`,
  };
  smtpTransport.sendMail(mailOptions, function (error: any, res: any) {
    if (error) {
      res.end("error");
    } else {
      res.status(200).json({ success: "User created successfully" });
    }
  });
};
