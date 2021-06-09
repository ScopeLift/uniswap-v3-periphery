import { ethers } from 'hardhat'
import { expect } from './shared/expect'
import { v3CoreFactoryFixtureSetup, wethFixtureSetup } from './shared/setup'
import { POOL_BYTECODE_HASH } from './shared/computePoolAddress'
import { Contract } from 'ethers'
import { PoolAddressTest } from '../typechain'

/**
 * @notice In the ordinary Uniswap V3 contracts, all bytecode is constant and deterministic, and therefore the
 * POOL_INIT_CODE_HASH is constant as well. For the OVM, libraries were added to reduce contract size, which means the
 * pool bytecode is now dependent on the library addresses, which are dependent on the deployers account and nonce.
 * To ensure we always end up with the same bytecode, we add this Setup test which should always be the first test
 * ran. If you only want to run one test file, use `.only` modifiers on this test file and the desired test file,
 * instead of specifying the file name in the test command. We also deploy WETH one time here because it is a
 * constructor argument and we want to ensure the WETH address is always safe to use as a constructor argument
 */

describe.only('Setup', () => {
  let factory: Contract
  let weth9: Contract

  before('setup fixtures', async () => {
    // @ts-expect-error We don't need to pass the standard fixture inputs since v3CoreFactoryFixtureSetup has defaults
    factory = await v3CoreFactoryFixtureSetup()
    // @ts-expect-error We don't need to pass the standard fixture inputs since wethFixtureSetup has defaults
    ;({ weth9 } = await wethFixtureSetup())
  })

  it('is setup', async () => {
    // Verify factory and WETH
    expect(Boolean(factory)).to.be.true
    expect(factory.address.length).to.equal(42)
    expect(Boolean(weth9)).to.be.true
    expect(weth9.address.length).to.equal(42)

    // Verify pool
    const poolAddressTestFactory = await ethers.getContractFactory('PoolAddressTest')
    const poolAddress = (await poolAddressTestFactory.deploy()) as PoolAddressTest
    expect(await poolAddress.POOL_INIT_CODE_HASH()).to.eq(await POOL_BYTECODE_HASH())
  })
})
