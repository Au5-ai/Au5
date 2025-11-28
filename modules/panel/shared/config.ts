export const getServerApiBaseUrl = () => {
  return process.env.API_BASE_URL || "http://localhost:1366";
};
