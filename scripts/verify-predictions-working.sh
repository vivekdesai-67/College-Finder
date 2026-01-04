#!/bin/bash

echo "🔍 Verifying Predictions System..."
echo "=================================="
echo ""

# Test 1: Check database directly
echo "1️⃣  Checking MongoDB database..."
MONGO_COUNT=$(mongosh --quiet --eval "use('college-findervvvvvv'); db.predictions.countDocuments()")
echo "   Predictions in MongoDB: $MONGO_COUNT"

if [ "$MONGO_COUNT" -eq "10535" ]; then
    echo "   ✅ Database has correct number of predictions"
else
    echo "   ❌ Database has wrong number of predictions"
fi

echo ""

# Test 2: Check API endpoint
echo "2️⃣  Checking API endpoint..."
API_RESPONSE=$(curl -s "http://localhost:3000/api/test-predictions")
API_COUNT=$(echo $API_RESPONSE | jq -r '.totalPredictions')
echo "   Predictions via API: $API_COUNT"

if [ "$API_COUNT" -eq "10535" ]; then
    echo "   ✅ API is connected to correct database"
else
    echo "   ❌ API is NOT connected to correct database"
    echo "   ⚠️  Did you restart the Next.js server?"
fi

echo ""

# Test 3: Check predictions API
echo "3️⃣  Checking predictions API..."
PRED_RESPONSE=$(curl -s "http://localhost:3000/api/predictions?category=1K")
PRED_COUNT=$(echo $PRED_RESPONSE | jq -r '.totalColleges // 0')
echo "   Predictions for category 1K: $PRED_COUNT"

if [ "$PRED_COUNT" -gt "0" ]; then
    echo "   ✅ Predictions API is working"
else
    echo "   ❌ Predictions API returned no results"
    echo "   Error: $(echo $PRED_RESPONSE | jq -r '.error // "Unknown"')"
fi

echo ""
echo "=================================="

if [ "$MONGO_COUNT" -eq "10535" ] && [ "$API_COUNT" -eq "10535" ] && [ "$PRED_COUNT" -gt "0" ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "Your predictions system is working correctly."
    echo "Go to: http://localhost:3000/predictions"
else
    echo "❌ SOME CHECKS FAILED"
    echo ""
    echo "Please make sure you:"
    echo "1. Restarted the Next.js server (npm run dev)"
    echo "2. Waited for the server to fully start"
    echo "3. MongoDB is running"
fi

echo ""
