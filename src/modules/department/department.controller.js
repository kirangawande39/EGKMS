const departmentService = require("./department.service");


// CREATE DEPARTMENT
const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(
      req.body,
      req.user?._id
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};


// GET ALL DEPARTMENTS
const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getDepartments(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully.",
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};


// GET DEPARTMENT BY ID
const getDepartmentById = async (req, res, next) => {
  try {
    const department =
      await departmentService.getDepartmentById(
        req.params.departmentId
      );

    return res.status(200).json({
      success: true,
      message: "Department fetched successfully.",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE DEPARTMENT
const updateDepartment = async (req, res, next) => {
  try {
    const department =
      await departmentService.updateDepartment(
        req.params.departmentId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE DEPARTMENT STATUS
const updateDepartmentStatus = async (req, res, next) => {
  try {
    const department =
      await departmentService.updateDepartmentStatus(
        req.params.departmentId,
        req.body.status
      );

    return res.status(200).json({
      success: true,
      message: "Department status updated successfully.",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE DEPARTMENT
const deleteDepartment = async (req, res, next) => {
  try {
    await departmentService.deleteDepartment(
      req.params.departmentId
    );

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
};