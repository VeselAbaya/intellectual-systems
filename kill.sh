#!/bin/bash

kill $(pidof rcssmonitor)
kill $(pidof rcssserver)
sleep 1 &&
rm *.rcg
rm *.rcl
