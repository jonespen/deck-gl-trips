const moment = require("moment");
const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { scaleLinear } = require("d3-scale");
const data = require("./12.json");

const writeFile = util.promisify(fs.writeFile);

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoiam9uZXNwZW4iLCJhIjoiY2pxYXloY2M5M2RiajQzcDNnbHpmNzV5ciJ9.o9So7Khm2EsYcuFkuOaAdw";

const cache = {};

async function fetchDirections(trip) {
  const positions = `${trip.start_station_longitude},${
    trip.start_station_latitude
  };${trip.end_station_longitude},${trip.end_station_latitude}`;

  if (cache[positions]) {
    console.log("returning cached data");
    return cache[positions];
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${positions}?steps=true&geometries=geojson&alternatives=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
  const res = await fetch(url).then(res => res.json());

  cache[positions] = res;

  return res;
}

async function main() {
  const trips = data;
  const out = [];
  for (let trip of trips) {
    const res = await fetchDirections(trip);
    const geometry = res.routes[0].geometry.coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
    // let geometry = tempGeo;
    const startDate = moment(trip.started_at);
    const linearScale = scaleLinear()
      .domain([0, geometry.length - 1])
      .range([0, trip.duration]);

    const segments = geometry.map((g, i) => {
      return [g.lng, g.lat, startDate.add(linearScale(i), "seconds").valueOf()];
    });
    out.push({ ...trip, segments });
  }

  await writeFile(
    path.resolve(__dirname, "..", "src", "data.json"),
    JSON.stringify(out, null, 2)
  );
}

main()
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch(err => {
    console.log("error", err);
    process.exit(1);
  });
