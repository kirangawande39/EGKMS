const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.routes");
const employeeRoutes= require("../modules/employee/employee.routes")
const hierarchyRoutes =require("../modules/hierarchy/hierarchy.routes")


router.use("/auth", authRoutes);
router.use("/employee" ,employeeRoutes)
router.use("/hierarchy", hierarchyRoutes);


module.exports = router;