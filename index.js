// import dependencies
const console = require("console");
const { v5: uuidv5 } = require("uuid");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  starWars
} = require("unique-names-generator");
const dayjs = require("dayjs");
const dotenv = require("dotenv");
dotenv.config(); // setup dotenv

// utilise Moralis
const Moralis = require("moralis/node");

// import metadata
const { compileMetadata } = require("./src/metadata");

// setup Moralis creds
const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;
const apiUrl = process.env.API_URL;
// xAPIKey available here: https://deep-index.moralis.io/api-docs/#/storage/uploadFolder
const apiKey = process.env.API_KEY;
const imageHash = process.env.IMAGE_HASH;
const startDate = process.env.START_DATE;

// start Moralis session
Moralis.start({ serverUrl, appId, masterKey });

const getDays = (startDate, today) => {
  const days = today.diff(startDate, "day");
  return days;
};

const getName = () => {
  const config = {
    dictionaries: [colors, starWars],
    style: "capital",
    separator: " "
  };
  return uniqueNamesGenerator(config);
};

const startCreating = async () => {
  // get today's date (no time)
  const today = dayjs();

  // get unique filename (without extension) then add to image data object
  const imageData = {
    file: uuidv5(today.format("YYYY-MM-DD"), imageHash),
    edition: getDays(startDate, today),
    name: getName(),
    description: "",
    attributesList: []
  };

  await compileMetadata(apiUrl, apiKey, imageData);
};

// initiate code
startCreating();
