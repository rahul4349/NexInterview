export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPLOAD_IMAGE: "/api/auth/upload-image",
    SEND_OTP: "/api/auth/send-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  SESSION: {
    CREATE: "/api/sessions/create",
    GET_ALL: "/api/sessions/my-sessions",
    GET_BY_ID: (id) => `/api/sessions/${id}`,
    DELETE: (id) => `/api/sessions/${id}`,
  },
  QUESTION: {
    ADD_TO_SESSION: "/api/question/add-to-session",
    PIN: (id) => `/api/question/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/question/${id}/note`,
  },
  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-question",
    GENERATE_EXPLANATION: "/api/ai/generate-explanation",
        GENERATE_FEEDBACK: "/api/ai/generate-feedback",  

  },
};