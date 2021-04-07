#!/bin/bash

rcssserver > ./log/rcssserver.log 2>&1 &
rcssmonitor > ./log/rcssmonitor.log 2>&1 &
export MONITOR=$!

sleep 1 &&
node app.js &

wait $MONITOR

./kill.sh
