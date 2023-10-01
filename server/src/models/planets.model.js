const fs = require("fs");
const { parse } = require("csv-parse");
const path = require("path");
const HabitablePlanets = [];

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
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          HabitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        console.log(`${HabitablePlanets.length} habitable planets found!`);
        resolve();
      });
  });
}

function getAllplanets() {
  return HabitablePlanets;
}
module.exports = {
  loadPlanetsData,
  getAllplanets,
};
