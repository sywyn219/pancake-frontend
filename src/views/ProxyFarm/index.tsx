import React, {FC, useEffect, useState} from "react";
import Page from 'components/Layout/Page'
import {Button, Card, Flex, Heading, Input, Text} from "@pancakeswap/uikit";
import Box from "@pancakeswap/uikit/src/components/Box/Box";
import styled from "styled-components";
import {BigNumber, BigNumberish} from "ethers";
import {formatEther, formatUnits} from "@ethersproject/units";
import {isAddress} from "@ethersproject/address";
import {AddressZero} from "@ethersproject/constants";
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import {AppBody} from "../../components/App";
import {CopyButton} from "../../components/CopyButton";
import {useFarm} from "../../hooks/useContract";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {useCurrentBlock} from "../../state/block/hooks";



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
    const [accUser,setAccUser] = useState<{
        account: BigNumber;
        refAddr: string;
        addr: string;
        totalCoin: BigNumber;
        invites: BigNumber;
    }>({
        account: BigNumber.from(0),
        refAddr: "",
        addr: "",
        totalCoin: BigNumber.from(0),
        invites: BigNumber.from(0)
    })
    const [accAddr,setAccAddr] = useState('')
    const [accAddrText,setAccAddrText] = useState('')
    const [acc,setAcc] = useState('')
    const [accText,setAccText] = useState('')
    const [isAcc,setIsAcc] = useState(false)
    const [waiting,setWaiting] = useState('')
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
        setAccUser({
            account: BigNumber.from(0),
            refAddr: "",
            addr: "",
            totalCoin: BigNumber.from(0),
            invites: BigNumber.from(0)
        })

        if (!account) {
            return
        }
        const fetchAccount = async () => {
            const aUser = await farmCon.getAccountsAccStart(account)

            const accusers = aUser.map(item => {
                return {account: formatUnits(item.account,0),
                    refAddr: item.refAddr,
                    addr: AddressZero === item.addr ? '' : item.addr.length > 10 ?
                        `${item.addr.substring(0,4)}...${item.addr.substring(item.addr.length-4,item.addr.length)}`
                        : item.addr,
                    totalCoin: formatEther(item.totalCoin),
                    invites: formatUnits(item.invites,0),
                }
            })
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

        const fetchAccUser = async () => {
            const au = await  farmCon.accounts(account)
            if (au.account.toNumber() === 0) {
                return
            }
            setAccUser(au)
        }
        fetchAccUser()
    },[account])

    useEffect(() => {
        if (!account) {
            return
        }
        if (acc === '') {
            setAccText('')
            return;
        }
        if (Number.isNaN( Number(acc) )) {
            setAccText(`${acc} 不正确.`)
            return;
        }
        if (Number(acc) < 10000) {
            setAccText(`${acc} 不正确..`)
            return;
        }

        const fetchIsProxyAcc = async () => {
            const accAddrConn = await farmCon.accToAddr(BigNumber.from(acc))
            if (accAddrConn !== AddressZero) {
                setAccText(`${acc} 已绑定 ${accAddrConn}`)
                return
            }
            const result = await farmCon.isProxyAcc(BigNumber.from(acc),account)
            if (!result) {
                setAccText(`${acc} 不正确...`)
            }else {
                setAccText(acc)
                setIsAcc(true)
            }
        }
        fetchIsProxyAcc()
    },[account,acc,currentBlock.valueOf()])
    useEffect( () => {

        if (!account) {
            return
        }

        const fetachAccAddr = async () => {
            if (!isAddress(accAddr)) {
                return
            }
            const acU = await farmCon.accounts(accAddr)
            if (acU.account.toNumber() !== 0 ) {
                setAccAddrText(`${accAddr} 地址已经绑定 ${acU.account.toNumber()}`)
            }else {
                setAccAddrText('')
            }
        }
        fetachAccAddr()
    },[accAddr,currentBlock.valueOf()])

    return (
        <Page>
            <PageHeader>
                <Flex width="100%" justifyContent="center"  position="relative">
                    <Heading scale="lg" color="text">
                        {t('代理后台')}
                    </Heading>
                </Flex>
            </PageHeader>
            {proxyUser.addr === account ?
            <Flex width="100%" justifyContent="center" position="relative">
                <AppBody>
                    <Box margin="12px">
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
                    </Box>
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
                                { accAddr === '' ? '' : accAddrText !== '' ? accAddrText : isAddress(accAddr) ? accAddr : `${accAddr} 不正确`}
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
                                {accText}
                            </Text>
                        </Container>
                    </InputPanel>
                    <Text  marginTop="26px" color="red" fontSize="14px">
                        {waiting}
                    </Text>
                    <Button
                        marginTop="16px"
                        variant='primary'
                        onClick={() => {
                            setWaiting("绑定等待中...")
                            farmCon.addAccount(BigNumber.from(acc),accAddr).then(r => {
                                setWaiting('')
                            }).catch(e => {
                                setWaiting('')
                            })
                        }}
                        width="100%"
                        id="swap-button"
                        disabled = { !isAddress(accAddr) || !isAcc || accAddrText !== '' || !!waiting || proxyUser.addr !== account}
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
            </Flex> : accUser.account.toNumber() === 0 ? <></> :
                <Flex width="100%" justifyContent="center" position="relative">
                    <AppBody>
                        <Box margin="12px">
                            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                                <Text fontSize="14px">
                                    {t('总用户数:')}
                                </Text>
                                {`${accUser.invites} 个`}
                            </Flex>
                            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                                <Text fontSize="14px">
                                    {t('总业绩:')}
                                </Text>
                                {`${formatEther(accUser.totalCoin)} HSO`}
                            </Flex>
                            <Text fontSize="14px" marginTop='26px'>
                                {t('代理链接:')}
                            </Text>
                            {`https://goswap.top/farm/?acc=${accUser.account.toString()}`}
                            <CopyButton width="24px" text={`https://goswap.top/farm/?acc=${accUser.account.toString()}`} tooltipMessage='Copied' tooltipTop={120} />
                        </Box>
                    </AppBody>
                </Flex>
            }
        </Page>
    )
}