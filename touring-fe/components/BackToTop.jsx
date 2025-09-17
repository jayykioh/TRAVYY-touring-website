import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react"; // icon mũi tên lên

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Bắt sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm cuộn lên trên cùng
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // cuộn mượt
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default BackToTop;
