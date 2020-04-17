const countryData = require("country-json/src/country-by-population.json");
// const countryData = require("./data/testData.json");

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(countryData),
  };
};
