#!/usr/bin/env bash
str=$(git config --global user.name)
if [ -z "$str"  ]; then
    git config --global user.name $GIT_COMMITTER_NAME
    git config --global user.email $GIT_COMMITTER_EMAIL
fi
