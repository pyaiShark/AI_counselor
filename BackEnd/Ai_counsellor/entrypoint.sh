#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run migrations
echo "Running makemigrations for api..."
python manage.py makemigrations api

echo "Running migrate..."
python manage.py migrate

# Execute the passed command (e.g., gunicorn)
exec "$@"
