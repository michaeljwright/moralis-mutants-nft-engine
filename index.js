// import dependencies
const console = require("console");
const { v5: uuidv5 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config(); // setup dotenv

// utilise Moralis
const Moralis = require("moralis/node");

// import metadata
const { compileMetadata } = require("./src/metadata");

// Moralis creds
const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;
const apiUrl = process.env.API_URL;
// xAPIKey available here: https://deep-index.moralis.io/api-docs/#/storage/uploadFolder
const apiKey = process.env.API_KEY;
const imageHash = process.env.IMAGE_HASH;

// Start Moralis session
Moralis.start({ serverUrl, appId, masterKey });

// Create generative art by using the canvas api
const startCreating = async () => {
  // get today's date (no time)
  const date = new Date().toISOString().split("T")[0];

  // get unique filename (without extension) then add to image data object
  const imageData = {
    file: uuidv5(date, imageHash),
    edition: 1,
    newDna: [],
    attributesList: []
  };

  await compileMetadata(apiUrl, apiKey, imageData);
};

// Initiate code
startCreating();
