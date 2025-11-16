
const routes = [
  // public / main
  { path: '/', label: 'Home', showInFooter: true, exact: true, group: 'main' },
  { path: '/home', label: 'Dashboard', showInFooter: false, group: 'main' },
  { path: '/destinations/:slug', label: 'Destinations', showInFooter: true, group: 'discover' },
  { path: '/region/:slug', label: 'Regions', showInFooter: true, group: 'discover' },
  { path: '/tours/:id', label: 'Tour', showInFooter: false, group: 'tours' },
  { path: '/blog/:id', label: 'Blog', showInFooter: false, group: 'content' },

  // useful pages
  { path: '/available-tours', label: 'Available Tours', showInFooter: true, group: 'product' },
  { path: '/help', label: 'Help Center', showInFooter: true, group: 'support' },
  { path: '/help/category/:category', label: 'Help Category', showInFooter: false, group: 'support' },
  { path: '/help/article/:slug', label: 'Article', showInFooter: false, group: 'support' },

  // account related
  { path: '/profile', label: 'My Profile', showInFooter: false, group: 'account' },
  { path: '/booking', label: 'Booking', showInFooter: true, group: 'account' },

  // static pages
  { path: '/privacy', label: 'Privacy Policy', showInFooter: true, group: 'legal' },
  { path: '/terms', label: 'Terms & Conditions', showInFooter: true, group: 'legal' },
  { path: '/help', label: 'F.A.Q', showInFooter: true, group: 'legal' },

  // itinerary & discoveries
  { path: '/itinerary', label: 'Itinerary', showInFooter: true, group: 'product' },
  { path: '/itinerary/result/:id', label: 'Itinerary Result', showInFooter: false, group: 'product' },

  // admin / special (not in footer)
  { path: '/admin/*', label: 'Admin', showInFooter: false, group: 'admin' },

  // add more entries as needed...
];

export default routes;
