import { Hono } from "hono";
import register from "./auth/register";
import login from "./auth/login";
import getUser from "./auth/getUser";

import {default as notes} from "../controllers/notes/notes"
const notemy = new Hono();
notemy.route("/register", register);
notemy.route("/login", login);
notemy.route("/me", getUser);

notemy.route("/notes", notes)

export default notemy;
