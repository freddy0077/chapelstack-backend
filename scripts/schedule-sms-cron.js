// This script is intended to be run by a system cron job or process manager every minute.
const { exec } = require('child_process');
const path = require('path');

// Path to the ts-node executable and the scheduled SMS processor
const tsNode = path.resolve(__dirname, '../node_modules/.bin/ts-node');
const processor = path.resolve(
  __dirname,
  '../src/communications/queue/scheduled-sms.processor.ts',
);

exec(`${tsNode} ${processor}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`[schedule-sms-cron] Error:`, error);
    return;
  }
  if (stdout) console.log(`[schedule-sms-cron]`, stdout.trim());
  if (stderr) console.error(`[schedule-sms-cron]`, stderr.trim());
});
