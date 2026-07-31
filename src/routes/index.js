const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.routes");
const employeeRoutes= require("../modules/employee/employee.routes")


router.use("/auth", authRoutes);
router.use("/employee" ,employeeRoutes)


module.exports = router;