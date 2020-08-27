#!/bin/sh
# wait-for-kafka.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -vz "$host" "$port"; do
  >&2 echo "Waiting for Kafka to be ready on \"$host:$port\"..."
  sleep 2
done

# >&2 echo "Kafka is up - executing command ${cmd}"

exec $cmd