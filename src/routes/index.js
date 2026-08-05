const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.routes");
const employeeRoutes= require("../modules/employee/employee.routes")
const hierarchyRoutes =require("../modules/hierarchy/hierarchy.routes")
const userRoutes = require("../modules/user/user.routes")


router.use("/auth", authRoutes);
router.use("/employee" ,employeeRoutes)
router.use("/hierarchy", hierarchyRoutes);
router.use("/user", userRoutes)


module.exports = router;