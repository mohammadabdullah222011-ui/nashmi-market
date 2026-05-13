import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import ordersRouter from "./orders.js";
import dashboardRouter from "./dashboard.js";
import usersRouter from "./users-fixed.js";
import notificationsRouter from "./notifications.js";
import settingsRouter from "./settings.js";
import contactRouter from "./contact.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(notificationsRouter);
router.use(settingsRouter);
router.use(contactRouter);

export default router;