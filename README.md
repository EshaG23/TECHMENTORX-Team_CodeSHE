# 🌍 SevaSetu (Social Mentor)
### A Location-Based Donation Coordination Platform

---

## 📌 Problem Statement
Many donors, local businesses, and college social clubs are willing to donate food, clothes, toys, and essential items, but lack a structured platform to connect with NGOs and volunteers.

Existing donation processes are:
- Unorganized  
- Not location-aware  
- Difficult to track  
- Do not recognize volunteer efforts  

As a result, resources are wasted, delayed, or fail to reach the right people in need.

---

## 💡 Solution
**SevaSetu** is a centralized, location-based donation coordination platform that connects **donors, NGOs, and volunteers** to ensure transparent, verified, and efficient donation distribution.

It bridges the gap between **intent and impact**.

---

## ✨ Key Features
- 📍 Auto location detection (GPS & manual)
- 🗺️ Nearby NGO discovery with interactive map
- 📦 Donation management (Food, Clothes, Toys, Essentials)
- 🔐 OTP-based donation verification
- 🚚 Pickup / drop-off scheduling
- 🏆 Gamification (Points, Leaderboard, Badges)
- 📜 Digital certificates for verified contributions
- 📊 Donation history & tracking

---

## ⚙️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Leaflet.js

### Backend
- Python
- Flask (REST APIs)

### Data Storage (Prototype)
- JSON files for:
  - Users
  - NGOs & Volunteers
  - Donation requests & history
  - Leaderboard & Certificates

### Location & Mapping
- Browser Geolocation API
- Haversine Algorithm
- OpenStreetMap

---

## 🏗️ System Architecture
User (Donor)
↓
Frontend (HTML/CSS/JS)
↓
Flask Backend (APIs)
↓
Location Matching + NGO Data
↓
Donation Verification & Tracking


---

## 🚀 How It Works
1. User opens the platform
2. Location is auto-detected or selected manually
3. Nearby NGOs are displayed on the map
4. User selects an NGO and donation category
5. Pickup or drop-off is scheduled
6. Donation is verified using OTP
7. Points & certificates are awarded

---

## 🧪 Run Locally

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/sevasetu.git
cd sevasetu
2️⃣ Install Dependencies
pip install flask
3️⃣ Start Server
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

SMS / WhatsApp notifications

Disaster relief & emergency mode

🌟 Social Impact
Transparent and trusted donations

Reduced resource wastage

Increased student & youth participation

Scalable model for nationwide impact

🏆 Hackathon Value
Real-world problem

Working prototype

Scalable architecture

Strong social impact

👩‍💻 Team
Team_CodeSHE – TECHMENTORX

📜 License
This project is developed for educational and hackathon purposes.
