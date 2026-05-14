#!/usr/bin/env bash
set -e
set -o errexit

BUILDER_NAME="backstopjsbuilder"

if docker buildx inspect "${BUILDER_NAME}" > /dev/null 2>&1; then
  echo "Docker buildx builder already exists: ${BUILDER_NAME}"
else
  echo "Creating Docker buildx builder: ${BUILDER_NAME}"
  docker buildx create --name "${BUILDER_NAME}"
fi

docker buildx inspect "${BUILDER_NAME}" --bootstrap
