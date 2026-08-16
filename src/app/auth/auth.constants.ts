export const AUTH = {

  API: 'http://localhost:8080/api-instalaciones/v1',

  TOKEN: 'token',

  REFRESH_TOKEN: 'refreshToken',

  USER: 'user',

  ROUTES: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ACCESS_DENIED: '/auth/access-denied',
    SESSION_EXPIRED: '/auth/session-expired',
    SERVER_ERROR: '/500',
    NOT_FOUND: '/404'
  },

  PUBLIC_ENDPOINTS: [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/refresh-token'
  ]

};
