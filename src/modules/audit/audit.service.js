const AuditLog = require("./audit.model");

const createAuditLog = async ({
  module,
  action,
  actor = null,
  actorEmail = null,
  targetId = null,
  targetType = null,
  description,
  metadata = {},
  req = null,
}) => {
  try {
    return await AuditLog.create({
      module,
      action,
      actor,
      actorEmail,
      targetId,
      targetType,
      description,
      metadata,

      ipAddress:
        req?.ip ||
        req?.headers?.["x-forwarded-for"] ||
        null,

      userAgent:
        req?.headers?.["user-agent"] || null,
    });
  } catch (error) {
    // Audit failure should not break the main business operation.
    console.error("AUDIT LOG ERROR:", error.message);

    return null;
  }
};

const getAuditLogs = async (filters = {}) => {
  const query = {};

  if (filters.module) {
    query.module = filters.module.toUpperCase();
  }

  if (filters.action) {
    query.action = filters.action.toUpperCase();
  }

  if (filters.actor) {
    query.actor = filters.actor;
  }

  if (filters.targetId) {
    query.targetId = filters.targetId;
  }

  if (filters.targetType) {
    query.targetType = filters.targetType;
  }

  if (filters.from || filters.to) {
    query.createdAt = {};

    if (filters.from) {
      query.createdAt.$gte =
        new Date(filters.from);
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);

      query.createdAt.$lte = toDate;
    }
  }

  const page =
    Math.max(
      parseInt(filters.page) || 1,
      1
    );

  const limit =
    Math.min(
      Math.max(
        parseInt(filters.limit) || 20,
        1
      ),
      100
    );

  const skip =
    (page - 1) * limit;

  const [logs, total] =
    await Promise.all([
      AuditLog.find(query)
        .populate(
          "actor",
          "_id email employeeId"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      AuditLog.countDocuments(query),
    ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createAuditLog,
  getAuditLogs
};