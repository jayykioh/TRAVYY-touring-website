export const mockEarnings = {
  summary: {
    thisWeek: 15760000,
    thisMonth: 48500000,
    lastMonth: 52300000,
    totalEarnings: 287600000,
    pendingPayment: 4200000
  },
  weeklyData: [
    { day: "Mon", amount: 3600000 },
    { day: "Tue", amount: 0 },
    { day: "Wed", amount: 5440000 },
    { day: "Thu", amount: 0 },
    { day: "Fri", amount: 6720000 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 }
  ],
  recentPayments: [
    {
      id: "pay-001",
      tourId: "tour-101",
      tourName: "Hue Imperial City & Royal Tombs",
      date: "2025-10-25",
      amount: 3600000,
      commission: 20,
      netAmount: 3600000,
      status: "paid",
      paidAt: "2025-10-26T10:00:00"
    },
    {
      id: "pay-002",
      tourId: "tour-102",
      tourName: "Ninh Binh Tam Coc & Bai Dinh Pagoda",
      date: "2025-10-23",
      amount: 5440000,
      commission: 20,
      netAmount: 5440000,
      status: "paid",
      paidAt: "2025-10-24T10:00:00"
    },
    {
      id: "pay-003",
      tourId: "tour-103",
      tourName: "Nha Trang Beach & Island Hopping",
      date: "2025-10-20",
      amount: 6720000,
      commission: 20,
      netAmount: 6720000,
      status: "paid",
      paidAt: "2025-10-21T10:00:00"
    },
    {
      id: "pay-004",
      tourId: "tour-001",
      tourName: "Hanoi Street Food & Old Quarter Walking Tour",
      date: "2025-10-27",
      amount: 1500000,
      commission: 20,
      netAmount: 1200000,
      status: "pending",
      expectedPayout: "2025-10-29"
    },
    {
      id: "pay-005",
      tourId: "tour-002",
      tourName: "Cu Chi Tunnels Half-Day Tour",
      date: "2025-10-28",
      amount: 4200000,
      commission: 20,
      netAmount: 3360000,
      status: "pending",
      expectedPayout: "2025-10-30"
    }
  ],
  monthlyStats: [
    { month: "T1", earnings: 45000000 },
    { month: "T2", earnings: 52000000 },
    { month: "T3", earnings: 48000000 },
    { month: "T4", earnings: 62000000 }
  ],
  yearlyStats: [
    { month: "Jan", earnings: 38000000 },
    { month: "Feb", earnings: 42000000 },
    { month: "Mar", earnings: 45000000 },
    { month: "Apr", earnings: 50000000 },
    { month: "May", earnings: 42000000 },
    { month: "Jun", earnings: 48500000 },
    { month: "Jul", earnings: 55200000 },
    { month: "Aug", earnings: 51800000 },
    { month: "Sep", earnings: 52300000 },
    { month: "Oct", earnings: 48500000 },
    { month: "Nov", earnings: 47000000 },
    { month: "Dec", earnings: 53000000 }
  ]
};
