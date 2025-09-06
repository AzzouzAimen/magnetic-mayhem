#!/bin/sh

# Find the main JavaScript bundle file in the /usr/share/nginx/html/assets directory
# It will have a name like index-a1b2c3d4.js
JS_BUNDLE=$(find /usr/share/nginx/html/assets -name "index-*.js")

# Check if the file was found
if [ -z "$JS_BUNDLE" ]; then
  echo "Error: Main JS bundle not found!"
  exit 1
fi

echo "Found JS bundle: $JS_BUNDLE"
echo "Replacing API_URL_PLACEHOLDER with ${VITE_API_URL}"

# Use the 'sed' command to find our placeholder and replace it with the real URL
# The -i flag means "edit in-place"
# The delimiter is changed to '#' to avoid issues with URLs containing '/'
sed -i "s#API_URL_PLACEHOLDER#${VITE_API_URL}#g" $JS_BUNDLE

# Now that the file is updated, execute the original Docker command (start nginx)
# "$@" passes along any arguments from the CMD line
exec "$@"