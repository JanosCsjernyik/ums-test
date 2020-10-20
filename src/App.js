import React from "react";
import Mqttprovider from "./contexts/MqttProvider/provider/MqttProvider";
import MapComponent from "./components/MapComponent";

function App() {
  return (
    <Mqttprovider>
      <MapComponent />
    </Mqttprovider>
  );
}

export default App;
