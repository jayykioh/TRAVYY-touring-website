// import React, { useState, useEffect } from "react";
// import { getGuideProfile } from "../../../TravelAgency/guideAPI";

// const WelcomeBanner = () => {
//   const [guideData, setGuideData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchGuideData = async () => {
//       try {
//         const data = await getGuideProfile();
//         setGuideData(data);
//       } catch (error) {
//         console.error("Failed to fetch guide profile:", error);
//         // Fallback to default values if API fails
//         setGuideData({
//           name: "Hướng dẫn viên",
//           totalTours: 0,
//           rating: 0
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGuideData();
//   }, []);

//   const currentHour = new Date().getHours();
//   const greeting =
//     currentHour < 12
//       ? "Chào buổi sáng"
//       : currentHour < 18
//       ? "Chào buổi chiều"
//       : "Chào buổi tối";

//   if (loading) {
//     return (
//       <div className="bg-gradient-to-r from-[#02A0AA] to-[#029ca6] rounded-2xl p-6 text-white shadow-lg">
//         <div className="animate-pulse">
//           <div className="h-6 bg-white/20 rounded w-64 mb-2"></div>
//           <div className="h-4 bg-white/20 rounded w-96"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-r from-[#02A0AA] to-[#029ca6] rounded-2xl p-6 text-white shadow-lg">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold mb-1">
//             {greeting}, {guideData?.name || "Hướng dẫn viên"}! 👋
//           </h2>
//           <p className="text-white opacity-90 text-sm">
//             Bạn có tour hôm nay. Hãy tạo cho họ một trải nghiệm đáng nhớ!
//           </p>
//         </div>

//         <div className="hidden md:flex items-center gap-6">
//           <div className="text-center">
//             <p className="text-3xl font-bold">{guideData?.totalTours || 0}</p>
//             <p className="text-white opacity-80 text-xs">Tổng tour</p>
//           </div>
//           <div className="w-px h-12 bg-white opacity-30" />
//           <div className="text-center">
//             <p className="text-3xl font-bold flex items-center gap-1">
//               {guideData?.rating || 0} <span className="text-yellow-300">⭐</span>
//             </p>
//             <p className="text-white opacity-80 text-xs">Đánh giá</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WelcomeBanner;
