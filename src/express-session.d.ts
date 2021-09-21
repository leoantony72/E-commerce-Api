import session from "express-session";

declare module "express-session" {
  export interface Session {
    newsession: string;
    viewcount: number;
    userid: string;
    createdAt: any;
  }
}
