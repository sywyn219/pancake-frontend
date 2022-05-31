import React, {FC, useEffect, useState} from "react";
import {Box, Button, Flex, Input, Text} from "@pancakeswap/uikit";
import {isAddress} from "@ethersproject/address";
import {parseEther} from "@ethersproject/units";
import {Container, InputPanel, Wrapper} from "../styleAdmin";
import {useFarm} from "../../../hooks/useContract";
import {useTranslation} from "../../../contexts/Localization";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import {useCurrentBlock} from "../../../state/block/hooks";



export const AdminProxy: FC = () => {
    const [accAddr,setAccAddr] = useState('')
    const [accAddrText,setAccAddrText] = useState('')

    const [amountAddr,setAmountAddr] = useState('')
    const [amount,setAmount] = useState('0.0')

    const [waiting,setWaiting] = useState('')
    const farmCon = useFarm()
    const { t } = useTranslation()
    const {account } = useActiveWeb3React()
    const currentBlock = useCurrentBlock()

    useEffect( () => {
        if (!account) {
            return
        }
        const fetachAccAddr = async () => {
            if (!isAddress(accAddr)) {
                return
            }
            const acU = await farmCon.addrs(accAddr)
            if (!acU.accs.isZero()) {
                setAccAddrText(`${accAddr} 地址 代理 ${acU.accs.toNumber()}`)
            }else {
                setAccAddrText('')
            }
        }
        fetachAccAddr()
    },[accAddr,currentBlock.valueOf()])
    return (
        <Box margin="12px">
            <Wrapper style={{marginTop: "20px"}}>
                <Text>添加地址:</Text>
            </Wrapper>
            <InputPanel style={{ marginTop: "10px" }}>
                <Container as="label">
                    <Input width='100%' type="text" value={accAddr} onChange={ (e)=> setAccAddr(e.target.value)} />
                    <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                        { accAddr === '' ? '' : accAddrText !== '' ? accAddrText : isAddress(accAddr) ? accAddr : `${accAddr} 不正确`}
                    </Text>
                </Container>
            </InputPanel>
            <Button
                marginTop="16px"
                variant='primary'
                onClick={() => {
                    setWaiting("添加等待中...")
                    farmCon.addProxyAddr(accAddr).then(r => {
                        setWaiting('')
                    }).catch(e => {
                        setWaiting('')
                    })
                }}
                width="100%"
                id="swap-button"
                disabled = { !isAddress(accAddr) || accAddrText !== '' || !!waiting}
            >
                {t('新增代理')}
            </Button>

            <Wrapper style={{marginTop: "30px"}}>
                <Text>地址:</Text>
            </Wrapper>
            <InputPanel style={{ marginTop: "10px" }}>
                <Container as="label">
                    <Input width='100%' type="text" value={amountAddr} onChange={ (e)=> setAmountAddr(e.target.value)} />
                    <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                        { amountAddr === '' ? '' : isAddress(amountAddr) ? amountAddr : `${amountAddr} 不正确`}
                    </Text>
                </Container>
            </InputPanel>
            <Wrapper style={{marginTop: "10px"}}>
                <Text>金额:</Text>
            </Wrapper>
            <InputPanel style={{ marginTop: "10px" }}>
                <Container as="label">
                    <Input width='100%' type="text" value={amount} onChange={ (e)=> setAmount(e.target.value)} />
                    <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                        { amount === '0.0' ? '0.0' : Number.isNaN( Number(amount) ) ? `${amount} 不正确` : amount}
                    </Text>
                </Container>
            </InputPanel>
            <Button
                marginTop="16px"
                variant='primary'
                onClick={() => {
                    setWaiting("添加等待中...")
                    farmCon.updateUserAmount(amountAddr,parseEther(amount)).then(r => {
                        setWaiting('')
                    }).catch(e => {
                        setWaiting('')
                    })
                }}
                width="100%"
                id="swap-button"
                disabled = { !isAddress(amountAddr) || Number.isNaN( Number(amount) ) || !!waiting}
            >
                {t('新增购买')}
            </Button>

            <Flex width="100%" justifyContent="center"  position="relative" marginTop="24px">
                <Text fontSize="16px">
                    {t('代理记录')}
                </Text>
            </Flex>
            <Text>....待开放</Text>
        </Box>
    )
}