/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.css";
import { fetchDefaultStyles } from "../api/fetchDefaultStyles";
import { fetchFontStyles } from "../api/fetchFontStyles";
import "survey-core/survey.i18n";

const SurveyRenderer = ({
  schema,
  newOriginURL,
  surveySlogan,
  surveyInfo,
  surveyQuestionJSON,
}) => {
  const model = schema ? JSON.parse(schema) : {};
  const survey = new Model(model);
  const showTitle = survey.showTitle;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fnModule, setFnModule] = useState(null);

  useEffect(() => {
    const importFnModule = async (surveySlogan) => {
      try {
        const fnModule = await import(
          `${import.meta.env.VITE_AZURE_BLOB_URL}/${surveySlogan}/index.js`
        );
        if (fnModule) {
          await fetchDefaultStyles(newOriginURL);
          await fetchFontStyles(surveySlogan);
          fnModule.setSurveyInfo(surveyInfo);
          fnModule.setSurvey(survey);
          fnModule.setLicenseBlocks(surveyQuestionJSON);
          setFnModule(fnModule);
          setLoading(false);
        }
      } catch (error) {
        setError(`Error loading module: ${error.message}`);
        setLoading(false);
        console.warn("Function module not found for:", surveySlogan);
      }
    };

    importFnModule(surveySlogan);
  }, []);

  useEffect(() => {}, [fnModule]);

  if (survey) {
    survey.onCurrentPageChanged.add((sender, options) => {
      console.log("Current page no:", options.newCurrentPage.num);
    });
  }

  if (fnModule) {
    survey.onComplete.add(async (sender, options) => {
      await fnModule.saveSurveyResults(sender, options);
    });
  }

  if (loading) {
    survey.beginLoading();
    survey.showTitle = false;
    // survey.logo = "";
  } else {
    survey.showTitle = showTitle;
    survey.endLoading();
  }
  return !error ? (
    <Survey model={survey} />
  ) : (
    <div className="error">{error}</div>
  );
};

export default SurveyRenderer;
