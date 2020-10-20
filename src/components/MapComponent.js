import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import React, { useContext, useEffect, useState } from "react";
import MqttContext from "../contexts/MqttProvider/MqttContext";
import css from "./map.module.scss";
import { LineString, Point } from "ol/geom";
import { Style, Stroke } from "ol/style";

const MapComponent = () => {
  const [cordinates, setCordinates] = useState([]);
  const [map, setMap] = useState(null);
  const [path, setPath] = useState(null);
  const [marker, setMarker] = useState(null);
  const [markerClick, setMarkerClick] = useState(false);
  const client = useContext(MqttContext);
  client.subscribe("reactTest/path");

  useEffect(() => {
    client.on("message", (topic, message) => {
      const newCordinate = JSON.parse(new TextDecoder("utf-8").decode(message));
      console.log({ newCordinate });
      setCordinates((prevCordinates) => {
        return [...prevCordinates, newCordinate];
      });
    });

    const raster = new TileLayer({
      source: new OSM(),
    });

    const path = new LineString([]);
    const pathSource = new VectorSource({
      features: [
        new Feature({
          geometry: path,
          name: "path",
        }),
      ],
    });

    const marker = new Point([]);
    const markerSource = new VectorSource({
      features: [
        new Feature({
          geometry: marker,
          name: "marker",
        }),
      ],
    });

    const style = [
      new Style({
        stroke: new Stroke({
          color: "#d12710",
          width: 3,
        }),
      }),
    ];

    const pathLayer = new VectorLayer({ source: pathSource });

    const markerLayer = new VectorLayer({ source: markerSource });

    pathLayer.setStyle(style);

    const map = new Map({
      target: "map",
      layers: [raster, pathLayer, markerLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 13,
      }),
    });

    map.on("click", (e) => {
      map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        const { values_: { name } = "" } = feature;

        if (name === "marker") {
          // const latestCordinate = cordinates[cordinates.length - 1] || { x: 0, y: 0 };
          // const latestCordinateInArray = fromLonLat([latestCordinate.y, latestCordinate.x]);
          setMarkerClick((prevMarkerClick) => {
            return true;
          });
          console.log({ feature, layer });
        }
      });
    });

    setMap(map);
    setPath(path);
    setMarker(marker);
  }, [client]);

  useEffect(() => {
    const latestCordinate = cordinates[cordinates.length - 1] || { x: 0, y: 0 };
    const latestCordinateInArray = fromLonLat([latestCordinate.y, latestCordinate.x]);

    if (map) {
      map.setView(
        new View({
          center: latestCordinateInArray,
          zoom: 17,
        }),
      );

      if (cordinates.length === 1) {
        path.setCoordinates([latestCordinateInArray]);
      } else {
        path.appendCoordinate(latestCordinateInArray);
      }
      marker.setCoordinates(latestCordinateInArray);
    }
  }, [cordinates, map, path, marker]);

  useEffect(() => {
    if (markerClick) {
      console.log("marker click use effect");
      client.subscribe("reactTest/click:request");
      client.publish("reactTest/click:request", "Hello");

      client.on("message", (topic, message) => {
        const decodedMessage = JSON.parse(new TextDecoder("utf-8").decode(message));
        console.log({ topic, decodedMessage });
      });
    }
  }, [markerClick, client]);

  return (
    <div className={css.map} id='map'>
      <button
        onClick={() =>
          setCordinates((precCord) => {
            return [...precCord, { x: 14, y: 23 }];
          })
        }
      >
        hello
      </button>
    </div>
  );
};

export default MapComponent;
