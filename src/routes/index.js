const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.routes");
const employeeRoutes = require("../modules/employee/employee.routes");
const hierarchyRoutes = require("../modules/hierarchy/hierarchy.routes");
const userRoutes = require("../modules/user/user.routes");
const departmentRoutes = require("../modules/department/department.routes");
const teamRoutes = require("../modules/team/team.routes");
const permissionRoutes = require("../modules/permission/permission/permission.routes");
const rolePermissionsRoutes = require("../modules/permission/rolePermission/rolePermission.routes");
const accessControlList=require("../modules/permission/acl/acl.routes");
const documentRoutes = require("../modules/document/document.routes");
const workflowRoutes = require("../modules/workflow/workflow.routes");

const auditRoutes = require("../modules/audit/audit.routes");


router.use("/auth", authRoutes);
router.use("/employee", employeeRoutes);
router.use("/hierarchy", hierarchyRoutes);
router.use("/user", userRoutes);
router.use("/department", departmentRoutes);
router.use("/team", teamRoutes);
router.use('/permission', permissionRoutes);
router.use('/role-permission', rolePermissionsRoutes);
router.use('/acl', accessControlList)
router.use("/document", documentRoutes);
router.use("/workflow",workflowRoutes);
router.use("/audit",auditRoutes);


module.exports = router;

