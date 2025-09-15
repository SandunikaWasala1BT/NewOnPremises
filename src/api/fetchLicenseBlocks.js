import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_AZURE_LICENSE_BLOCK_FUNCTION_URL,
  method: "POST",
  params: {
    code: import.meta.env.VITE_AZURE_LICENSE_BLOCK_FUNCTION_API_CODE,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchLicenseBlocks = async (newOriginURL, surveySlogan) => {
  try {
    const response = await api.post("", { originURL: newOriginURL });
    if (response.data) {
      return response.data;
    } else {
      var surveyQuestionModule = await import(
        `${import.meta.env.VITE_AZURE_BLOB_URL}/${surveySlogan}/index.js`
      );
      if (surveyQuestionModule && surveyQuestionModule.surveyQuestionsJSON) {
        return JSON.parse(surveyQuestionModule.surveyQuestionsJSON);
      }
    }
    throw new Error("Neither data from dataverse nor blob file were found");
  } catch (error) {
    console.error("Error fetching license blocks:", error);
    throw error;
  }
};
