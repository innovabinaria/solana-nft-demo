import { readFileSync } from "fs";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  mplTokenMetadata,
  createNft,
} from "@metaplex-foundation/mpl-token-metadata";

async function main() {
  const umi = createUmi("https://api.devnet.solana.com").use(mplTokenMetadata());

  const walletPath = `${process.env.HOME}/.config/solana/id.json`;
  const secretKey = Uint8Array.from(JSON.parse(readFileSync(walletPath, "utf8")));
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  console.log("Usando wallet:", signer.publicKey.toString());

  const mint = generateSigner(umi);

  //const metadataUri = "https://raw.githubusercontent.com/innovabinaria/solana-nft-assets/main/mi-primer-nft.json";
  const metadataUri = "https://raw.githubusercontent.com/innovabinaria/solana-nft-assets/main/mi-segundo-nft.json";

  const { signature } = await createNft(umi, {
    mint,
    name: "Mi Segundo NFT en Solana",
    symbol: "VIK",
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(5), // 5% royalties
  }).sendAndConfirm(umi);

  console.log("Tx signature:", signature);
  console.log("Mint address:", mint.publicKey.toString());
  console.log(
    `Explorer (devnet): https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`
  );
}

main().catch((err) => {
  console.error("Error al mintear:", err);
  process.exit(1);
});
