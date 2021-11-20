// import dependencies
const console = require("console");
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

// Start Moralis session
Moralis.start({ serverUrl, appId, masterKey });

// Create generative art by using the canvas api
const startCreating = async () => {
  // TODO: get name for today (filename without extension)

  let imageData = {
    file: "0000000000000000000000000000000000000000000000000000000000000001",
    edition: 1,
    newDna: [],
    attributesList: []
  };

  await compileMetadata(apiUrl, apiKey, imageData);
};

// Initiate code
startCreating();
