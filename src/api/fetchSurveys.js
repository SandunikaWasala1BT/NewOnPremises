import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_AZURE_SURVEYS_FUNCTION_URL,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    code: import.meta.env.VITE_AZURE_SURVEYS_FUNCTION_API_CODE,
  },
});

export const fetchSurveys = async (newOrigin) => {
  try {
    const response = await api.post("", { newOrigin });
    if (response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch surveys");
    }
  } catch (error) {
    console.error("Error fetching surveys:", error);
    throw error;
  }
};
