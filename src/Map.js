import React, { useState } from "react";
import moment from "moment";
import { StaticMap } from "react-map-gl";
import DeckGL, { LineLayer } from "deck.gl";
import { TripsLayer } from "@deck.gl/experimental-layers";
import GL from "luma.gl/constants";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoiam9uZXNwZW4iLCJhIjoiY2pxYXloY2M5M2RiajQzcDNnbHpmNzV5ciJ9.o9So7Khm2EsYcuFkuOaAdw";

const initialViewState = {
  latitude: 59.911491,
  longitude: 10.757933,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

function getColor(d) {
  const z = d.start_station_latitude;
  const r = z / 200;
  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}

export default function Map({ trips, time, firstTripStartedAt }) {
  const layers = [
    new TripsLayer({
      id: "trips",
      data: trips,
      getPath: d => {
        const path = d.segments.map(s => {
          return [s[0], s[1], moment(s[2]).diff(firstTripStartedAt, "seconds")];
        });
        return path;
      },
      getColor: d => {
        return d.vendor === 0 ? [253, 128, 93] : [23, 184, 190];
      },
      opacity: 0.5,
      strokeWidth: 8,
      trailLength: 600,
      currentTime: time.valueOf()
    })
  ];

  return (
    <DeckGL
      initialViewState={initialViewState}
      controller={true}
      layers={layers}
      pickingRadius={5}
      parameters={{
        blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
        blendEquation: GL.FUNC_ADD
      }}
    >
      <StaticMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        reuseMaps
        mapStyle="mapbox://styles/mapbox/dark-v9"
        preventStyleDiffing={true}
      />
    </DeckGL>
  );
}
