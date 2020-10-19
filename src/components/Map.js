import React, { useContext } from "react";
import MqttContext from "../contexts/MqttProvider/MqttContext";

const MapComponent = (props) => {
  const client = useContext(MqttContext);
  client.subscribe('reactTest/path');


  return <>MapComponent</>;
};

export default MapComponent;
