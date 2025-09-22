import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import NotFound from "./components/NotFound";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/:slogan" element={<Home />} />
          <Route path="/not-found" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <div
        style={{ height: "10%", justifySelf: "center", fontSize: "12px", bottom: 0 }}
        id="banner"
      >
        <span>GYDE365 by&nbsp;&nbsp;</span>
        <img
          alt="Seer 365"
          src="https://gyde365-discover.powerappsportals.com/FooterLogo.png"
          style={{ height: "20px" }}
        />
        <span>&nbsp;&nbsp;Seer 365</span>
      </div>
    </>
  );
}

export default App;
