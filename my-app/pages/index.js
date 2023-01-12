import { useEffect, useRef, useState } from 'react';
import Head from "next/head";

import Web3Modal from 'web3modal';
import { providers, Contract, utils } from 'ethers';

import { NFT_CONTRACT_ABI } from '../constants';
import styles from '../styles/Home.module.css';

const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const web3ModelRef = useRef();

  useEffect(() => {
   if(!walletConnected){
        // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
    web3ModelRef.current = new Web3Modal({
      network: 'goerli',
      providerOptions:{},
      disableInjectedProvider: false
    })

    connectWallet();
   }
  }, [])

  useEffect(() => {
    if(walletConnected){
      getOwner();
      checkIfPresaleStarted();
      getNumMintedTokens();
    }
  }, [walletConnected])
  
  useEffect(() => {
    if( presaleStarted && walletConnected ) checkIfPresaleEnded();
  }, [ presaleStarted, walletConnected ])
  
  const getNumMintedTokens = async() => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      // Se recibe un Big Number
      const numTokenIds = await nftContract.tokenIds();
      setNumTokensMinted( numTokenIds.toString() )

    } catch (error) {
      console.error(error);
    }
  }

  const getOwner = async() => {
    try {
    
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract( 
        NFT_CONTRACT_ADDRESS, 
        NFT_CONTRACT_ABI, 
        signer 
      )

      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();
      
      if(owner.toLowerCase() === userAddress.toLowerCase()){
        setIsOwner(true);
      }

    } catch (error) {
      
    }
  }

  const startPresale = async() => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract( 
        NFT_CONTRACT_ADDRESS, 
        NFT_CONTRACT_ABI, 
        signer 
      )

      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);

      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
  }

  const presaleMint = async() => {
    try {
      const signer =  await getProviderOrSigner( true );
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const tx = await nftContract.presaleMint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.011"),
      })
      
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert('You successfully minted a CryptoDev');

    } catch (error) {
      console.error(error);
    }
  }

  const publicMint = async() => {
    try {
      const signer =  await getProviderOrSigner( true );
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const tx = await nftContract.mint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.011"),
      })

      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert('You successfully minted a CryptoDev');

    } catch (error) {
      console.error(error);
    }
  }

  const checkIfPresaleEnded = async() => {
    try {

      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract( 
        NFT_CONTRACT_ADDRESS, 
        NFT_CONTRACT_ABI, 
        signer 
      )

      // This will return a timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;
       // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      const hasEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds));
      setPresaleEnded(hasEnded);
      
    } catch (error) {
      console.error(error);
    }
  }

  const checkIfPresaleStarted = async() => {
    try {

       // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
        // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract( 
        NFT_CONTRACT_ADDRESS, 
        NFT_CONTRACT_ABI, 
        provider 
      )

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
      
    } catch (error) {
      console.error(error);
    }
  }

  const getProviderOrSigner = async(needSigner = false) => {

    const provider = await web3ModelRef.current.connect();
    const web3Provider = new providers.Web3Provider( provider );

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if( chainId !== 5 ){
      window.alert("Change network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if( needSigner ){
      return web3Provider.getSigner(); 
    }

    return web3Provider;

  }
  
  const connectWallet = async() =>{
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  }

  const renderBody = () => {
    if(!walletConnected){
      return(
        <button 
          onClick={ connectWallet }
          className={ styles.button }
        >
          Connect Wallet
        </button>
      )
    }

    if(loading){
      return(
        <span className={ styles.description }>
          Loading....
        </span>
      )
    }

    if(isOwner && !presaleStarted){
      // render a button to start the presale
      return(
        <button
          onClick={ startPresale }
          className={ styles.button }
        >
          Start Presale
        </button>
      )
    }

    if(!presaleStarted){
      // Just say presale hasn't started yet, come back later
      return(
        <div>
          <span className={ styles.description }>
            Presale has not started yet. Please come back later
          </span>
        </div>
      )
    }

    if(presaleStarted && !presaleEnded){
      // Allow users to mint in presale
      // They need to be in whitelist for this to work
      return(
        <div>
          <span className={ styles.description }>
            Presale has started! If your address is whitelisted you can 
            mint a CryptoDev
          </span>

          <button
            className={ styles.button }
            onClick={ presaleMint }
          >
            Presale Mint
          </button>
        </div>
      )
    }

    if(presaleEnded){
      // Allow users to take part in public sale
      return(
        <div>
          <span className={ styles.description }>
            Presale has ended.
            You can mint a CryptoDev in public sale if any remain
          </span>

          <button
            className={ styles.button }
            onClick={ publicMint }
          >
            Public Mint
          </button>
        </div>
      )
    }

  }

  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>

      <div className={ styles.main } >
        <div>
          <h1 className={ styles.title }>Weolcome to CryptoDevs NFT</h1>
          <div className={ styles.description }>
            CryptoDevs NFT is a collection for developers in web3. 
          </div>
          <div className={ styles.description }>
            { numTokensMinted }/20 tokens have been minted already
          </div>

          { renderBody() }
        </div>
        <img className={ styles.image } src="/cryptodevs/0.svg"/>
      </div>
    </div>
  )
}
