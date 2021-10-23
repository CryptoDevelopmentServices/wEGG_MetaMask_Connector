const provider = window.ethereum;
const BinanceSmartChainId = '0x38';
const tokenAddress = '0xEACc57176C0Dbe53E50e7b2Ff73b32D354A4ef01';
const tokenSymbol = 'WEGG';
const tokenDecimals = 18;
const tokenImage = 'https://i.imgur.com/ho7gXX9.png';

/** Connect to Wrapped NestEGG Coin and the BSC mainnet network */
const setupBinanceSmartChain = async () => {
  /** In case we need to throw an error, let's grab the error modal & error message */
  const errorModalContainer = document.querySelector('.error-modal-container');
  const errorMessage = document.querySelector('.error-message');

  if (provider) {
    try {
      await provider.request({ method: 'eth_requestAccounts' });
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: BinanceSmartChainId,
            chainName: 'Binance Smart Chain - Mainnet',
            nativeCurrency: {
              name: 'Binance coin (Smart chain)',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: [
              'https://bscscan.com/',
            ],
          },
        ],
      });
      await provider.request({ method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
     })
    } catch (e) {
      /** Code 4001 is user rejected, we don't need to notify the user if they rejected the request */
      if (e.code !== 4001) {
        errorModalContainer.style.display = 'block';
        errorMessage.innerHTML = e.message;
      }
    }
  } else {
    errorModalContainer.style.display = 'block';
    errorMessage.innerHTML = `It looks like MetaMask hasn't been installed. Please <a href="https://metamask.io/download.html" target="_blank" rel="noreferrer noopener">install MetaMask</a> and try again.`;
  }
};

/**  Add event listener to the Connect MetaMask buttons */
const connectMetaMask = document.querySelector('.connectMetaMask');
const connectMetaMaskNav = document.querySelector('.connectMetaMask-nav');

// If user is not on Integrate MetaMask page, connectMetaMask will not be available so
// we need to check if it's there before adding the event listener to it
 if (connectMetaMask) {
  connectMetaMask.addEventListener('click', () => {
    setupBinanceSmartChain();
  });
}
//  } if (connectMetaMask) {
// connectMetaMaskNav.addEventListener('click', () => {
//   setupBinanceSmartChain();
// });
//  }
/** If we are already connected to Wrapped NestEGG Coin, show disbled button with 'Connected' text */
const connectButtons = [connectMetaMask/*, connectMetaMaskNav*/];
const displayConnectedButton = async () => {
  const accounts = await ethereum.request({ method: 'eth_accounts' });
  connectButtons.forEach((button) => {
    if (button && accounts.length > 0) {
      const shortenedAccount = `${accounts[0].slice(
        0,
        6
      )}...${accounts[0].slice(-4)}`;
      button.innerHTML = `Connected: ${shortenedAccount}`;
      button.className += ' disabled-button';
      button.removeEventListener('click', () => {});
    }
  });
};

const isConnectedToBinanceSmartChain = async () => {
  const chainId = await provider.request({
    method: 'eth_chainId',
  });
  if (chainId === BinanceSmartChainId) {
    displayConnectedButton();
  }
};

if (provider) {
  /** Check if user is connected to Wrapped NewYorkCoin and display correct button text */
  isConnectedToBinanceSmartChain();

  /** Reload the page if the chain changes */
  provider.on('chainChanged', () => {
    // MetaMask recommends reloading the page unless we have good reason not to
    // Plus, everytime the window reloads, we call isConnectedToBinanceSmartChain again
    // and can show the correct 'Connected' or 'Connect MetaMask' button text
    window.location.reload();
  });

  /** When the account changes update the button text */
  provider.on('accountsChanged', (accounts) => {
    if (accounts.length > 0) {
      displayConnectedButton();
    } else {
      window.location.reload();
    }
  });
}

