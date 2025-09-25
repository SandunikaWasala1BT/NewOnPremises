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