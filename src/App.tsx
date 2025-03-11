import React, { useState } from "react";
import "./App.css";
import NonStackedBarChart from "./components/NonStackedBarChart";
import NEOsTable from "./components/Table";
function App() {
  const [isOn, setIsOn] = useState(false);

  const handleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
  };
  return (
    <div className="App">
      <button
        onClick={handleSwitch}
        className="primary-button"
      >
        switch
      </button>
      {isOn ? <NonStackedBarChart /> : <NEOsTable />}
    </div>
  );
}

export default App;
