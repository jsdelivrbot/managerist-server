#!/usr/bin/env bash
CUR="$( dirname "$0" )"
DB='managerist'
while getopts ":d:" opt; do
	case $opt in
		d) DB=$OPTARG;;
	esac
done
find $CUR -type f -iname '*.json' | while read filename;
do
echo "mongoimport -d $DB $filename"
mongoimport -d $DB $filename
done