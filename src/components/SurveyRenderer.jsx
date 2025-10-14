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
  googleAnalyticsOnPageChangedNew,
  googleAnalyticsOnCompleteNew,
} from "../utils/configureGoogleAnalytcs";
let surveyOnLoadCheck = false;
let navigateOrder = 1;
const sessionDetailsId = generateGUID();

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
  const [userCountry, setUserCountry] = useState(null); // <-- here
  const [userCountryCode, setUserCountryCode] = useState(null); // <-- here
  survey.startTimer();

  // Fetch user country using IP
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setUserCountry(data.country_name); // e.g., "Sri Lanka"
        console.log("User country:", data.country_name);
        setUserCountryCode(data.country); // e.g., "Sri Lanka"
        console.log("User country code:", data.country);
      } catch (err) {
        console.warn("Failed to fetch user country:", err);
      }
    };
    fetchUserCountry();
  }, []);

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
    if (!surveyOnLoadCheck) {
      googleAnalyticsOnPageChangedNew(
        survey.data,
        0,
        sessionDetailsId,
        survey.currentPageNo,
        survey.isFirstPage,
        survey.isLastPage,
        survey.currentPage.name,
        survey.pageCount,
        userCountry,
        userCountryCode,
        survey.timeSpent,
        navigateOrder
      );
      surveyOnLoadCheck = true;
      navigateOrder = navigateOrder + 1;
    }

    survey.onAfterRenderPage.add(function (sender, options) {
      if (fnModule.afterRenderConfig) {
        fnModule.afterRenderConfig(sender, options);
      }
    });

    survey.onCurrentPageChanged.add(async (sender, options) => {
      googleAnalyticsOnPageChangedNew(
        sender.data,
        options.oldCurrentPage.name,
        sessionDetailsId,
        survey.currentPageNo,
        survey.isFirstPage,
        survey.isLastPage,
        survey.currentPage.name,
        survey.pageCount,
        userCountry,
        userCountryCode,
        sender.timeSpent,
        navigateOrder
      );
      navigateOrder = navigateOrder + 1;

      if (fnModule.currentPageChangedConfig) {
        fnModule.currentPageChangedConfig(sender, options);
      }
    });

    survey.onValueChanging.add(function (sender, options) {
      if (fnModule.valueChangingConfig) {
        fnModule.valueChangingConfig(sender, options);
      }
    });

    survey.onValueChanged.add(function (sender, options) {
      if (fnModule.valueChangedConfig) {
        fnModule.valueChangedConfig(sender, options);
      }
    });

    survey.onComplete.add(async (sender, options) => {
      fnModule.setSurvey(sender);
      await fnModule.saveSurveyResults(sender, options);
      googleAnalyticsOnCompleteNew(
        sender.data,
        0,
        sessionDetailsId,
        survey.currentPageNo,
        survey.isFirstPage,
        survey.isLastPage,
        survey.currentPage.name,
        survey.pageCount,
        userCountry,
        userCountryCode,
        sender.timeSpent,
        navigateOrder
      );
      navigateOrder = navigateOrder + 1;

      if (fnModule.completeConfig) {
        fnModule.completeConfig(sender, options);
      }
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
