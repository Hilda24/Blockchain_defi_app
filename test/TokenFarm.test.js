const { assert } = require('chai');

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n){
    return web3.utils.toWei(n,'ether');
}


contract('TokenFarm', ([owner,investor]) =>{
    let daiToken,dappToken,tokenFarm

    before(async()=>{
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        await dappToken.transfer(tokenFarm.address,tokens('1000000'))
        await daiToken.transfer(investor, tokens('100'),{from:owner})

    })
    describe('Mock DAI deployment', async ()=>{
        it('has a name', async () =>{
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('DApp Token deployment', async ()=>{
        it('has a name', async () =>{
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async ()=>{
        it('has a name', async () =>{
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async()=>{
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async ()=>{
        let result

      it('rewarding investors mDai token', async ()=>{

        result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

        await daiToken.approve(tokenFarm.address, tokens('100'),{from: investor})
      await tokenFarm.stakeTokens(tokens('100'), {from :investor})
      

      result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct before staking')

        result = await daiToken.balanceOf(tokenFarm.address)
        assert.equal(result.toString(), tokens('100'), 'Token Farm tokens balance correct before staking')

        result = await tokenFarm.stakingBalance(investor)
        assert.equal(result.toString(), tokens('100'), 'investor staking  balance correct before staking')

        result = await tokenFarm.isStaking(investor)
        assert.equal(result.toString(), 'true', 'investor is staking')

        await tokenFarm.issueTokens({from:owner})
        result = await dappToken.balanceOf(investor)
        assert.equal(result.toString(), tokens('100'),"investor Dapp token balance is correct after staking")

        await tokenFarm.issueTokens({from:investor}).should.be.rejected;

        await tokenFarm.unstakeTokens({form: investor})
        result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens('100'), "investor mockDai token wallet correct after unstaking")

        result = await tokenFarm.stakingBalance(tokenFarm.address)
        assert.equal(result.toString(), tokens('0'), 'investor staking balance is corrext')

        result = await tokenFarm.stakingBalance(investor)
        assert.equal(result.toString(), tokens('0'), 'investor staking balance is corrext')

        result = await tokenFarm.isStaking(investor)
        assert.equal(result.toString(), 'false','investore status is true')
      })

      
      
    })
})