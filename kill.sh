#!/bin/bash

kill $(pidof rcssmonitor)
kill $(pidof rcssserver)
sleep 2 &&
rm *.rcg
rm *.rcl
