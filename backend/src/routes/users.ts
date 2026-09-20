import { Router } from "express";
import {
  createUser,
  deleteUser,
  getSettings,
  listActivities,
  listUsers,
  updateSettings,
  updateUserRole,
} from "../controllers/userController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createUserSchema, updateSettingsSchema, updateUserRoleSchema } from "../validators/user.js";

export const userRouter = Router();

// User management: admin only
userRouter.get("/users", authenticate, requireAdmin, listUsers);
userRouter.post("/users", authenticate, requireAdmin, validate({ body: createUserSchema }), createUser);
userRouter.patch("/users/:id/role", authenticate, requireAdmin, validate({ params: idParamSchema, body: updateUserRoleSchema }), updateUserRole);
userRouter.delete("/users/:id", authenticate, requireAdmin, validate({ params: idParamSchema }), deleteUser);

// Activity feed: any authenticated admin-panel user
userRouter.get("/activities", authenticate, listActivities);

// Settings: public read, admin write
userRouter.get("/settings", getSettings);
userRouter.put("/settings", authenticate, requireAdmin, validate({ body: updateSettingsSchema }), updateSettings);
