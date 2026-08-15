const { processWorkflowEscalations } = require("./workflow.service");

const INTERVAL_MINUTES = Number(
  process.env.WORKFLOW_ESCALATION_CHECK_MINUTES || 5
);

let schedulerStarted = false;

const startWorkflowEscalationScheduler = () => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  const intervalMs = Math.max(INTERVAL_MINUTES, 1) * 60 * 1000;

  const run = async () => {
    try {
      await processWorkflowEscalations();
    } catch (error) {
      // Do not crash the API process because of a scheduler failure.
      console.error("Workflow escalation scheduler error:", error.message);
    }
  };

  // Run once when the application starts, then periodically.
  run();
  setInterval(run, intervalMs);
};

module.exports = {
  startWorkflowEscalationScheduler,
};
