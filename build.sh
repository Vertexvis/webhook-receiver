#!/usr/bin/env bash
set -Eeuo pipefail

export AWS_REGION="us-west-2"
export GIT_SHORT_REV
GIT_SHORT_REV=$(git rev-parse --short HEAD)

build() {
  npx --no-install tsc
}

cdk() {
  build
  npx --no-install cdk "$@"
}

# Execute command specified by $1 and pass remaining args to it
args=("$@")
${args[0]} "${@:2}"
