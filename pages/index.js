const request = require('superagent');
const BigNumber = require('bignumber.js');
const _ = require('lodash');


function get(url) {
  return new Promise((resolve, reject) => {
    request
      .get(url)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      })
  });
}

const Page = ({ coins }) => {
  return (
    <div>
      PRICE PER COIN if supply was capped at 100000000 (100 million):
      {
        coins.map((coin, i) => <div key={i}>{`#${i+1} | name - ${coin.name} | normalized - ${coin.normalized} | percentage of leader ${coin.percentageOfLeader} | price to surpass leader - ${coin.goal}`} </div>)
      }
    </div>
  )
}


Page.getInitialProps = async ({ req }) => {
  const { body } = await get('https://api.coinmarketcap.com/v1/ticker/?limit=50')
  const leaderMarketCap = _.get(body, '0.market_cap_usd');
  const coins = body.map(({ name, market_cap_usd, price_usd, total_supply }) => {
    const normalized = new BigNumber(market_cap_usd).div(100000000).toNumber();
    const percentageOfLeader = new BigNumber(market_cap_usd).div(leaderMarketCap).toFixed(5);
    return {
      name,
      normalized,
      percentageOfLeader,
      goal: new BigNumber(price_usd).div(percentageOfLeader).toNumber()
    };
  });

  return { coins: _.reverse(_.sortBy(coins, ['normalized'])) }
}

export default Page;

