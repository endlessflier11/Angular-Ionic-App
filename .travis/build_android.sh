#! /bin/bash -v
set -e

echo `echo $GOOGLE_PLAY_JSON_B64 | base64 --decode` > google_play.json

npm run qa:android

exit 0
