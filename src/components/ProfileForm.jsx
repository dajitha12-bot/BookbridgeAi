"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "../actions/authActions";
import { saveLocationAction } from "../actions/locationActions";
import { User, Phone, MapPin, AlertCircle, CheckCircle2, RefreshCw, Compass, ShieldCheck } from "lucide-react";
function ProfileForm({ initialUser }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [city, setCity] = useState(initialUser.profile?.city || "Chennai");
  const [area, setArea] = useState(initialUser.profile?.area || "");
  const [address, setAddress] = useState(initialUser.profile?.address || "");
  const [pincode, setPincode] = useState(initialUser.profile?.pincode || "");
  const [latitude, setLatitude] = useState(initialUser.profile?.latitude || null);
  const [longitude, setLongitude] = useState(initialUser.profile?.longitude || null);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Not requested yet");
  const [locationError, setLocationError] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const formatDate = (date) => {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location access is not supported by this browser.");
      setLocationStatus("Unsupported browser");
      return;
    }
    setIsFetchingLocation(true);
    setLocationError(null);
    setLocationStatus("Requesting browser location permission...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        const nowStr = formatDate(/* @__PURE__ */ new Date());
        setLatitude(lat);
        setLongitude(lng);
        setAccuracy(Math.round(acc));
        setLastUpdated(nowStr);
        setLocationStatus("Location access enabled");
        setIsFetchingLocation(false);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`).then((r) => r.json()).then((geo) => {
          if (geo && geo.address) {
            const detectedCity = geo.address.city || geo.address.town || geo.address.state_district;
            const detectedArea = geo.address.suburb || geo.address.neighbourhood || geo.address.road;
            const detectedPin = geo.address.postcode;
            if (detectedCity && !city) setCity(detectedCity);
            if (detectedArea && !area) setArea(detectedArea);
            if (detectedPin && !pincode) setPincode(detectedPin);
          }
        }).catch(() => {
        });
      },
      (err) => {
        setIsFetchingLocation(false);
        setLocationStatus("Location access error");
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location permission was denied. Please allow location access in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Your current location could not be determined.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An error occurred while retrieving your location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 1e4,
        maximumAge: 0
      }
    );
  };
  const handleSaveLocation = async () => {
    if (latitude === null || longitude === null) {
      alert("Please fetch your location first before saving.");
      return;
    }
    setIsSavingLocation(true);
    try {
      const res = await saveLocationAction({
        latitude,
        longitude,
        accuracy: accuracy || void 0,
        address,
        city,
        pincode
      });
      if (res.success) {
        setMessage({ success: true, text: "\u{1F4CD} Real-time device location saved successfully to your SQLite profile!" });
        router.refresh();
      } else {
        setMessage({ success: false, text: res.error || "Failed to save location." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An unexpected error occurred while saving location." });
    } finally {
      setIsSavingLocation(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("city", city);
    formData.append("area", area);
    formData.append("address", address);
    formData.append("pincode", pincode);
    if (latitude !== null) formData.append("latitude", latitude.toString());
    if (longitude !== null) formData.append("longitude", longitude.toString());
    try {
      const res = await updateProfileAction(formData);
      if (res.success) {
        setMessage({ success: true, text: "Profile updated successfully!" });
        router.refresh();
      } else {
        setMessage({ success: false, text: res.error || "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="max-w-3xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold">My Profile & Location Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure your contact information, delivery address, and real-time device location coordinates.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm sm:p-8 space-y-6">
        {message && <div
    className={`p-3.5 rounded-lg flex items-start space-x-2.5 text-xs font-semibold ${message.success ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-rose-50 border border-rose-100 text-rose-600"}`}
  >
            {message.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {
    /* Name */
  }
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
    type="text"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
  />
              </div>
            </div>

            {
    /* Email (Disabled) */
  }
            <div className="space-y-1.5 opacity-60">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address (Locked)</label>
              <input
    type="email"
    disabled
    value={initialUser.email}
    className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 bg-slate-50 cursor-not-allowed"
  />
            </div>

            {
    /* Phone */
  }
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
    type="tel"
    required
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
  />
              </div>
            </div>

            {
    /* City */
  }
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">City</label>
              <select
    value={city}
    onChange={(e) => setCity(e.target.value)}
    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
  >
                {["Chennai", "Madurai", "Coimbatore", "Tiruchirappalli", "Tirunelveli", "Bangalore", "Hyderabad"].map((c) => <option key={c} value={c}>
                    {c}
                  </option>)}
              </select>
            </div>

            {
    /* Area */
  }
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Area / Neighborhood</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
    type="text"
    required
    value={area}
    onChange={(e) => setArea(e.target.value)}
    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
  />
              </div>
            </div>

            {
    /* Pincode */
  }
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pincode</label>
              <input
    type="text"
    required
    value={pincode}
    onChange={(e) => setPincode(e.target.value)}
    className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
  />
            </div>
          </div>

          {
    /* Address */
  }
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Saved Delivery Address</label>
            <textarea
    required
    rows={3}
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
  />
          </div>

          {
    /* ================================================== */
  }
          {
    /* LOCATION SECTION (PART 1 REQUIREMENTS) */
  }
          {
    /* ================================================== */
  }
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
                  <Compass className="w-5 h-5 animate-pulse text-sky-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-wide uppercase">LOCATION</h3>
                  <p className="text-[11px] text-slate-400">Current Location & Device GPS Coordinates</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                HTML5 Geolocation API
              </span>
            </div>

            {
    /* Current Location Metrics */
  }
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
              <div className="text-slate-300 font-bold text-xs uppercase tracking-wider text-sky-400">Current Location</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Latitude</span>
                  <span className="font-mono text-sm font-bold text-white">{latitude !== null ? latitude.toFixed(6) : "Not fetched"}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Longitude</span>
                  <span className="font-mono text-sm font-bold text-white">{longitude !== null ? longitude.toFixed(6) : "Not fetched"}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Accuracy</span>
                  <span className="font-semibold text-emerald-400">{accuracy !== null ? `\xB1${accuracy} meters` : "N/A"}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Last Updated</span>
                  <span className="font-medium text-slate-200">{lastUpdated || "Not updated yet"}</span>
                </div>
              </div>

              {
    /* Status Banner */
  }
              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Location Status:</span>
                <span
    className={`font-bold px-2 py-0.5 rounded text-[10px] ${locationStatus.includes("enabled") ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : locationStatus.includes("error") ? "bg-rose-950 text-rose-400 border border-rose-800/40" : "bg-slate-800 text-slate-300"}`}
  >
                  {locationStatus}
                </span>
              </div>

              {locationError && <div className="bg-rose-950/60 border border-rose-800/50 p-2.5 rounded-lg text-rose-300 text-xs font-semibold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{locationError}</span>
                </div>}
            </div>

            {
    /* Location Control Buttons */
  }
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
    type="button"
    disabled={isFetchingLocation}
    onClick={handleGetCurrentLocation}
    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer disabled:bg-slate-800 border border-sky-400/30"
  >
                {isFetchingLocation ? <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-200" />
                    <span>Getting Location...</span>
                  </> : <>
                    <MapPin className="w-3.5 h-3.5 text-sky-200" />
                    <span>📍 Get Current Location</span>
                  </>}
              </button>

              <button
    type="button"
    disabled={isFetchingLocation}
    onClick={handleGetCurrentLocation}
    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
  >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Refresh Location</span>
              </button>

              <button
    type="button"
    disabled={isSavingLocation || latitude === null}
    onClick={handleSaveLocation}
    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border border-emerald-400/30"
  >
                {isSavingLocation ? <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                    <span>Saving...</span>
                  </> : <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Save Current Location</span>
                  </>}
              </button>
            </div>
          </div>

          {
    /* Submit Profile */
  }
          <button
    type="submit"
    disabled={submitting}
    className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
  >
            {submitting ? "Saving Profile..." : "Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>;
}
export {
  ProfileForm as default
};
