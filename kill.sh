#!/bin/bash

kill -n 9 $(pidof rcssmonitor)
kill -n 9 $(pidof rcssserver)