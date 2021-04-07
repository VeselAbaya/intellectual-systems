#!/bin/bash

rcssserver > rcssserver.log 2>&1 &
rcssmonitor > rcssmonitor.log 2>&1 &
export MONITOR=$!

sleep 1 &&
node app.js &

wait $MONITOR

./kill.sh
