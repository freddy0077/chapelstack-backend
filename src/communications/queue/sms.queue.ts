import { Queue } from 'bullmq';

export const smsQueue = new Queue('sms', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
