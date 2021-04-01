#!/bin/bash

kill $(pidof rcssmonitor)
kill $(pidof rcssserver)
rm *.rcg
rm *.rcl
rm *.log
