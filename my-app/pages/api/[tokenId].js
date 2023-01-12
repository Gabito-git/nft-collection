// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  // tokenId está dado por el nombre del archivo
  const tokenId = req.query.tokenId;

  const name = `Crypto Dev #${ tokenId }`;
  const description = "CryptoDevs is an NFT Collection for Web3 Developers"
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${ tokenId - 1}.svg`;

  return res.json({
    name, description, image
  })

}
