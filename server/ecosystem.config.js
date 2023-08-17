/**
 * @description pm2 configuration file.
 * @example
 *  production mode :: pm2 start ecosystem.config.js --only prod
 *  development mode :: pm2 start ecosystem.config.js --only dev
 */
module.exports = {
  apps: [
    {
      name: 'app',
      script: 'dist/server.js',
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      merge_logs: true,
      output: './logs/app_access.log',
      error: './logs/app_error.log',
      env: {
        PORT: 5000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'socket',
      script: 'dist/server.js',
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      merge_logs: true,
      output: './logs/socket_access.log',
      error: './logs/socket_error.log',
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: 'user',
      host: '0.0.0.0',
      ref: 'origin/main',
      repo: 'git@github.com:repo.git',
      path: 'dist/server.js',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --only prod',
    },
  },
};
