#!/bin/bash

# Export the repository URL environment variable
export GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"

# Clone the repository into the output directory
git clone "$GIT_REPOSITORY_URL" /home/app/output

# Move to the output directory where the cloned code exists


# Execute the main file (ensure index.js exists in the cloned repo)
exec node index.js
