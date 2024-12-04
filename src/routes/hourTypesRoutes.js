import express from "express";
const router = express.Router();

import addHourTypeController from "../controllers/addHourTypeController.js";
import hourTypeSchema from "../joi-schema-validator/hourTypeSchema.js";
import validate from "../middleware/validate.js";

export default router.post('/hour-type', validate(hourTypeSchema), addHourTypeController);