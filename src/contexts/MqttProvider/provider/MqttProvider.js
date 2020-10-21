import React from 'react'
import MqttContext from '../MqttContext'
import * as mqtt from 'mqtt'

const Mqttprovider = ({ children }) => {
  const options = {
    clientId: 'reactTest',
    username: 'reactTest',
    password: 'reactTest1234',
    protocol: 'wss',
  }
  const url = 'https://smart-city.work/mqtt'

  const client = mqtt.connect(url, options)

  return <MqttContext.Provider value={client}>{children}</MqttContext.Provider>
}

export default Mqttprovider
