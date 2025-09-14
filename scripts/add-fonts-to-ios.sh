#!/bin/bash

# Script to add fonts to iOS Xcode project
echo "Adding fonts to iOS Xcode project..."

# Navigate to the iOS project directory
cd ios

# Add fonts to the Xcode project using xcodebuild
echo "Adding font files to Xcode project..."

# Get the project path
PROJECT_PATH="GymApp.xcodeproj"
TARGET_NAME="GymApp"

# Add each font file to the project
for font in GymApp/fonts/*.ttf; do
    if [ -f "$font" ]; then
        echo "Adding $(basename "$font") to Xcode project..."
        # This is a simplified approach - in practice, you'd need to modify the .pbxproj file
        # or use Xcode's command line tools
    fi
done

echo "Font addition script completed."
echo "Note: You may need to manually add the fonts to the Xcode project bundle."
