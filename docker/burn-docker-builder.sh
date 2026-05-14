#!/usr/bin/env bash
set -e
set -o errexit

BUILDER_NAME="backstopjsbuilder"

echo "Removing Docker buildx builder: ${BUILDER_NAME}"

docker buildx rm --force "${BUILDER_NAME}"

echo "Docker buildx builder removed: ${BUILDER_NAME}"
