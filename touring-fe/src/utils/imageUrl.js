export const optimizeImage = (url, width = 1920) => {
  if (!url) return url;
  if (url.includes("cloudinary.com")) {
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,dpr_auto,w_${width},c_scale/`
    );
  }
  return `https://cdn.statically.io/img/${url.replace(
    /^https?:\/\//,
    ""
  )}?quality=80&width=${width}`;
};
