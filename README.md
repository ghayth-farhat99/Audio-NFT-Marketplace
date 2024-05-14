# Audio-NFT-Marketplace
In our project, we leverage ERC4907 for creating rentable NFTs and utilize the Metamask web extension for authentication. NFT storage is facilitated through IPFS. Within our marketplace, we've implemented two AI models. The first ensures voice uniqueness on the create_nft page by verifying the absence of the voice in our marketplace. The second model generates speech using a voice selected from the user's rented NFT list along with the text input by the user.
# https://help.github.com/articles/ignoring-files

# Dependencies
node_modules

saved_models/

contracts/

# Production
hardhat.config.js

ResCNN_triplet_training_checkpoint_265.h5
# Env
.env

src/env.json

# Editor
.vscode

# Misc.
.DS_Store
