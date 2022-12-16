#!/bin/bash
set -e

source "./scripts/codegen.sh"

# @TODO we might reuse the generated files only removing when TYPE is diff from previous
if [ -d "build" ]; then
  echo "Cleaning generated build"
  rm -r build/
fi

# Run build to generate deployable version
graph build
