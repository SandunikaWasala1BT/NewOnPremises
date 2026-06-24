import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SurveyRenderer from "./SurveyRenderer";
import { fetchSurveyInfo } from "../api/fetchSurveyInfo";
import { fetchLicenseBlocks } from "../api/fetchLicenseBlocks";
import { api } from "../api/fetchScheme";
import { fetchSurveys } from "../api/fetchSurveys";
import {
  checkIfCustomCSSFileExists,
  fetchDefaultStyles,
} from "../api/fetchDefaultStyles";

const Home = () => {
  const [surveyJson, setSurveyJson] = useState(null);
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [surveyQuestions, setSurveyQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLicenseBlocksSetUp, setIsLicenseBlocksSetUp] = useState(false);
  const { slogan } = useParams();
  const navigate = useNavigate();

  const newOrigin =
    //"https://survey-portal-uat-gxchbpcrc4fkbze3.uksouth-01.azurewebsites.net/9altitudes-crm-salestech";
    window.location.href;

  useEffect(() => {
    const setDefaultStylesFile = () => {
      // Append defaultV2.min.css file to the head after applying the style
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = `${
        import.meta.env.VITE_AZURE_BLOB_URL
      }/${slogan}/defaultCss.css`;
      document.getElementsByTagName("head")[0].appendChild(link);
    };

    const setCustomCSSFileIfExists = async (url) => {
      try {
        const isFileExists = await checkIfCustomCSSFileExists(url);
        if (isFileExists) {
          var link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = url;
          document.getElementsByTagName("head")[0].appendChild(link);
        } else {
          await fetchDefaultStyles(newOrigin);
        }
      } catch (error) {
        console.error("Error checking custom CSS file:", error);
      }
    };

    const getSchema = async () => {
      try {
        const response = await api.get("", { params: { slogan } });
        if (response.data) {
          const data = response.data;
          const schema = data?.content;
          setIsLicenseBlocksSetUp(data?.isLicenseBlocksSetUp || false);
          setSurveyJson(schema);
        } else if (response.status === 404) {
          return navigate("/not-found");
        }
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 404) {
          return navigate("/not-found");
        }
        setError("Something went wrong, please try again later.");
      }
    };

    const getSurveyInfo = async () => {
      try {
        const surveyInfo = await fetchSurveyInfo(newOrigin);
        if (surveyInfo) {
          console.log("surveyInfo : " ,surveyInfo);
          const surveys = await fetchSurveys(newOrigin);
          if (surveys) {
            console.log("surveys :",surveys);
            surveyInfo.BaseUrl = surveys.baseURl;
            surveyInfo.App = surveys.app;
            surveyInfo.PartnerTemplate = surveys.partnerTemplate;
            surveyInfo.Locale = surveys.locale;
            surveyInfo.SeerEmail = surveys.seerEmail;
            console.log("updated survey info :",surveyInfo);
          }else {
            console.warn("No survey data found");
          }
          setSurveyInfo(surveyInfo);
        } else {
          console.warn("No survey info found");
        }
      } catch (error) {
        console.error(error);
        setError("Something went wrong, please try again later.");
      }
    };
    setDefaultStylesFile();
    setCustomCSSFileIfExists(
      `${import.meta.env.VITE_AZURE_BLOB_URL}/${slogan}/customCSS.css`
    );
    getSchema();
    getSurveyInfo();
    setLoading(false);
  }, []);

  useEffect(() => {
    const getLicenseBlocks = async () => {
      if (!surveyJson) return;
      try {
        const surveyQuestions = await fetchLicenseBlocks(
          newOrigin,
          slogan,
          isLicenseBlocksSetUp
        );
        if (surveyQuestions) {
          console.log(surveyQuestions);
          setSurveyQuestions(surveyQuestions);
        } else {
          console.warn("No survey questions found");
        }
      } catch (error) {
        console.error(error);
        setError("Something went wrong, please try again later.");
      }
    };
    getLicenseBlocks();
  }, [isLicenseBlocksSetUp, surveyJson, slogan]);

  return (
    <>
      {loading ? (
        <p></p>
      ) : surveyJson && surveyInfo && surveyQuestions ? (
        <SurveyRenderer
          schema={surveyJson}
          surveySlogan={slogan}
          surveyInfo={surveyInfo}
          surveyQuestionJSON={surveyQuestions}
        />
      ) : (
        error && <div className="error">{error}</div>
      )}
    </>
  );
};

export default Home;
