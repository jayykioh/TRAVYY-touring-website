const apiHelper = {
  async post(url, data) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) return { success: false, message: result.message };
      return { success: true, data: result };
    } catch (err) {
      console.error("POST error:", err);
      return { success: false, message: "Server error" };
    }
  },
};

export default apiHelper;
