function calculateHoursDifference(startTime, endTime) {
  const timeDifferenceInMilliseconds = endTime - startTime;
  const millisecondsPerHour = 1000 * 60 * 60;
  return Math.round(timeDifferenceInMilliseconds / millisecondsPerHour);
}

module.exports = calculateHoursDifference;
