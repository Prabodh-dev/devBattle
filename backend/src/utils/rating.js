const calculateEloRating = (rating1, rating2, result1) => {
  const K = 32; 
  const expectedScore1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expectedScore2 = 1 - expectedScore1;
  const actualScore1 = result1; 
  const actualScore2 = 1 - actualScore1;
  const newRating1 = Math.round(rating1 + K * (actualScore1 - expectedScore1));
  const newRating2 = Math.round(rating2 + K * (actualScore2 - expectedScore2));
  return {
    newRating1,
    newRating2,
    change1: newRating1 - rating1,
    change2: newRating2 - rating2,
  };
};
module.exports = { calculateEloRating };
