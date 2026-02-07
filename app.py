from flask import Flask, request, jsonify, send_from_directory
import json, math, os

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(APP_DIR, "ngo_info_by_city_with_volunteers.json")

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
    # Open landing page by default
    return send_from_directory(APP_DIR, "landing.html")

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

if __name__ == "__main__":
    # Run: python app.py
    # Then open: http://127.0.0.1:5000/ (landing page opens first)
    app.run(host="127.0.0.1", port=5000, debug=True)
