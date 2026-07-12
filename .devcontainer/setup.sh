#!/bin/bash
set -e

echo "==================================="
echo "Setting up Odoo Hackathon Boilerplate"
echo "==================================="

echo ""
echo ">>> Installing backend (Django) dependencies..."
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
cd ..

echo ""
echo ">>> Installing frontend (React) dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "==================================="
echo "Setup complete!"
echo ""
echo "To run the backend:"
echo "  cd backend && python manage.py runserver 0.0.0.0:8000"
echo ""
echo "To run the frontend:"
echo "  cd frontend && npm run dev -- --host"
echo "==================================="
