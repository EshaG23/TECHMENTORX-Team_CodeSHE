🌍 SevaSetu (Social Mentor)

A Location-Based Donation Coordination Platform

📌 Problem Statement

Many donors, local businesses, and college social clubs are willing to donate food, clothes, toys, and essential items, but lack a structured platform to connect with NGOs and volunteers.

Existing donation processes are:

Unorganized

Not location-aware

Difficult to track

Do not recognize volunteer efforts

As a result, resources are wasted, delayed, or fail to reach the right people.

💡 Solution

SevaSetu is a centralized, location-based donation coordination platform that connects donors, NGOs, and volunteers to ensure transparent, verified, and efficient donation distribution.

It bridges the gap between intent and impact.

✨ Key Features

📍 Auto Location Detection (GPS-based & manual selection)

🗺️ Nearby NGO Discovery using interactive maps

📦 Donation Management (Food, Clothes, Toys, Essentials)

🔐 OTP-based Donation Verification

🚚 Pickup / Drop-off Scheduling

🏆 Gamification – Points, Leaderboard & Badges

📜 Digital Certificates for verified contributions

📊 Donation History & Tracking

⚙️ Tech Stack
Frontend

HTML5

CSS3

JavaScript (Vanilla JS)

Leaflet.js (Maps)

Backend

Python

Flask (REST APIs)

Data Storage (Prototype)

JSON-based storage for:

Users

NGOs & Volunteers

Donations

Certificates

Leaderboard

Location & Mapping

Browser Geolocation API

Haversine Algorithm

OpenStreetMap

🏗️ System Architecture
User (Donor)
   ↓
Frontend (HTML/CSS/JS)
   ↓
Flask Backend (APIs)
   ↓
Location Matching + NGO Data
   ↓
Donation Verification & Tracking

🚀 How It Works

User opens the platform

Location is auto-detected or selected manually

Nearby NGOs are displayed on a map

User selects an NGO and donation category

Pickup or drop-off is scheduled

Donation is verified using OTP

Points & certificates are awarded

🧪 Running the Project Locally
1️⃣ Clone the Repository
git clone https://github.com/your-username/sevasetu.git
cd sevasetu

2️⃣ Install Dependencies
pip install flask

3️⃣ Run the Application
python app.py

4️⃣ Open in Browser
http://localhost:5000

📁 Project Structure
├── app.py
├── landing.html
├── location.html
├── donation.html
├── pickup.html
├── *.css
├── *.js
├── users.json
├── ngos.json
├── donation_requests.json
├── donation_history.json
├── leaderboard.json
├── certificates.json
└── README.md

🌱 Future Scope

Mobile App (Android / iOS)

Cloud database integration

AI-based demand prediction

NGO rating & feedback system

WhatsApp / SMS notifications

Disaster relief & emergency mode

Government & corporate partnerships

🌟 Social Impact

Ensures transparent & trusted donations

Reduces resource wastage

Encourages student & youth participation

Creates a scalable model for social good

🏆 Hackathon Value

Real-world problem

Working prototype

Scalable architecture

Strong social impact

Low-cost & high-efficiency solution

👩‍💻 Team

Team_CodeSHE – TECHMENTORX
Built with ❤️ during a Hackathon to create real social impact.

📜 License

This project is developed for educational and hackathon purposes.
