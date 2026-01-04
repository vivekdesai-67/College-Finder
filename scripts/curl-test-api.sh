#!/bin/bash

echo "Testing predictions API..."
echo ""

curl -s "http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer%20Science" | jq '.predictions | length'

echo ""
echo "First prediction:"
curl -s "http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer%20Science" | jq '.predictions[0]'
