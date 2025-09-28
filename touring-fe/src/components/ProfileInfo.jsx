import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/context";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

/* ---- fetch helpers ---- */
async function apiFetch(path, opts = {}) {
  const r = await fetch(path, {
    credentials: "include",
    headers: { Accept: "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!r.ok) {
    const msg =
      (
        await r
          .clone()
          .json()
          .catch(() => null)
      )?.message ||
      (await r.text().catch(() => "")) ||
      `HTTP ${r.status}`;
    throw new Error(msg);
  }
  const ct = r.headers.get("content-type") || "";
  return ct.includes("application/json") ? r.json() : null;
}
const apiGet = (p, opts) => apiFetch(p, { method: "GET", ...opts });

export default function ProfileInfo() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [provinceId, setProvinceId] = useState(
    user?.location?.provinceId || ""
  );
  const [wardId, setWardId] = useState(user?.location?.wardId || "");
  const [addressLine, setAddressLine] = useState(
    user?.location?.addressLine || ""
  );
  const [phoneError, setPhoneError] = useState("");
  // options
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  // loading
  const [saving, setSaving] = useState(false);

  // flag để tránh reset khi re-sync từ user (ví dụ sau khi save)
  const skipResetOnProvince = useRef(false);

  // baseline để detect dirty - moved inside component to always get fresh user data
  const getBaseline = () => ({
    name: user?.name || "",
    phone: user?.phone || "",
    location: {
      provinceId: user?.location?.provinceId || "",
      wardId: user?.location?.wardId || "",
      addressLine: user?.location?.addressLine || "",
    },
  });

  const formDirty = (() => {
    const baseline = getBaseline();
    return (
      (name ?? "") !== baseline.name ||
      (phone ?? "") !== baseline.phone ||
      (provinceId ?? "") !== baseline.location.provinceId ||
      (wardId ?? "") !== baseline.location.wardId ||
      (addressLine ?? "") !== baseline.location.addressLine
    );
  })();

  // re-sync khi user thay đổi (sau khi save)
  useEffect(() => {
    if (user) {
      skipResetOnProvince.current = true;

      setName(user.name || "");
      setPhone(user.phone || "");
      setProvinceId(user.location?.provinceId || "");
      setWardId(user.location?.wardId || "");
      setAddressLine(user.location?.addressLine || "");
    }
  }, [user]);

  // load provinces
  useEffect(() => {
    const ac = new AbortController();
    apiGet("/api/vn/provinces", { signal: ac.signal })
      .then(setProvinces)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Failed to load provinces:', error);
          toast.error('Failed to load provinces');
        }
      });
    return () => ac.abort();
  }, []);

  // load wards khi province thay đổi
  useEffect(() => {
    const ac = new AbortController();

    if (!skipResetOnProvince.current) {
      setWards([]);
      setWardId("");
    }

    if (provinceId) {
      apiGet(`/api/vn/wards?province_id=${provinceId}`, { signal: ac.signal })
        .then(setWards)
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Failed to load wards:', error);
            toast.error('Failed to load wards');
          }
        });
    }

    skipResetOnProvince.current = false;
    return () => ac.abort();
  }, [provinceId]);

  async function saveAll(e) {
    e?.preventDefault();
    
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    if (!provinceId || !wardId) {
      toast.error("Please select Province and Ward");
      return;
    }
    
    // Validate phone if provided
    if (phone && phoneError) {
      toast.error("Please fix phone number format");
      return;
    }
    
    setSaving(true);
    
    try {
      const updated = await toast.promise(
        apiFetch("/api/profile/info", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            phone: (phone ?? "").trim(),
            location: { 
              provinceId, 
              wardId, 
              addressLine: (addressLine ?? "").trim() 
            },
          }),
        }),
        {
          loading: "Saving profile...",
          success: "Profile saved successfully!",
          error: (error) => `Save failed: ${error.message}`,
        }
      );

      setUser(updated);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  }

  // Phone validation function
  const validatePhone = (phoneValue) => {
    if (!phoneValue) {
      setPhoneError("");
      return;
    }
    
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(phoneValue)) {
      setPhoneError(
        "Invalid phone number format (e.g: 09xxxxxxxx, 03xxxxxxxx...)"
      );
    } else {
      setPhoneError("");
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Your Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Edit your information. Use the Save button at the end.
          </p>
        </div>

        <form onSubmit={saveAll} className="p-6 space-y-6">
          {/* Name */}
          <Section title="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </Section>

          {/* Phone */}
          <Section title="Phone">
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                setPhone(val);
                validatePhone(val);
              }}
              placeholder="Enter phone number"
              className={`mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                phoneError
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {phoneError && (
              <p className="mt-1 text-sm text-red-600">{phoneError}</p>
            )}
          </Section>

          {/* Location (Province & Ward) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Province *
              </label>
              <select
                value={provinceId}
                onChange={(e) => setProvinceId(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">-- Select Province --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Ward *
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                disabled={!provinceId || wards.length === 0}
                className="mt-1 w-full px-4 py-2 rounded-lg border disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">-- Select Ward --</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address line */}
          <Section title="Address line (optional)">
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="House number, street..."
              className="mt-1 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </Section>

          {/* Email & Role (read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="text"
                value={user.email || ""}
                disabled
                className="mt-1 w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Role</label>
              <input
                type="text"
                value={user.role || ""}
                disabled
                className="mt-1 w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          {/* Save */}
          {formDirty && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving || !!phoneError}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-colors"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          )}
        </form>
      </div>
      <Toaster/>
    </>
  );
}

/* ---- UI helpers ---- */
function Section({ title, children }) {
  return (
    <div className="p-5 border rounded-xl">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}