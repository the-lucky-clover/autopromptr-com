
#!/bin/bash
echo "🚀 Deploying to Cloudflare Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "Next steps for Cloudflare Pages:"
echo "1. Go to https://dash.cloudflare.com/pages"
echo "2. Click 'Create a project'"
echo "3. Connect your GitHub repository"
echo "4. Set build command: npm run build"
echo "5. Set build output directory: dist"
echo "6. Add environment variables in Cloudflare Pages settings:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - Any other API keys you're using"
echo ""
echo "🌐 Your app will be available at: https://your-project.pages.dev"
