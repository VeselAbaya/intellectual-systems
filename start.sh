#!/bin/bash

rcssserver > rcssserver.log 2>&1 &
rcssmonitor > rcssmonitor.log 2>&1 &
