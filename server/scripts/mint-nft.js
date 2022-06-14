require("dotenv").config();
const API_URL = process.env.API_URL;
const _METAMASK_PUBLIC_KEY = process.env.METAMASK_PUBLIC_KEY;
const _METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/HorizonFT.sol/TorNFT.json");
const contractAddress = "0xa9dADB175De714abe5cF35fdfE3a9eAa74FD4fBE";
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);

module.exports.mintNFT = async function mintNFT(tokenURI, account) {
  // get the nonce - nonce is needed for security reasons. It keeps track of the number of
  // transactions sent from our address and prevents replay attacks.
  const nonce = await alchemyWeb3.eth.getTransactionCount(
    account.publicKey,
    "latest"
  );
  const tx = {
    from: account.publicKey, // our MetaMask public key
    to: contractAddress, // the smart contract address we want to interact with
    nonce: nonce, // nonce with the no of transactions from our account
    gas: 1000000, // fee estimate to complete the transaction
    data: nftContract.methods
      .createNFT(account.publicKey, tokenURI)
      .encodeABI(), // call the createNFT function from our OsunRiverNFT.sol file and pass the account that should receive the minted NFT.
  };

  const signPromise = alchemyWeb3.eth.accounts.signTransaction(
    tx,
    account.privateKey
  );
  return new Promise((resolve) => {
    signPromise
      .then(async (signedTx) => {
        const receipt = await alchemyWeb3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          function (err, hash) {
            if (!err) {
              console.log(
                "The hash of our transaction is: ",
                hash,
                "\nCheck Alchemy's Mempool to view the status of our transaction!"
              );
            } else {
              console.log(
                "Something went wrong when submitting our transaction:",
                err
              );
            }
            resolve(hash);
          }
        );
        return receipt;
      })
      .catch((err) => {
        console.log(" Promise failed:", err);
        return null;
      });
  });
};
