const chainMap = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};

export const getChainName = async environment => {
  const chainId = await environment.eth.net.getId();
  return chainMap[chainId] || 'development';
};
