import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import 'ol/ol.css'
import { OSM } from 'ol/source'
import VectorSource from 'ol/source/Vector'
import { Stroke, Style } from 'ol/style'

const raster = new TileLayer({
  source: new OSM(),
})

const path = new LineString([])
const pathSource = new VectorSource({
  features: [
    new Feature({
      geometry: path,
      name: 'path',
    }),
  ],
})

const marker = new Point([])
const markerSource = new VectorSource({
  features: [
    new Feature({
      geometry: marker,
      name: 'marker',
    }),
  ],
})

const style = [
  new Style({
    stroke: new Stroke({
      color: '#d12710',
      width: 3,
    }),
  }),
]

const pathLayer = new VectorLayer({ source: pathSource })

const markerLayer = new VectorLayer({ source: markerSource })

pathLayer.setStyle(style)

export const createMapParts = () => ({
  pathLayer,
  markerLayer,
  raster,
  path,
  marker,
})
