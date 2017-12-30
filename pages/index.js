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

const Column = ({ children }) => <span style={{display: 'inline-block', width: '200px'}}>{ children }</span>

const Page = ({ coins }) => {
  return (
    <div>
      <div>
        <Column>
          normalized price per coin if supply was (100 million)
        </Column>
        <Column>
          name
        </Column>
        <Column>
          market cap divided by leader market cap
        </Column>
        <Column>
          price to match leader market cap
        </Column>
        <Column>
          current price
        </Column>
        <Column>
          potential (higher is better)
        </Column>
      </div>
      {
        coins.map((coin, i) =>
          <div key={i}>
            <Column>
              {`#${i+1}`}
            </Column>
            <Column>
              { coin.name }
            </Column>
            <Column>
              { coin.percentageOfLeader }
            </Column>
            <Column>
              { coin.goal }
            </Column>
            <Column>
              { coin.current }
            </Column>
            <Column>
              { coin.potential }
            </Column>
          </div>)
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
    const goal = new BigNumber(price_usd).div(percentageOfLeader).toFixed(2)
    return {
      name,
      normalized,
      percentageOfLeader,
      goal,
      current: price_usd,
      potential: new BigNumber(goal).div(price_usd).times(100).minus(100).toFixed(2)
    };
  });

  return { coins: _.reverse(_.sortBy(coins, ['normalized'])) }
}

export default Page;

