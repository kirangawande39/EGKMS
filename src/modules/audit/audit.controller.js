const {
  getAuditLogs,
} = require("./audit.service");

const getAuditLogsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getAuditLogs(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogsController,
};