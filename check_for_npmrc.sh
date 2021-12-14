#!/usr/bin/env bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

if [ ! -f .npmrc ]; then
    echo -e "❌ ${RED}No .npmrc file found in the project root!"
    echo -e "Creating an .npmrc file with the following value:"
    echo "//registry.npmjs.org/:_authToken=ASK_OTHER_TEAM_MEMBERS_FOR_TOKEN"
    echo "."
    echo "."
    echo "."
    echo "."
    echo -e "${GREEN} Please make sure to ask another dev on the project for the token "
    echo -e "and replace the all caps value above with it BEFORE running npm install!"
    echo -e ".${NC}"

    echo "//registry.npmjs.org/:_authToken=ASK_OTHER_TEAM_MEMBERS_FOR_TOKEN" >> .npmrc
else
    echo -e "✅ ${GREEN}.npmrc file found! Continuing install...${NC}"
fi
