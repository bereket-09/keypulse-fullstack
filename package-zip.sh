#!/bin/bash
set -e

ZIP_NAME="KeyPulse-FullStack.zip"
echo "Packaging clean deliverable archive: $ZIP_NAME..."

# Remove previous zip if exists
rm -f "$ZIP_NAME"

# Create archive excluding build outputs and git history
zip -r "$ZIP_NAME" . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.next*" \
  -x "*backend/target*" \
  -x "*.DS_Store" \
  -x "*.system_generated*" \
  -x "*KeyPulse-FullStack.zip"

echo "=========================================================="
echo "Deliverable archive created successfully: $ZIP_NAME"
ls -lh "$ZIP_NAME"
echo "=========================================================="
