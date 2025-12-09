#!/bin/bash

# Test script for dashboard navigation fix
# Run this to verify the fixes work

echo "🧪 Testing Dashboard Navigation Fixes"
echo "======================================"
echo ""

echo "✅ Files Modified:"
echo "  - src/components/Navbar.tsx (logo text now visible)"
echo "  - src/components/dashboard/EnhancedWelcomeVideoBackground.tsx"
echo "  - src/hooks/useTimeBasedVideo.ts"
echo "  - src/hooks/useDashboardVideoSettings.ts"
echo "  - src/components/dashboard/UnifiedDashboardWelcomeModule.tsx"
echo "  - src/pages/Dashboard.tsx"
echo "  - src/components/ErrorBoundary.tsx"
echo ""

echo "📝 Manual Testing Steps:"
echo ""
echo "1. Start dev server:"
echo "   npm run dev"
echo ""
echo "2. Test Navbar Logo:"
echo "   - Open http://localhost:8080"
echo "   - Check navbar shows ⚡ AutoPromptr (not just bolt)"
echo "   - Resize window - logo should stay visible"
echo ""
echo "3. Test Dashboard Navigation:"
echo "   - Click avatar button → Get Started"
echo "   - Should redirect to /dashboard without 'we' error"
echo "   - Dashboard should load with welcome module"
echo ""
echo "4. Check Browser Console:"
echo "   - Should see no 'Cannot access we before initialization' error"
echo "   - Should see video loading logs"
echo ""
echo "5. If still see old error:"
echo "   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)"
echo "   - Clear cache and reload"
echo "   - Or open incognito window"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  WARNING: node_modules not found!"
    echo "   Run: npm install"
    echo ""
fi

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found!"
    echo "   Run this script from the project root directory"
    exit 1
fi

echo "✨ Ready to test! Run: npm run dev"
