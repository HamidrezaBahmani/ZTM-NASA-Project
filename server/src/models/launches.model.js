const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const DEFALT_FLIGHT_NUMBER = 100;
const launches = new Map();

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["NASA", "ZTM"],
  upcoming: true,
  success: true,
};
saveLaunch(launch);
launches.set(launch.flightNumber, launch);

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );

  return aborted.modifiedCount === 1 && aborted.acknowledged === true;
}

async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFALT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return await launchesDatabase.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  );
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found!");
  }
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

module.exports = {
  getAllLaunches,

  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
