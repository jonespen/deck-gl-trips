import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import Map from "./Map";
import trips from "./data.json";

import "./styles.css";

const animationSpeed = 5;
const numberOfTrips = trips.length;
const firstTripStartedAt = moment(trips[0].started_at);
const lastTripStartedAt = moment(trips[trips.length - 1].started_at);

function animate(setTime) {
  setTime(time => {
    const timestamp = moment(time).add(animationSpeed, "seconds");
    if (timestamp.isAfter(lastTripStartedAt)) {
      return firstTripStartedAt;
    } else {
      return timestamp;
    }
  });

  return window.requestAnimationFrame(() => animate(setTime));
}

function useTime() {
  const [time, setTime] = useState(firstTripStartedAt);

  useEffect(() => {
    const animationFrame = animate(setTime);
    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return {
    time,
    setTime,
    timeRangeComponent: (
      <div>
        <label>
          Time:
          <input
            type="range"
            min={firstTripStartedAt.valueOf()}
            max={lastTripStartedAt.valueOf()}
            step={1000 * 60}
            value={time}
            onChange={event => {
              setTime(moment(parseInt(event.target.value)));
            }}
          />{" "}
          <time className="block">{time.format("DD.MM.YYYY HH:mm:ss")}</time>
        </label>
      </div>
    )
  };
}

function App() {
  const { time, setTime, timeRangeComponent } = useTime();

  return (
    <div className="App">
      <div className="CurrentTrips p-2">
        <div className="mb-2">
          <b>{numberOfTrips}</b> trips between {firstTripStartedAt.format("L")}{" "}
          and {lastTripStartedAt.format("L")}
        </div>
        {timeRangeComponent}
      </div>
      <Map
        trips={trips}
        time={time.diff(firstTripStartedAt, "seconds")}
        firstTripStartedAt={firstTripStartedAt}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
