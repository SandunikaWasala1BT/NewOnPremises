/* eslint-disable no-undef */
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
      throw new Error("Dataverse don't have data for given url");
    }
  } catch (error) {
    if (error.response.data === "Dataverse don't have data for given url") {
      return await fetchLicenseBlocksFromBlob(surveySlogan);
    }
    console.error("Error fetching license blocks:", error);
    throw error;
  }
};

async function fetchLicenseBlocksFromBlob(surveySlogan) {
  try {
    var surveyQuestionModule = await import(
      `${
        import.meta.env.VITE_AZURE_BLOB_URL
      }/${surveySlogan}/surveyQuestionJSON.js`
    );
    if (surveyQuestionModule && surveyQuestionModule.surveyQuestionsJSON) {
      return surveyQuestionModule.surveyQuestionsJSON;
    }
  } catch (error) {
    console.error("Error fetching license blocks from blob:", error);
    throw error;
  }
}

// export async function checkLicensingBlock() {
//   // Encode the FetchXML
//   var fetchXml = [
//     "<fetch returntotalrecordcount='true'>",
//     "  <entity name='seer_licensingblock'>",
//     "    <link-entity name='seer_surveys' from='seer_licensingblock' to='seer_licensingblockid'>",
//     "      <attribute name='seer_licensingblock' />",
//     "      <filter>",
//     "        <condition attribute='seer_neworiginurl' operator='eq' value='https://survey-portal-uat-gxchbpcrc4fkbze3.uksouth-01.azurewebsites.net/survey/lahiru-training-bc' />",
//     "      </filter>",
//     "    </link-entity>",
//     "  </entity>",
//     "</fetch>",
//   ].join("");

//   var query = "?fetchXml=" + encodeURIComponent(fetchXml);

//   // Call Dataverse Web API
//   try {
//     const response = await fetch(
//       `https://org3ea1142d.api.crm11.dynamics.com/api/data/v9.2/seer_licensingblocks${query}`,
//       {
//         method: "GET",
//         headers: {
//           // Authorization: `Bearer ${accessToken}`,
//           "OData-MaxVersion": "4.0",
//           "OData-Version": "4.0",
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();

//     console.log("Records found: " + data.value.length);

//     if (data.value.length > 0) {
//       // Call function if records exist
//     } else {
//       // Call function if no records exist
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
