const aclService = require("./acl.service");

const createACL = async (
  req,
  res,
  next
) => {
  try {
    const acl = await aclService.createACL(
      req.body,
      req.user?._id
    );

    return res.status(201).json({
      success: true,
      message: "ACL created successfully.",
      data: acl,
    });
  } catch (error) {
    next(error);
  }
};

const getACLs = async (
  req,
  res,
  next
) => {
  try {
    const acls = await aclService.getACLs(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "ACLs fetched successfully.",
      data: acls,
    });
  } catch (error) {
    next(error);
  }
};

const getACLById = async (
  req,
  res,
  next
) => {
  try {
    const acl = await aclService.getACLById(
      req.params.aclId
    );

    return res.status(200).json({
      success: true,
      message: "ACL fetched successfully.",
      data: acl,
    });
  } catch (error) {
    next(error);
  }
};

const updateACL = async (
  req,
  res,
  next
) => {
  try {
    const acl = await aclService.updateACL(
      req.params.aclId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "ACL updated successfully.",
      data: acl,
    });
  } catch (error) {
    next(error);
  }
};

const updateACLStatus = async (
  req,
  res,
  next
) => {
  try {
    const acl =
      await aclService.updateACLStatus(
        req.params.aclId,
        req.body.status
      );

    return res.status(200).json({
      success: true,
      message:
        "ACL status updated successfully.",
      data: acl,
    });
  } catch (error) {
    next(error);
  }
};

const deleteACL = async (
  req,
  res,
  next
) => {
  try {
    await aclService.deleteACL(
      req.params.aclId
    );

    return res.status(200).json({
      success: true,
      message: "ACL deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createACL,
  getACLs,
  getACLById,
  updateACL,
  updateACLStatus,
  deleteACL,
};