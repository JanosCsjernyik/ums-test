import React from 'react'
import MqttContext from '../MqttContext'
import * as mqtt from 'mqtt'
import { useEffect } from 'react'
import { useState } from 'react'

const Mqttprovider = ({ children }) => {
  const [coordinates, setCoordinate] = useState([])
  const [markerResponse, setMarkerResponse] = useState(null)
  const [client, setClient] = useState(null)

  useEffect(() => {
    const options = {
      clientId: 'reactTest',
      username: 'reactTest',
      password: 'reactTest1234',
      protocol: 'wss',
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
          console.log({ newCoordinate })
          setCoordinate(prevCoordinates => {
            return [...prevCoordinates, newCoordinate]
          })
        }

        if (topic === 'reactTest/click:request') {
          const markerResponse = JSON.parse(new TextDecoder('utf-8').decode(message))
          console.log({ markerResponse })
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
