// PM2 process file — usage:  pm2 start ecosystem.config.js
// Runtime settings (DATABASE_URL, PORT, …) are read from .env in this folder.
module.exports = {
  apps: [
    {
      name: 'worklog-todo',
      script: 'server/index.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3002,
      max_memory_restart: '300M',
      kill_timeout: 10000,
      time: true, // timestamp log lines
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
