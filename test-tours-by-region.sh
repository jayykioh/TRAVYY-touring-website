#!/bin/bash

# Test API Tours by Region
# Sử dụng: ./test-tours-by-region.sh <TOKEN>

API_URL="http://localhost:4000/api"
TOKEN=$1

if [ -z "$TOKEN" ]; then
  echo "❌ Vui lòng cung cấp token!"
  echo "Usage: ./test-tours-by-region.sh <YOUR_JWT_TOKEN>"
  echo ""
  echo "Để lấy token, login trước:"
  echo 'curl -X POST http://localhost:4000/api/admin/auth/login \'
  echo '  -H "Content-Type: application/json" \'
  echo '  -d '"'"'{"email":"admin@travyy.com","password":"Admin@123"}'"'"
  exit 1
fi

echo "🧪 Testing Tours by Region API..."
echo "================================"
echo ""

# Test Tours by Region
echo "📊 GET /admin/tours-by-region"
curl -s "${API_URL}/admin/tours-by-region" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'

echo ""
echo "================================"
echo "✅ Test completed!"
