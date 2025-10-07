import { useEffect, useState } from "react";

export default function useLocationOptions(provinceId) {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  // Load danh sách tỉnh/thành
  useEffect(() => {
    (async () => {
      try {
        setLoadingProvince(true);
        const res = await fetch("/api/location/provinces", {
          headers: { Accept: "application/json" },
        });
        if (res.ok) setProvinces(await res.json());
      } catch (e) {
        console.error("Fetch provinces error:", e);
      } finally {
        setLoadingProvince(false);
      }
    })();
  }, []);

  // Load quận/huyện khi thay đổi tỉnh
  useEffect(() => {
    if (!provinceId) {
      setWards([]);
      return;
    }
    (async () => {
      try {
        setLoadingWard(true);
        const res = await fetch(
          `/api/location/wards?province_id=${provinceId}`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) setWards(await res.json());
        else setWards([]);
      } catch (e) {
        console.error("Fetch wards error:", e);
        setWards([]);
      } finally {
        setLoadingWard(false);
      }
    })();
  }, [provinceId]);

  return { provinces, wards, loadingProvince, loadingWard };
}
