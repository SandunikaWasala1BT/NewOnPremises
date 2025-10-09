/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
// import "survey-core/survey-core.css";
import { fetchDefaultStyles } from "../api/fetchDefaultStyles";
import { fetchFontStyles } from "../api/fetchFontStyles";
import "survey-core/survey.i18n";
import {
  generateGUID,
  googleAnalyticsOnComplete,
  googleAnalyticsOnPageChanged,
} from "../utils/configureGoogleAnalytcs";

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


  if (fnModule) {
    console.log("Current page no I:", survey.currentPageNo);
    console.log("Is first page:", survey.isFirstPage);
    console.log("Is last page:", survey.isLastPage);
    const sessionDetailsId = generateGUID();
    survey.onCurrentPageChanged.add(async (sender, options) => {
      googleAnalyticsOnPageChanged(sender, options, sessionDetailsId);
      // console.log("Current page no II:", options.newCurrentPage.num);
      console.log("Current page no I:", survey.currentPageNo);
      console.log("Is first page:", survey.isFirstPage);
      console.log("Is last page:", survey.isLastPage);
    });
    survey.onComplete.add(async (sender, options) => {
      fnModule.setSurvey(sender);
      await fnModule.saveSurveyResults(sender, options);
      googleAnalyticsOnComplete(sender, options, sessionDetailsId);
    });
    console.log("Page visible count:", survey.visiblePageCount);
    console.log("Page count:", survey.pageCount);
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
