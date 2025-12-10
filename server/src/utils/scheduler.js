const scheduleService = require('../services/schedule.service');

// Run daily at midnight to update overdue instalments
function startScheduler() {
  // Update overdue status every hour
  setInterval(async () => {
    try {
      await scheduleService.updateOverdueStatus();
      console.log('✅ Overdue status updated');
    } catch (error) {
      console.error('❌ Error updating overdue status:', error.message);
    }
  }, 60 * 60 * 1000); // Every hour

  // Run immediately on startup
  scheduleService.updateOverdueStatus()
    .then(() => console.log('✅ Initial overdue status update completed'))
    .catch(err => console.error('❌ Initial overdue update failed:', err.message));
}

module.exports = { startScheduler };
