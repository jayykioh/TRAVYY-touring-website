export const generateChartData = (points = 7, trend = 'up') => {
  return Array.from({ length: points }, (_, i) => ({
    value: trend === 'up' 
      ? Math.floor(Math.random() * 30) + i * 10 + 50
      : Math.floor(Math.random() * 30) + (points - i) * 10 + 50
  }));
};
