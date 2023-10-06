const fs = require("fs");
const { parse } = require("csv-parse");
const path = require("path");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

/* 
const promise = new Promise((resolve,reject)=>{
resolve(42)

});
promise.then((result)=>{

});
const result = await promise;
*/

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "Kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetFound = (await getAllplanets()).length;
        console.log(`${countPlanetFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllplanets() {
  return await planets.find({}, { __v: 0, _id: 0 });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`could not save planet ${err}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllplanets,
};
