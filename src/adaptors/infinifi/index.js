const utils = require('../utils');

const poolsFunction = async () => {
  try {
    const data = await utils.getData('https://api.infinifi.xyz/api/protocol/data');
    
    if (!data || data.code !== "OK" || !data.data || !data.data.stats) {
      return [];
    }

    const stats = data.data.stats;
    const pools = [];
    
    // Process siUSD pool
    if (stats.siusd) {
      const siusdData = stats.siusd;
      const tvl = parseFloat(siusdData.totalSupplyNormalized || 0);
      const apy = parseFloat(siusdData.lastWeekAPY || 0) * 100;
      
      if (tvl >= 10000) {
        pools.push({
          pool: `${siusdData.address}-ethereum`.toLowerCase(),
          chain: utils.formatChain('ethereum'),
          project: 'infinifi',
          symbol: utils.formatSymbol('siUSD'),
          tvlUsd: tvl,
          apyBase: apy,
          poolMeta: 'Staked iUSD',
          url: 'https://infinifi.xyz/',
        });
      }
    }
    
    // Process liUSD pools
    if (stats.liusd) {
      Object.keys(stats.liusd).forEach((poolKey) => {
        const liusdToken = stats.liusd[poolKey];
        const tvl = parseFloat(liusdToken.totalSupplyNormalized || 0);
        const apy = parseFloat(liusdToken.lastWeekAPY || 0) * 100;
        const weeks = liusdToken.bucketMaturity || 'Unknown';
        const name = liusdToken.name || `liUSD-${weeks}w`;
        
        if (tvl >= 10000) {
          pools.push({
            pool: `${liusdToken.address}-ethereum`.toLowerCase(),
            chain: utils.formatChain('ethereum'),
            project: 'infinifi',
            symbol: utils.formatSymbol(name),
            tvlUsd: tvl,
            apyBase: apy,
            poolMeta: `Locked iUSD - ${weeks} week${weeks > 1 ? 's' : ''}`,
            url: 'https://infinifi.xyz/',
          });
        }
      });
    }
    
    return pools.filter((p) => utils.keepFinite(p));
    
  } catch (error) {
    console.error('Error fetching infiniFi data:', error);
    return [];
  }
};

module.exports = {
  timetravel: false,
  apy: poolsFunction,
  url: 'https://infinifi.xyz/',
};
