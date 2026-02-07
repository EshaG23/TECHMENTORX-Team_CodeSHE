// SevaSetu — location page logic (v4)
// Change requested: show ALL NGOs for the selected city (no "Show more").
// Still: click NGO -> show NGO + volunteer details.

const NEXT_PAGE = "pickup.html";

// UI refs
const statusText = document.getElementById("statusText");
const latVal = document.getElementById("latVal");
const lngVal = document.getElementById("lngVal");
const cityVal = document.getElementById("cityVal");
const distVal = document.getElementById("distVal");

const ngoList = document.getElementById("ngoList");
const btnContinue = document.getElementById("btnContinue");

const citySelect = document.getElementById("citySelect");
const btnUseCity = document.getElementById("btnUseCity");

// option picker
const pickAuto = document.getElementById("pickAuto");
const pickManual = document.getElementById("pickManual");
const autoSection = document.getElementById("autoSection");
const manualSection = document.getElementById("manualSection");

// Details
const detailsBox = document.getElementById("detailsBox");
const dNgo = document.getElementById("dNgo");
const dNgoId = document.getElementById("dNgoId");
const dNgoPhone = document.getElementById("dNgoPhone");
const dVol = document.getElementById("dVol");
const dVolPhone = document.getElementById("dVolPhone");
const dVolEmail = document.getElementById("dVolEmail");

// Optional: if you added volunteer role in JSON (you did)
let dVolRole = document.getElementById("dVolRole");

let map, marker;

let current = { lat: null, lng: null, city: null };
let currentNgos = [];

let citiesLoaded = false;
let mode = "auto"; // auto | manual
let gpsStarted = false;

function setStatus(msg){ statusText.textContent = msg; }

function fmt(n, digits=6){
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

function escapeHtml(str){
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setLatLngUI(lat, lng){
  current.lat = lat;
  current.lng = lng;
  latVal.textContent = fmt(lat);
  lngVal.textContent = fmt(lng);
}

function initMapOnce(lat, lng){
  if (map) return;
  map = L.map("map").setView([lat, lng], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  marker.bindPopup("Drag me if needed").openPopup();

  marker.on("dragend", async () => {
    const pos = marker.getLatLng();
    setLatLngUI(pos.lat, pos.lng);
    map.panTo(pos);
    await updateFromLatLng(pos.lat, pos.lng, "marker drag");
  });
}

function setMapLatLng(lat, lng, zoom=12){
  initMapOnce(lat, lng);
  const ll = L.latLng(lat, lng);
  map.setView(ll, zoom, { animate: true });
  marker.setLatLng(ll);
}

function showDetails(ngo){
  if (!ngo) return;
  const vol = ngo.volunteer || {};

  dNgo.textContent = ngo.name || "—";
  dNgoId.textContent = ngo.ngo_id || "—";
  dNgoPhone.textContent = ngo.phone || "—";

  dVol.textContent = vol.name || "—";
  dVolPhone.textContent = vol.phone || "—";
  dVolEmail.textContent = vol.email || "—";

  // If role exists in JSON, show it (we'll add the field in HTML below)
  if (dVolRole) dVolRole.textContent = vol.role || "—";

  detailsBox.style.display = "block";
}

function redirectToDonation(ngo){
  if (!ngo) return;
  
  const params = new URLSearchParams({
    ngo_id: ngo.ngo_id || "",
    ngo_name: ngo.name || "",
    city: current.city || "",
    lat: (typeof current.lat === "number") ? String(current.lat) : "",
    lng: (typeof current.lng === "number") ? String(current.lng) : ""
  });
  
  window.location.href = `donation.html?${params.toString()}`;
}

function renderNgoList(){
  ngoList.innerHTML = "";
  detailsBox.style.display = "none";

  if (!currentNgos || currentNgos.length === 0){
    ngoList.innerHTML = `<div class="muted">No NGOs found for this city.</div>`;
    return;
  }

  // show ALL
  currentNgos.forEach((n) => {
    const v = n.volunteer || {};
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="left">
        <div class="ngo">${escapeHtml(n.name)} <span class="muted">(${escapeHtml(n.ngo_id)})</span></div>
        <div class="vol">Volunteer: ${escapeHtml(v.name || "—")} • ${escapeHtml(v.phone || "—")}</div>
      </div>
      <div class="pill">Donate →</div>
    `;
    div.addEventListener("click", () => redirectToDonation(n));
    ngoList.appendChild(div);
  });
}

async function loadCitiesOnce(){
  if (citiesLoaded) return;
  const res = await fetch("/api/cities");
  const js = await res.json();
  citySelect.innerHTML = "";
  (js.cities || []).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    citySelect.appendChild(opt);
  });
  citiesLoaded = true;
}

function getCityCenterFromNgos(ngos){
  if (!ngos || ngos.length === 0) return null;
  const n0 = ngos[0];
  const lat = Number(n0.latitude);
  const lng = Number(n0.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

function enableContinue(){
  btnContinue.disabled = !(current.city);
}

async function applyCity(city, ngos, distLabel){
  current.city = city;
  cityVal.textContent = city || "—";
  distVal.textContent = distLabel || "—";

  // sync dropdown
  if (city){
    for (const opt of citySelect.options){
      if (opt.value === city){ citySelect.value = city; break; }
    }
  }

  currentNgos = Array.isArray(ngos) ? ngos : [];
  renderNgoList();

  const center = getCityCenterFromNgos(currentNgos);
  if (center){
    setLatLngUI(center.lat, center.lng);
    setMapLatLng(center.lat, center.lng, 12);
  }

  enableContinue();
}

async function updateFromLatLng(lat, lng, reason="GPS"){
  setLatLngUI(lat, lng);
  setMapLatLng(lat, lng, 12);
  setStatus(`Location set via ${reason}. Matching nearest city…`);

  try{
    const res = await fetch(`/api/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
    const js = await res.json();
    if (js.error) throw new Error(js.error);

    const dist = (typeof js.distance_km === "number") ? `${js.distance_km.toFixed(1)} km` : "—";
    await applyCity(js.city, js.ngos, dist);

    setStatus(`Matched city: ${js.city}. NGOs loaded. You can continue.`);
  }catch(err){
    console.error(err);
    setStatus("Could not match city automatically. Try manual selection.");
    current.city = null;
    currentNgos = [];
    renderNgoList();
    enableContinue();
  }
}

async function startGPS(){
  if (gpsStarted) return;
  gpsStarted = true;

  await loadCitiesOnce();

  const fallback = { lat: 21.1458, lng: 79.0882 };
  initMapOnce(fallback.lat, fallback.lng);

  if (!navigator.geolocation){
    setStatus("Geolocation not supported. Please use manual selection.");
    return;
  }

  setStatus("Requesting GPS permission…");

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    setStatus("GPS detected. Loading NGOs…");
    await updateFromLatLng(lat, lng, "GPS");
  }, async (err) => {
    console.warn(err);
    setStatus("GPS permission denied/unavailable. Switch to manual selection.");
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
}

function setMode(newMode){
  mode = newMode;

  pickAuto.classList.toggle("active", mode === "auto");
  pickManual.classList.toggle("active", mode === "manual");

  autoSection.style.display = (mode === "auto") ? "block" : "none";
  manualSection.style.display = (mode === "manual") ? "block" : "none";

  if (mode === "auto"){
    startGPS();
  }else{
    loadCitiesOnce();
    const fallback = { lat: 21.1458, lng: 79.0882 };
    setMapLatLng(fallback.lat, fallback.lng, 5);
    setStatus("Choose a city manually, then click “Use this city”.");
  }
}

pickAuto.addEventListener("click", () => setMode("auto"));
pickManual.addEventListener("click", () => setMode("manual"));

btnUseCity.addEventListener("click", async () => {
  const city = citySelect.value;
  if (!city) return;

  setStatus(`Loading NGOs for ${city}…`);

  const res = await fetch(`/api/ngos?city=${encodeURIComponent(city)}`);
  const js = await res.json();
  if (js.error){
    setStatus(js.error);
    return;
  }

  await applyCity(city, js.ngos, "Manual");
  setStatus(`City set to ${city}. NGOs loaded. You can continue.`);
});

btnContinue.addEventListener("click", () => {
  if (!current.city) return;

  const q = new URLSearchParams({
    city: current.city,
    lat: (typeof current.lat === "number") ? String(current.lat) : "",
    lng: (typeof current.lng === "number") ? String(current.lng) : ""
  });

  window.location.href = `${NEXT_PAGE}?${q.toString()}`;
});

// boot
(async function boot(){
  initMapOnce(21.1458, 79.0882);
  await loadCitiesOnce();
  setMode("auto");
})();
