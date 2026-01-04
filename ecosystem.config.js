module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: 'src/bot/server.js',
      cwd: '/var/www/telegram-bot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false
    },
    {
      name: 'telegram-api',
      script: 'src/api/server.js',
      cwd: '/var/www/telegram-bot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false
    }
    // Uncomment nếu cần chạy listener
    // {
    //   name: 'telegram-listener',
    //   script: 'src/listener/index.js',
    //   cwd: '/var/www/telegram-bot',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   env: {
    //     NODE_ENV: 'production'
    //   },
    //   error_file: './logs/listener-error.log',
    //   out_file: './logs/listener-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   merge_logs: true,
    //   autorestart: true,
    //   max_restarts: 10,
    //   min_uptime: '10s',
    //   watch: false
    // }
  ]
};

