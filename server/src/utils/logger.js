/**
 * Server logging utility
 * Provides structured, timestamped logs for authentication, requests, and system events.
 */

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta) => {
    const metaStr = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    console.log(`[${getTimestamp()}] [INFO] ${message}${metaStr}`);
  },

  warn: (message, meta) => {
    const metaStr = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    console.warn(`[${getTimestamp()}] [WARN] ${message}${metaStr}`);
  },

  error: (message, meta) => {
    const metaStr = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    console.error(`[${getTimestamp()}] [ERROR] ${message}${metaStr}`);
  },

  auth: {
    loginSuccess: (email, role, userId) => {
      console.log(
        `[${getTimestamp()}] [AUTH:SUCCESS] User login successful - Email: "${email}" | Role: ${role} | UserID: ${userId}`
      );
    },

    loginFailure: (email, reason, ip) => {
      const ipStr = ip ? ` | IP: ${ip}` : '';
      console.warn(
        `[${getTimestamp()}] [AUTH:FAILURE] User login failed - Email: "${email || 'unspecified'}" | Reason: ${reason}${ipStr}`
      );
    },

    registerSuccess: (email, role, userId) => {
      console.log(
        `[${getTimestamp()}] [AUTH:SUCCESS] User registration successful - Email: "${email}" | Role: ${role} | UserID: ${userId}`
      );
    },

    registerFailure: (email, reason, ip) => {
      const ipStr = ip ? ` | IP: ${ip}` : '';
      console.warn(
        `[${getTimestamp()}] [AUTH:FAILURE] User registration failed - Email: "${email || 'unspecified'}" | Reason: ${reason}${ipStr}`
      );
    },

    authDenied: (reason, path, method, ip) => {
      const ipStr = ip ? ` | IP: ${ip}` : '';
      console.warn(
        `[${getTimestamp()}] [AUTH:DENIED] Authentication failed - Reason: ${reason} | Endpoint: ${method} ${path}${ipStr}`
      );
    },

    forbidden: (userId, userRole, requiredRoles, path, method) => {
      console.warn(
        `[${getTimestamp()}] [AUTH:FORBIDDEN] Access forbidden - UserID: ${userId || 'unknown'} (Role: ${userRole}) attempted ${method} ${path} | Required: [${requiredRoles.join(', ')}]`
      );
    },
  },
};

export default logger;
