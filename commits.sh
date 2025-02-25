#!/bin/bash

# Script to create individual commits for each git-added file
# Usage: ./commit-per-file.sh [commit-message-prefix]

# Check if a prefix was provided, otherwise use a default
prefix=${1:-"Add"}

# Get list of staged files (files that have been git-added)
staged_files=$(git diff --name-only --cached)

# Exit if no files are staged
if [ -z "$staged_files" ]; then
  echo "No files are currently staged for commit."
  exit 1
fi

# Count of files to process
total_files=$(echo "$staged_files" | wc -l)
echo "Found $total_files staged files. Creating individual commits..."

# Counter for progress
count=0

# Process each staged file
for file in $staged_files; do
  ((count++))
  
  # Reset the index (unstage all files)
  git reset HEAD > /dev/null
  
  # Stage just this one file
  git add "$file"
  
  # Create a commit message: use filename as the main content
  filename=$(basename "$file")
  message="$prefix $filename"
  
  # Add the directory path to the commit message body
  dir_path=$(dirname "$file")
  if [ "$dir_path" != "." ]; then
    message="$message\n\nPath: $dir_path"
  fi
  
  # Perform the commit
  echo -e "[$count/$total_files] Committing: $file"
  git commit -m "$message" > /dev/null
  
  if [ $? -eq 0 ]; then
    echo "✓ Successfully committed $file"
  else
    echo "✗ Failed to commit $file"
  fi
done

echo "Done! Created $count individual commits."