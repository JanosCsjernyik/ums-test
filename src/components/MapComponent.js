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
import { LineString } from "ol/geom";

const MapComponent = () => {
  const [cordinates, setCordinates] = useState([]);
  const [map, setMap] = useState(null);
  const [path, setPath] = useState(null);
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

    const pathLayer = new VectorLayer({ source: pathSource });

    const map = new Map({
      target: "map",
      layers: [raster, pathLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 13,
      }),
    });
    setMap(map);
    setPath(path);
  }, [client]);

  useEffect(() => {
    const latestCordinate = cordinates[cordinates.length - 1] || { x: 0, y: 0 };
    const latestCordinateInArray = fromLonLat([latestCordinate.x, latestCordinate.y]);

    if (map) {
      map.setView(
        new View({
          center: latestCordinateInArray,
          zoom: 13,
        }),
      );

      if (cordinates.length === 1) {
        path.setCoordinates([latestCordinateInArray]);
      } else {
        path.appendCoordinate(latestCordinateInArray);
      }
    }
  }, [cordinates, map, path]);

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
