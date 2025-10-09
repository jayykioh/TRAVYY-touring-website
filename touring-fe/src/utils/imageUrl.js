export const optimizeImage = (url, width = 1920) => {
  if (!url) return url;
  if (url.includes("cloudinary.com")) {
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,dpr_auto,w_${width},c_scale/`
    );
  }
};
// Thêm các tham số tối ưu hóa ảnh cho các dịch vụ phổ biến
