import axios from "axios";
import { styleConfig } from "../style.config";

const api = axios.create({
  baseURL: import.meta.env.VITE_AZURE_DEFAULT_STYLE_FUNCTION_URL,
  method: "POST",
  params: {
    code: import.meta.env.VITE_AZURE_DEFAULT_STYLE_FUNCTION_API_CODE,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchDefaultStyles = async (newOriginURL) => {
  try {
    const response = await api.post("", { originURL: newOriginURL });
    if (response.data) {
      var styleDataList = response.data;
      // document.documentElement.style.setProperty("--progress-bar-color", "red");
      // Create a new <style> element
      var styleElement = document.createElement("style");
      styleElement.setAttribute("type", "text/css");
      document.getElementsByTagName("head")[0].appendChild(styleElement);

      console.log(styleDataList);
      styleDataList.forEach(function (styleData) {
        var updateElement = styleConfig.find(
          (configItem) => configItem.v1 === styleData.cssselector
        );
        if (updateElement) {
          styleData.cssselector = updateElement.v2;
        }
        var cssRule;
        if (styleData.propertytype === "box-shadow") {
          // Handle box-shadow specially
          var propertyvalue = styleData.propertyvalue;
          var newcolor = styleData.newcolor;

          // Find the first occurrence of var() and replace the color inside it
          var regex = /var\(([^,]+),\s*#[0-9a-fA-F]{6}\)/;
          var match = regex.exec(propertyvalue);
          if (match) {
            var newPropertyValue = propertyvalue.replace(
              match[0],
              `var(${match[1]}, ${newcolor})`
            );
            cssRule = `${styleData.cssselector} { ${styleData.propertytype}: ${newPropertyValue} !important;}`;
          } else {
            cssRule = `${styleData.cssselector} { ${styleData.propertytype}: ${styleData.newcolor} !important;}`;
          }
        } else {
          propertyvalue = styleData.propertyvalue;
          newcolor = styleData.newcolor;

          // Find the first occurrence of var() and replace the color inside it
          //var regex = /var\(([^,]+),\s*#[0-9a-fA-F]{6}\)/;
          regex = /var\(\s*(--[^,\s]+)\s*,\s*(#[0-9a-fA-F]{3,6})\s*\)/;
          match = regex.exec(propertyvalue);
          if (match) {
            newPropertyValue = propertyvalue.replace(
              match[0],
              `var(${match[1]}, ${newcolor})`
            );
            cssRule = `${styleData.cssselector} { ${styleData.propertytype}: ${newPropertyValue} !important;}`;
          } else {
            cssRule = `${styleData.cssselector} { ${styleData.propertytype}: ${styleData.newcolor} !important;}`;
          }

          //cssRule = `${styleData.cssselector} { ${styleData.propertytype}: ${styleData.newcolor} !important;}`;
        }
        console.log("cssRule:", cssRule);
        styleElement.appendChild(document.createTextNode(cssRule));

        // Append defaultV2.min.css file to the head after applying the styles
        // var link = document.createElement("link");
        // link.rel = "stylesheet";
        // link.type = "text/css";
        // link.href = "defaultV2.min.css";
        // document.getElementsByTagName("head")[0].appendChild(link);
      });
      return;
    }
    console.warn("No default styles found");
  } catch (error) {
    console.error("Error fetching default styles:", error);
    throw error;
  }
};

export async function checkIfCustomCSSFileExists(url) {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    if (error.response) {
      // File doesn't exist (404) or other HTTP error
      return false;
    }
    // Network error
    console.log("Error checking file:", error.message);
    return false;
  }
}
