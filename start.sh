#!/bin/bash

rcssserver > rcssserver.log 2>&1 &
rcssmonitor > rcssmonitor.log 2>&1 &
export MONITOR=$!

node app.js Left k -15 -10 &
sleep 1 &&
node app.js Right g -35 0 &

wait $MONITOR

./kill.sh
