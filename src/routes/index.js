const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.routes");
const employeeRoutes = require("../modules/employee/employee.routes");
const hierarchyRoutes = require("../modules/hierarchy/hierarchy.routes");
const userRoutes = require("../modules/user/user.routes");
const departmentRoutes = require("../modules/department/department.routes");
const teamRoutes = require("../modules/team/team.routes")


router.use("/auth", authRoutes);
router.use("/employee", employeeRoutes);
router.use("/hierarchy", hierarchyRoutes);
router.use("/user", userRoutes);
router.use("/department", departmentRoutes);
router.use("/team",teamRoutes);


module.exports = router;

