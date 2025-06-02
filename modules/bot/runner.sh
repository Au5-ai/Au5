#!/bin/bash
Xvfb :99 -screen 0 1920x1080x24 &
node dist/container.js
