from flask import Flask, request, jsonify, send_from_directory
import json, math, os

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(APP_DIR, "ngo_info_by_city_with_volunteers.json")
USERS_PATH = os.path.join(APP_DIR, "users.json")
DONATION_REQUESTS_PATH = os.path.join(APP_DIR, "donation_requests.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    NGO_BY_CITY = json.load(f)

def haversine_km(lat1, lon1, lat2, lon2):
    # Earth radius in km
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def nearest_city(lat, lon):
    """
    Picks the city whose NGO location is closest to (lat, lon).
    If nothing matches (shouldn't happen), default to 'Nagpur' if present.
    """
    best_city = None
    best_dist = None
    for city, ngos in NGO_BY_CITY.items():
        for ngo in ngos:
            d = haversine_km(lat, lon, float(ngo["latitude"]), float(ngo["longitude"]))
            if best_dist is None or d < best_dist:
                best_dist = d
                best_city = city
    if best_city is None:
        best_city = "Nagpur" if "Nagpur" in NGO_BY_CITY else (next(iter(NGO_BY_CITY.keys())) if NGO_BY_CITY else None)
        best_dist = None
    return best_city, best_dist

app = Flask(__name__, static_folder=".", static_url_path="")

@app.get("/")
def root():
    # Open login page by default
    return send_from_directory(APP_DIR, "login.html")

@app.get("/<path:filename>")
def static_files(filename):
    return send_from_directory(APP_DIR, filename)

@app.get("/api/cities")
def api_cities():
    return jsonify({"cities": sorted(list(NGO_BY_CITY.keys()))})

@app.get("/api/nearest")
def api_nearest():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lng"))
    except (TypeError, ValueError):
        return jsonify({"error": "Provide numeric lat and lng query params."}), 400

    city, dist_km = nearest_city(lat, lon)
    ngos = NGO_BY_CITY.get(city, [])
    return jsonify({
        "city": city,
        "distance_km": dist_km,
        "ngos": ngos
    })

@app.get("/api/ngos")
def api_ngos():
    city = request.args.get("city", "")
    if not city:
        return jsonify({"error": "Provide city query param."}), 400
    if city not in NGO_BY_CITY:
        return jsonify({"error": f"Unknown city: {city}", "cities": sorted(list(NGO_BY_CITY.keys()))}), 404
    return jsonify({"city": city, "ngos": NGO_BY_CITY[city]})

@app.get("/api/items_catalog")
def api_items_catalog():
    catalog_path = os.path.join(APP_DIR, "items_catalog.json")
    try:
        with open(catalog_path, "r", encoding="utf-8") as f:
            catalog = json.load(f)
        return jsonify(catalog)
    except FileNotFoundError:
        return jsonify({"error": "Items catalog not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid items catalog format"}), 500

@app.post("/api/login")
def api_login():
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Load users from JSON file
        try:
            with open(USERS_PATH, "r", encoding="utf-8") as f:
                users = json.load(f)
        except FileNotFoundError:
            return jsonify({"error": "Users database not found"}), 500
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid users database format"}), 500
        
        # Find user by email
        user = None
        for u in users:
            if u.get("email", "").lower() == email:
                user = u
                break
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Check password
        if user.get("password") != password:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Login successful - return user data (without password)
        return jsonify({
            "user_id": user.get("user_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "city": user.get("city"),
            "points": user.get("points", 0),
            "badges": user.get("badges", [])
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Server error during login"}), 500

def _load_donation_requests():
    try:
        with open(DONATION_REQUESTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def _save_donation_requests(requests_list):
    with open(DONATION_REQUESTS_PATH, "w", encoding="utf-8") as f:
        json.dump(requests_list, f, indent=2, ensure_ascii=False)

def _group_requests_by_request_id(records, ngo_id_filter=None):
    """Filter by ngo_id if provided, then group by request_id. Returns list of aggregated requests."""
    if ngo_id_filter:
        records = [r for r in records if (r.get("ngo_id") or "").strip() == ngo_id_filter]
    groups = {}
    for r in records:
        rid = r.get("request_id") or r.get("donation_id") or ("single-" + r.get("donation_id", ""))
        if rid not in groups:
            groups[rid] = {
                "request_id": rid,
                "donor_name": r.get("donor_name") or "",
                "donor_phone": r.get("donor_phone") or "",
                "donor_email": r.get("donor_email") or "",
                "ngo_id": r.get("ngo_id") or "",
                "ngo_name": r.get("ngo_name") or "",
                "city": r.get("city") or "",
                "mode": r.get("mode") or "",
                "preferred_time": r.get("preferred_time"),
                "address": r.get("address"),
                "status": r.get("status") or "Pending",
                "created_at": r.get("created_at") or "",
                "items": [],
            }
        groups[rid]["items"].append({
            "item_category": r.get("item_category") or "",
            "item_name": r.get("item_name") or "",
            "quantity": r.get("quantity") or 1,
            "condition": r.get("condition") or "",
        })
    return list(groups.values())

@app.get("/api/donation_requests")
def api_get_donation_requests():
    """Get donation requests, optionally filtered by ngo_id. Returns list grouped by request_id."""
    ngo_id = (request.args.get("ngo_id") or "").strip()
    try:
        records = _load_donation_requests()
        grouped = _group_requests_by_request_id(records, ngo_id if ngo_id else None)
        return jsonify({"requests": grouped}), 200
    except Exception as e:
        print(f"Donation requests list error: {e}")
        return jsonify({"error": "Failed to load donation requests"}), 500

@app.patch("/api/donation_requests/<request_id>/status")
def api_update_request_status(request_id):
    """Update status of all records for this request_id (e.g. mark as Completed). Body: { \"status\": \"Completed\" }."""
    if not (request_id or "").strip():
        return jsonify({"error": "request_id required"}), 400
    try:
        data = request.get_json() or {}
        new_status = (data.get("status") or "").strip() or "Completed"
        requests_list = _load_donation_requests()
        updated = 0
        for r in requests_list:
            if (r.get("request_id") or r.get("donation_id")) == request_id:
                r["status"] = new_status
                updated += 1
        if updated == 0:
            return jsonify({"error": "Request not found"}), 404
        _save_donation_requests(requests_list)
        return jsonify({"success": True, "updated": updated, "status": new_status}), 200
    except Exception as e:
        print(f"Update status error: {e}")
        return jsonify({"error": "Failed to update status"}), 500

@app.get("/api/ngos_all")
def api_ngos_all():
    """Return flat list of all NGOs with city, ngo_id, name for NGO selector."""
    out = []
    for city, ngos in NGO_BY_CITY.items():
        for ngo in ngos:
            out.append({
                "city": city,
                "ngo_id": ngo.get("ngo_id") or "",
                "name": ngo.get("name") or "",
            })
    return jsonify({"ngos": out})

@app.post("/api/donation_request")
def api_donation_request():
    """Save a pickup or drop-off donation request. Expects JSON: donor_name, donor_phone, donor_email (optional),
       ngo_id, ngo_name, city, mode ('pickup'|'dropoff'), items (list of {item_category, item_name, quantity, condition}),
       preferred_time (optional), address (optional for pickup)."""
    try:
        data = request.get_json() or {}
        donor_name = (data.get("donor_name") or "").strip()
        donor_phone = (data.get("donor_phone") or "").strip()
        donor_email = (data.get("donor_email") or "").strip()
        ngo_id = (data.get("ngo_id") or "").strip()
        ngo_name = (data.get("ngo_name") or "").strip()
        city = (data.get("city") or "").strip()
        mode = (data.get("mode") or "").strip().lower()
        items = data.get("items")
        preferred_time = (data.get("preferred_time") or "").strip()
        address = (data.get("address") or "").strip()

        if not donor_name or len(donor_name) < 2:
            return jsonify({"error": "Valid donor name is required"}), 400
        if not donor_phone or len(donor_phone) < 10:
            return jsonify({"error": "Valid phone number is required"}), 400
        if not ngo_id or not city:
            return jsonify({"error": "NGO and city are required"}), 400
        if mode not in ("pickup", "dropoff"):
            return jsonify({"error": "Mode must be 'pickup' or 'dropoff'"}), 400
        if not items or not isinstance(items, list) or len(items) == 0:
            return jsonify({"error": "At least one donation item is required"}), 400

        requests_list = _load_donation_requests()
        import uuid
        request_id = "DR" + uuid.uuid4().hex[:8].upper()

        for idx, it in enumerate(items):
            item_category = (it.get("item_category") or "").strip()
            item_name = (it.get("item_name") or "").strip()
            try:
                quantity = int(it.get("quantity"), 10) if it.get("quantity") is not None else 1
            except (TypeError, ValueError):
                quantity = 1
            condition = (it.get("condition") or "").strip()
            donation_id = f"{request_id}-{idx + 1}"
            record = {
                "donation_id": donation_id,
                "request_id": request_id,
                "donor_name": donor_name,
                "donor_phone": donor_phone,
                "donor_email": donor_email,
                "ngo_id": ngo_id,
                "ngo_name": ngo_name,
                "city": city,
                "mode": "Pickup" if mode == "pickup" else "Drop-off",
                "item_category": item_category,
                "item_name": item_name,
                "quantity": max(1, quantity),
                "condition": condition,
                "preferred_time": preferred_time or None,
                "address": address or None,
                "status": "Pending",
                "created_at": __import__("datetime").datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            requests_list.append(record)

        _save_donation_requests(requests_list)
        return jsonify({
            "success": True,
            "request_id": request_id,
            "message": "Donation request submitted successfully.",
        }), 200
    except Exception as e:
        print(f"Donation request error: {e}")
        return jsonify({"error": "Server error while saving donation request"}), 500

if __name__ == "__main__":
    # Run: python app.py
    # Then open: http://127.0.0.1:5000/ (login page opens first)
    app.run(host="127.0.0.1", port=5000, debug=True)
