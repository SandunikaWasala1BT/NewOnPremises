export function configureGoogleAnalytics(propertyID) {
  // Load the Google Analytics script
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${propertyID}`;
  script.async = true;
  document.head.appendChild(script);

  const script2 = document.createElement("script");
  const scriptText = `
    window.dataLayer = window.dataLayer || [];
      // function gtag(){dataLayer.push(arguments);}
      window.gtag = function () {
        dataLayer.push(arguments);
      };

      gtag("js", new Date());

      gtag("config", "${propertyID}");
      // Listen for messages from the iframe
      window.addEventListener("message", function (event) {
        // Optional: Add security check for event.origin
        if (event.data && event.data.type === "gtag") {
          // Call gtag with the arguments from the iframe message
          gtag("event", event.data.event, {
            event_category: event.data.category,
            event_label: event.data.label,
            event_sessioniddata: event.data.sessionId,
            event_surveyurl: event.data.surveyUrl,
            event_timedate: event.data.timedata,
            value: event.data.value,
          });
        }
      });
    `;
  script2.appendChild(document.createTextNode(scriptText));
  document.head.appendChild(script2);
}

export function googleAnalyticsOnPageChanged(
  sender,
  options,
  sessionDetailsId
) {
  const pageName = sender.currentPage.name;
  const pageNo = sender.currentPageNo;
  const actualLastPageNumber = window.lastPageexpectedNo;
  const nowUTC = new Date().toISOString();
  //add consition to avoid recording pages between destination and the starting tab when navigation using navigation bar
  if (
    actualLastPageNumber == null ||
    (actualLastPageNumber != null && pageNo == actualLastPageNumber)
  ) {
    window.parent.postMessage(
      {
        type: "gtag",
        event: "page_navigation",
        category: "Survey",
        label: pageName,
        value: options.oldCurrentPage
          ? options.oldCurrentPage.visibleIndex + 1
          : 1,
        sessionId: sessionDetailsId, // Include sessionDetailsId here
        surveyUrl: window.location.href,
        timedata: nowUTC,
      },
      "*"
    ); // Replace '*' with the specific origin if known, for security

    window.lastPageexpectedNo = null;
  }
}

export function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function googleAnalyticsOnComplete(sender, options, sessionDetailsId) {
  const nowUTC = new Date().toISOString();

  const pageName = sender.currentPage.name;
  window.parent.postMessage(
    {
      type: "gtag",
      //event: 'survey_complete',
      event: "survey_complete",
      category: "Survey",
      label: "Survey Completed - " + pageName,
      value: 1,
      sessionId: sessionDetailsId, // Include sessionDetailsId here
      surveyUrl: window.location.href,
      timedata: nowUTC,
    },
    "*"
  ); // Replace '*' with the specific origin if known, for security
}
