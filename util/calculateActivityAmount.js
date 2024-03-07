const ActivityModel = require("../models/activities.model");

async function calculateActivitiesAmount(activityIds) {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    return 0;
  }

  const findActivites = await ActivityModel.find({ _id: { $in: activityIds } });
  if (findActivites.length !== activityIds.length) {
    throw new BadRequestError("Invalid Activities");
  }

  return findActivites.reduce((acc, activity) => acc + activity.price, 0);
}

module.exports = calculateActivitiesAmount;
