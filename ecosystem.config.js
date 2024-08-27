module.exports = {
  apps: [
    {
      name: "SDClassics",  // The name of your application
      script: "./src/app.js",  // The entry point of your application
      instances: 1,  // Number of instances to run
      exec_mode: "fork",  // Execution mode, 'fork' or 'cluster'
      env: {
        NODE_ENV: "development",
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        SESSION_SECRET: process.env.SESSION_SECRET,
        BASE_URL: process.env.BASE_URL,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
        ADMIN_USER_ID: process.env.ADMIN_USER_ID,
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        SESSION_SECRET: process.env.SESSION_SECRET,
        BASE_URL: process.env.BASE_URL,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
        ADMIN_USER_ID: process.env.ADMIN_USER_ID,
        PORT: 3000
      }
    }
  ]
};

