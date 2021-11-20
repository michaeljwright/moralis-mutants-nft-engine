const fs = require("fs");
const Moralis = require("moralis/node");
const { default: axios } = require("axios");
const request = require("request");

// write metadata locally to json files
const writeMetaData = async metadataList => {
  await fs.writeFileSync(
    "./output/_metadata.json",
    JSON.stringify(metadataList)
  );
};

// TODO: method to delete files written locally for tidy up
const deleteFilesTidyUp = async imageData => {
  return true;
};

// upload to Moralis database
const saveToDb = async (metaHash, imageHash, imageData) => {
  const url = `https://ipfs.moralis.io:2053/ipfs/${metaHash}/metadata/${imageData.file}.json`;
  const options = { json: true };

  await request(url, options, async (error, res, body) => {
    if (error) {
      return console.log(error);
    }

    if (!error && res.statusCode == 200) {
      // Save file reference to Moralis
      const FileDatabase = await new Moralis.Object("Metadata");
      FileDatabase.set("edition", body.edition);
      FileDatabase.set("name", body.name);
      FileDatabase.set("image", body.image);
      FileDatabase.set("attributes", body.attributes);
      FileDatabase.set("meta_hash", metaHash);
      FileDatabase.set("image_hash", imageHash);
      FileDatabase.save();
    }
  });
};

// add metadata for individual nft edition
const generateMetadata = (edition, name, description, attributesList, path) => {
  let tempMetadata = {
    name: name,
    description: description,
    image: path || null,
    edition: edition,
    date: Date.now(),
    attributes: attributesList
  };
  return tempMetadata;
};

// upload metadata
const uploadMetadata = async (apiUrl, xAPIKey, imageCID, imageData) => {
  const filename = imageData.file.toString() + ".json";

  imageData.filePath = `https://ipfs.moralis.io:2053/ipfs/${imageCID}/images/${imageData.file}.png`;
  //imageDataArray[i].image_file = res.data[i].content;

  // holds metadata for all NFTs (could be a session store of data)
  const metadata = generateMetadata(
    imageData.edition,
    imageData.name,
    imageData.description,
    imageData.attributesList,
    imageData.filePath
  );

  // upload metafile data to Moralis
  await new Moralis.File(filename, {
    base64: Buffer.from(JSON.stringify(metadata)).toString("base64")
  });

  // save JSON file locally
  await fs.writeFileSync(`./output/${filename}`, JSON.stringify(metadata));

  // reads local JSON file then adds to IPFS object (as array)
  await fs.readFile(`./output/${imageData.file}.json`, async (err, data) => {
    if (err) rej();

    // sends data to IPFS to store image
    await axios
      .post(
        apiUrl,
        [
          {
            path: `metadata/${imageData.file}.json`,
            content: data.toString("base64")
          }
        ],
        {
          headers: {
            "X-API-Key": xAPIKey,
            "content-type": "application/json",
            accept: "application/json"
          }
        }
      )
      .then(res => {
        let metaCID = res.data[0].path.split("/")[4];
        console.log("META FILE PATHS:", res.data);
        saveToDb(metaCID, imageCID, imageData);
      })
      .catch(err => {
        console.log(err);
      });
  });
};

// compile metadata (reads output from generated image)
const compileMetadata = async (apiUrl, xAPIKey, imageData) => {
  // read image for today
  await fs.readFile(`./output/${imageData.file}.png`, async (err, data) => {
    if (err) rej();
    const metaData = [
      {
        path: `images/${imageData.file}.png`,
        content: data.toString("base64")
      }
    ];

    // post data to Moralis
    await axios
      .post(apiUrl, metaData, {
        headers: {
          "X-API-Key": xAPIKey,
          "content-type": "application/json",
          accept: "application/json"
        }
      })
      .then(res => {
        console.log("IMAGE FILE PATHS:", res.data);
        let imageCID = res.data[0].path.split("/")[4];
        console.log("IMAGE CID:", imageCID);

        // pass folder CID to meta data and upload image
        uploadMetadata(apiUrl, xAPIKey, imageCID, imageData);
      })
      .catch(err => {
        console.log(err);
      });
  });
};

module.exports = {
  generateMetadata,
  writeMetaData,
  uploadMetadata,
  compileMetadata
};
