import React, {FC, useEffect, useState} from "react";
import Page from 'components/Layout/Page'
import {Button, Card, Flex, Heading, Input, Text} from "@pancakeswap/uikit";
import Box from "@pancakeswap/uikit/src/components/Box/Box";
import styled from "styled-components";
import {BigNumber, BigNumberish} from "ethers";
import {formatEther, formatUnits} from "@ethersproject/units";
import {AddressZero} from "@ethersproject/constants";
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import {AppBody} from "../../components/App";
import {CopyButton} from "../../components/CopyButton";
import {useFarm} from "../../hooks/useContract";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {useCurrentBlock} from "../../state/block/hooks";
import {ProxyAccountStruct, ProxyAccountStructOutput} from "../../config/abi/types/Farm";
import {isAddress} from "@ethersproject/address";


const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 1;
`
const Container = styled.div`
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
`

const Wrapper = styled(Flex)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  border-radius: 16px;
  position: relative;
`

export const ProxyFarm: FC = () => {
    const currentBlock = useCurrentBlock()
    const { t } = useTranslation()
    const farmCon = useFarm()
    const {account } = useActiveWeb3React()
    const [accLink,setAccLink] = useState('')
    const [accAddr,setAccAddr] = useState('')
    const [acc,setAcc] = useState('')

    const [proxyUser,setProxyUser] = useState<{
        accs: BigNumber,
        addr: string,
        totalInvite: BigNumber,
        totalCoin: BigNumber,
        balance: BigNumber,
    }>({
        accs: BigNumber.from(0),
        addr: "",
        totalInvite: BigNumber.from(0),
        totalCoin: BigNumber.from(0),
        balance: BigNumber.from(0),
    })
    const [accs,setAccs] = useState<{account: string;
        refAddr: string;
        addr: string;
        totalCoin: string;
        invites: string;
    }[]>([])
    useEffect(() => {
       setProxyUser({
            accs: BigNumber.from(0),
            addr: "",
            totalInvite: BigNumber.from(0),
            totalCoin: BigNumber.from(0),
            balance: BigNumber.from(0),
        })
        setAccs([])

        if (!account) {
            return
        }
        const fetchAccount = async () => {
            const accUser = await farmCon.getAccountsAccStart(account)

            const accusers = accUser.map(item => {
                return {account: formatUnits(item.account,0),
                    refAddr: item.refAddr,
                    addr: AddressZero === item.addr ? '' : item.addr.length > 10 ?
                        `${item.addr.substring(0,4)}...${item.addr.substring(item.addr.length-4,item.addr.length)}`
                        : item.addr,
                    totalCoin: formatEther(item.totalCoin),
                    invites: formatUnits(item.invites,0),
                }
            })
            accusers.forEach(item => console.log(formatUnits(item.account,0)))
            setAccs(accusers)
        }
        const fetchProxyUser = async () => {
            const pu = await farmCon.addrs(account)
            if (pu.addr !== account || pu.addr === AddressZero) {
                return
            }
            setProxyUser(pu)
            await fetchAccount()
        }
        fetchProxyUser().catch(e => console.log("proxy user e-->",e))

    },[account])

    return (
        <Page>
            <PageHeader>
                <Flex width="100%" justifyContent="center"  position="relative">
                    <Heading scale="lg" color="text">
                        {t('代理后台')}
                    </Heading>
                </Flex>
            </PageHeader>
            <Flex width="100%" justifyContent="center" position="relative">
                <AppBody>
                    <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                        <Text fontSize="14px">
                            {t('总用户数:')}
                        </Text>
                        {`${proxyUser.totalInvite} 个`}
                    </Flex>
                    <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                        <Text fontSize="14px">
                            {t('总业绩:')}
                        </Text>
                        {`${formatEther(proxyUser.totalCoin)} HSO`}
                    </Flex>

                    <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                        <Text fontSize="14px">
                            {t('可提现:')}
                        </Text>
                        {`${formatEther(proxyUser.balance)} USDT`}
                    </Flex>
                    <Button
                        marginTop="26px"
                        variant='primary'
                        onClick={() => {
                            farmCon.withUserBalance()
                        }}
                        width="100%"
                        id="swap-button"
                        disabled ={!account || proxyUser.balance.isZero()}
                    >
                        {t('提币')}
                    </Button>
                    <Wrapper style={{marginTop: "20px"}}>
                        <Text>
                            绑定地址:
                        </Text>
                    </Wrapper>
                    <InputPanel style={{ marginTop: "5px" }}>
                        <Container as="label">
                            <Input width='100%' type="text" value={accAddr} onChange={ (e)=> setAccAddr(e.target.value)} />
                            <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                                {accAddr}
                            </Text>
                        </Container>
                    </InputPanel>

                    <Wrapper style={{marginTop: "20px"}}>
                        <Text>
                            邀请帐号:
                        </Text>
                    </Wrapper>
                    <InputPanel style={{ marginTop: "5px" }}>
                        <Container as="label">
                            <Input width='100%' type="text" value={acc} onChange={ (e)=> {
                                setAcc(e.target.value)
                            }} />
                            <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                                {BigNumber.isBigNumber(acc) ? "邀请帐号格式不正确": acc }
                            </Text>
                        </Container>
                    </InputPanel>
                    <Button
                        marginTop="26px"
                        variant='primary'
                        onClick={() => {
                            if (!isAddress(accAddr)) {
                                return
                            }
                            farmCon.addAccount(BigNumber.from(acc),accAddr)
                        }}
                        width="100%"
                        id="swap-button"
                    >
                        {t('绑定')}
                    </Button>


                    <Flex width="100%" justifyContent="center"  position="relative" marginTop="24px">
                        <Text fontSize="16px">
                            {t('邀请帐号')}
                        </Text>
                    </Flex>
                    {
                        accs.map(item => <Box key={item.account} margin="10px">
                            <Flex alignItems="center"  justifyContent="space-between">
                                <Text fontSize="14px">
                                    {t('帐号:')}
                                </Text>
                                {`${item.account}`}
                            </Flex>
                            <Flex alignItems="center"  justifyContent="space-between">
                                <Text fontSize="14px">
                                    {t('地址:')}
                                </Text>
                                {item.addr}
                            </Flex>
                            <Flex alignItems="center"  justifyContent="space-between">
                                <Text fontSize="14px">
                                    {t('用户数:')}
                                </Text>
                                { item.invites}
                            </Flex>
                            <Flex alignItems="center"  justifyContent="space-between">
                                <Text fontSize="14px">
                                    {t('业绩:')}
                                </Text>
                                {`${item.totalCoin} HSO`}
                            </Flex>
                        </Box>)
                    }
                </AppBody>
            </Flex>
        </Page>
    )
}