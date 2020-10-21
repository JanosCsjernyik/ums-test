import React from 'react'
import MqttContext from '../MqttContext'
import * as mqtt from 'mqtt'
import { useEffect } from 'react'
import { useState } from 'react'

const {
  REACT_APP_CLIENT_ID: clientId,
  REACT_APP_USERNAME: username,
  REACT_APP_PASSWORD: password,
  REACT_APP_PROTOCOL: protocol,
} = process.env

const Mqttprovider = ({ children }) => {
  const [coordinates, setCoordinate] = useState([])
  const [markerResponse, setMarkerResponse] = useState(null)
  const [client, setClient] = useState(null)

  useEffect(() => {
    const options = {
      clientId,
      username,
      password,
      protocol,
    }
    const url = 'https://smart-city.work/mqtt'

    const client = mqtt.connect(url, options)
    client.subscribe('reactTest/path')
    client.subscribe('reactTest/click:request')

    if (client) {
      setClient(client)
      client.on('message', (topic, message) => {
        if (topic === 'reactTest/path') {
          const newCoordinate = JSON.parse(new TextDecoder('utf-8').decode(message))
          setCoordinate(prevCoordinates => {
            return [...prevCoordinates, newCoordinate]
          })
        }

        if (topic === 'reactTest/click:request') {
          const markerResponse = JSON.parse(new TextDecoder('utf-8').decode(message))
          if (markerResponse) {
            const [y, x] = markerResponse
            const coordinate = { x, y }
            setMarkerResponse(JSON.stringify(coordinate))
          }
        }
      })
    }
  }, [])

  return (
    <MqttContext.Provider value={{ client, coordinates, markerResponse }}>
      {children}
    </MqttContext.Provider>
  )
}

export default Mqttprovider
