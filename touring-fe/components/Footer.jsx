export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* About */}
        <div>
          <h4 className="font-semibold mb-3">About Klook</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">About us</a></li>
            <li><a href="#">Newsroom</a></li>
            <li><a href="#">Klook Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Sustainability</a></li>
          </ul>
        </div>

        {/* Partnerships */}
        <div>
          <h4 className="font-semibold mb-3">Partnerships</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">Merchant sign up</a></li>
            <li><a href="#">Merchant log in</a></li>
            <li><a href="#">Affiliate Partnership</a></li>
            <li><a href="#">Influencer Program</a></li>
            <li><a href="#">Agent Marketplace</a></li>
            <li><a href="#">Klook Partner Hub</a></li>
            <li><a href="#">Collaborate with Klook</a></li>
          </ul>
        </div>

        {/* Terms of use */}
        <div>
          <h4 className="font-semibold mb-3">Terms of use</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">General terms of use</a></li>
            <li><a href="#">Privacy policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">Bug Bounty Program</a></li>
            <li><a href="#">Animal Welfare Policy</a></li>
          </ul>
        </div>

        {/* Payment channels */}
        <div>
          <h4 className="font-semibold mb-3">Payment channels</h4>
          <div className="flex flex-wrap gap-2">
            <img src="/visa.png" alt="Visa" className="h-6" />
            <img src="/mastercard.png" alt="MasterCard" className="h-6" />
            <img src="/paypal.png" alt="PayPal" className="h-6" />
            <img src="/applepay.png" alt="Apple Pay" className="h-6" />
            <img src="/gpay.png" alt="Google Pay" className="h-6" />
            {/* ... thêm các logo khác */}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <p>© 2014–2025 Klook. All rights reserved.</p>
        <div className="flex gap-4 mt-3 md:mt-0 text-xl">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-x-twitter"></i></a>
          <a href="#"><i className="fab fa-tiktok"></i></a>
        </div>
      </div>
    </footer>
  );
}
