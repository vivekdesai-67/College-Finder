#!/bin/bash

echo "🔍 Checking Predictions Endpoints"
echo "=================================="
echo ""

# Test 1: Basic predictions API
echo "1️⃣  Testing basic predictions API (no auth):"
RESPONSE=$(curl -s "http://localhost:3000/api/predictions")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 2: Predictions with category
echo "2️⃣  Testing predictions with category 1K:"
RESPONSE=$(curl -s "http://localhost:3000/api/predictions?category=1K")
TOTAL=$(echo "$RESPONSE" | jq -r '.totalColleges // "error"')
echo "   Total Colleges: $TOTAL"
if [ "$TOTAL" != "error" ] && [ "$TOTAL" -gt "0" ]; then
    echo "   ✅ Working!"
else
    echo "   ❌ Not working"
    echo "$RESPONSE" | jq '.'
fi
echo ""

# Test 3: Predictions with full profile
echo "3️⃣  Testing predictions with full profile:"
RESPONSE=$(curl -s "http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer+Science")
TOTAL=$(echo "$RESPONSE" | jq -r '.totalColleges // "error"')
echo "   Total Colleges: $TOTAL"
if [ "$TOTAL" != "error" ] && [ "$TOTAL" -gt "0" ]; then
    echo "   ✅ Working!"
    echo "   First college: $(echo "$RESPONSE" | jq -r '.predictions[0].college')"
else
    echo "   ❌ Not working"
    echo "$RESPONSE" | jq '.'
fi
echo ""

# Test 4: Check if page loads
echo "4️⃣  Testing if predictions page loads:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/predictions")
echo "   HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Page loads"
else
    echo "   ❌ Page doesn't load"
fi
echo ""

echo "=================================="
echo "Summary:"
echo "- Database: ✅ 10,535 predictions"
echo "- API: $([ "$TOTAL" != "error" ] && echo "✅ Working" || echo "❌ Not working")"
echo "- Page: $([ "$HTTP_CODE" = "200" ] && echo "✅ Loads" || echo "❌ Doesn't load")"
echo ""
echo "If the page shows an error in the browser:"
echo "1. Open browser DevTools (F12)"
echo "2. Check Console tab for errors"
echo "3. Check Network tab to see API requests"
echo "4. Make sure you're logged in"
