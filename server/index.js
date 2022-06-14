const express = require("express");
const bodyParser = require("body-parser");
const { File, NFTStorage } = require("nft.storage");
const app = express();
const cors = require("cors");
const mintScripts = require("./scripts/mint-nft");
const fs = require("fs");

const PORT = process.env.PORT || 5000;
const NFT_STORAGE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRjZjk3REZlYTQ2YzZiNGUwZkRGNjg4OTcwZDU5OTU1QzY0OTY5NjUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NTE4MDU1OTIzMSwibmFtZSI6Imhvcml6b25mdCJ9.ML82UOrFqZ3CJ-nf0-qGJG-NWehGd-9S7pfSjbfk-WY";

const fileToBlob = (base64) => {
  const dataUrl = base64;
  const bytes =
    dataUrl.split(",")[0].indexOf("base64") >= 0
      ? atob(dataUrl.split(",")[1])
      : window.unescape(dataUrl.split(",")[1]);
  const mime = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const max = bytes.length;
  const ia = new Uint8Array(max);
  for (let i = 0; i < max; i++) {
    ia[i] = bytes.charCodeAt(i);
  }

  return ia;
};

app.use(cors());
app.use(bodyParser.json({ limit: "1gb" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/mint", async (req, res) => {
  const { publicKey, privateKey, fileDto } = req.body;
  if (!(publicKey && privateKey && fileDto)) {
    res.send("Missing data");
    return;
  }

  const blob = fileToBlob(fileDto.base64);
  const file = new File(blob, fileDto.name, {
    type: fileDto.type,
  });
  const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY });
  const storeResult = await nftStorage.store({
    image: file,
    name: fileDto.name,
    description: "HorizonFT",
  });
  const txhash = await mintScripts.mintNFT(
    `https://ipfs.io/ipfs/${storeResult.ipnft}/metadata.json`,
    { publicKey, privateKey }
  );

  res.send({ ok: true, txhash });
});
app.post("/upload", (req, res) => {
  console.log(req.body);
  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
