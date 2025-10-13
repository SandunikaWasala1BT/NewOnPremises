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
    const sessionDetailsId = generateGUID();

    survey.onAfterRenderPage.add(function (sender, options) {
      if (fnModule.afterRenderConfig) {
        fnModule.afterRenderConfig(sender, options);
      }
    });

    survey.onCurrentPageChanged.add(async (sender, options) => {
      googleAnalyticsOnPageChanged(sender, options, sessionDetailsId);

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
    })

    survey.onComplete.add(async (sender, options) => {
      fnModule.setSurvey(sender);
      await fnModule.saveSurveyResults(sender, options);
      googleAnalyticsOnComplete(sender, options, sessionDetailsId);

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
