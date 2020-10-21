import { Map, View } from 'ol'
import 'ol/ol.css'
import { fromLonLat, transform } from 'ol/proj'
import React, { useContext, useEffect, useState } from 'react'
import MqttContext from '../contexts/MqttProvider/MqttContext'
import { createMapParts } from '../utils/MapCreator'
import css from './map.module.scss'

const MapComponent = () => {
  const [map, setMap] = useState(null)
  const [path, setPath] = useState(null)
  const [marker, setMarker] = useState(null)
  const { client, coordinates, markerResponse } = useContext(MqttContext)

  useEffect(() => {
    const { pathLayer, markerLayer, raster, path, marker } = createMapParts()

    const map = new Map({
      target: 'map',
      layers: [raster, pathLayer, markerLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 13,
      }),
    })

    setMap(map)
    setPath(path)
    setMarker(marker)
  }, [])

  useEffect(() => {
    if (client && map) {
      map.on('click', e => {
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
          const { values_: { name } = '' } = feature
          if (name === 'marker') {

            const {
              geometryChangeKey_: {
                target: { flatCoordinates },
              },
            } = feature

            const lonLat = transform(flatCoordinates, 'EPSG:3857', 'EPSG:4326')

            client.publish('reactTest/click:request', JSON.stringify(lonLat))
          }
        })
      })
    }
  }, [client, map])

  useEffect(() => {
    const latestCordinate = coordinates[coordinates.length - 1] || { x: 0, y: 0 }
    const latestCordinateInArray = fromLonLat([latestCordinate.y, latestCordinate.x])

    if (map) {
      if (coordinates.length === 1) {
        map.setView(
          new View({
            center: latestCordinateInArray,
            zoom: 17,
          })
        )
        path.setCoordinates([latestCordinateInArray])
      } else {
        path.appendCoordinate(latestCordinateInArray)
      }
      marker.setCoordinates(latestCordinateInArray)
    }
  }, [coordinates, map, path, marker])

  return (
    <div className={css.wrapper}>
      <div className={css.map} id="map" />
      <div className={css.input}>
        <textarea type="text" cols="20" rows="10" multiple value={markerResponse || ''}></textarea>
      </div>
    </div>
  )
}

export default MapComponent
