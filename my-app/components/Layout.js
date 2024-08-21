import { providers } from "ethers";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

function Layout({ title, children }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const web3ModalRef = useRef();
  const date = new Date();

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
      setWalletConnected(false); // Reset wallet connection state on error
    }
  };

  const getProviderOrSigner = async () => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 11155111) {
        window.alert("Change the network to Sepolia");
        throw new Error("Change network to Sepolia");
      }

      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address.substring(0, 6) + "...");
      return signer;
    } catch (error) {
      console.error("Error getting provider or signer:", error);
      throw error; // Ensure errors are propagated
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
    }

    // Cleanup function to prevent state update on unmounted component
    return () => {
      web3ModalRef.current?.clearCachedProvider();
    };
  }, [walletConnected]);

  return (
    <>
      <Head>
        <title>{title ? title + " - Airin" : "Airin"}</title>
        <meta name="description" content="Social Media" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex text-white bg-gray-900 min-h-screen flex-col justify-between">
        <header>
          <nav className="flex h-12 items-center px-4 bg-gradient-to-r from-black to-blue-900 justify-between shadow-md">
            <Link href="/">
              <span className="bg-clip-text text-3xl text-transparent bg-gradient-to-r from-violet-400 to-blue-500">
                Airin
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <Link href="/content">
                <p>Explore</p>
              </Link>

              <Link href="/profile">
                <p>Profile</p>
              </Link>

              {walletConnected ? (
                <p className="text-sm border-2 border-gray-600 rounded-md border-dotted p-1">
                  {walletAddress}
                </p>
              ) : (
                <button
                  className="text-sm border-2 border-gray-600 rounded-md border-dotted p-1"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </nav>
        </header>
        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="flex h-5 bg-black text-sm justify-center items-center shadow-inner">
          Copyright ©{date.getFullYear()} Airin
        </footer>
      </div>
    </>
  );
}

export default Layout;
