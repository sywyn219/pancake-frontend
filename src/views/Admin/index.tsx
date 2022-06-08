import React, {FC, RefObject, useEffect, useState} from "react";
import {Flex, Box, Text, Heading, Button, IconButton, useMatchBreakpoints, Input} from "@pancakeswap/uikit";
import Image from "next/image";
import styled from "styled-components";
import Page from 'components/Layout/Page'
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther, parseEther} from "@ethersproject/units";
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import {AppBody} from "../../components/App";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {usePigPunk} from "../../hooks/useContract";





const StyledImage = styled(Image)`
  border-radius: 4px;
`

const sub = (a:BigNumber,b:BigNumber) => a.sub(b).toString()
const add = (a:BigNumber,b:BigNumber) => a.add(b).toString()

export const Admin: FC = () => {
    const {t} = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const {account,library } = useActiveWeb3React()
    const [balance,setBalance] = useState('0.0')
    const [price,setPrice] = useState('0.0')
    const [waiting,setWaiting] = useState('')
    const [mintNum,setMintNum] = useState('0.1')
    const pigPunk = usePigPunk();

    useEffect(() => {
        if (!library) {
            return
        }
        const fetachBalance = async  () => {
            const ba = formatEther(await library.getBalance(account))
            setBalance(ba)
        }
        fetachBalance().catch(e => console.log("fetachBalance--->>>",e))
        const fetachPrice = async  () => {
            const pe = formatEther(await  pigPunk.apePrice())
            setPrice(pe)
        }
        fetachPrice().catch(e => console.log("fetachPrice--->>>",e))

    },[account,library])
    return (
        <Page>
            <Flex width="100%" justifyContent="center" position="relative">
                <Box>
                    <AppBody>
                        <Flex flexDirection="column">
                            <Box margin="12px">
                                <StyledImage src="/images/farm/candypig2.jpg" height={250} width={375} />
                                <Flex marginTop='14px' alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('价格:')}
                                    </Text>
                                    {`${price} Ether`}
                                </Flex>

                                <Flex marginTop='14px' alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('余额:')}
                                    </Text>
                                    {`${balance} Ether`}
                                </Flex>


                                <Flex marginTop='14px' alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        设定价格:
                                    </Text>
                                    {`${mintNum} Ether`}
                                </Flex>


                                <Flex marginTop='14px' marginLeft='40px' marginRight='40px' alignItems="center"  justifyContent="space-between">
                                        <Input
                                            scale="lg"
                                            autoComplete="off"
                                            value={mintNum}
                                            onChange={(e)=>setMintNum(e.target.value)}
                                        />
                                </Flex>
                                {
                                    !library &&
                                    <Text fontSize="14px" marginTop='14px' color="red">
                                        钱包连接不正确
                                    </Text>
                                }


                                <Button marginBottom='60px' marginTop='30px' width='100%' minWidth={isMobile ? '131px' : '178px'}
                                        onClick={  () => {
                                            setWaiting('交易确认中...')
                                            if (!pigPunk || !library) {
                                                setWaiting('')
                                                return
                                            }
                                            try {
                                                parseEther(mintNum)
                                            }catch (e) {
                                                setWaiting('')
                                                return;
                                            }

                                            pigPunk.setApePrice(parseEther(mintNum)).then(() => setWaiting('')).catch(() => setWaiting(''))
                                            // pigPunk.mintApe(BigNumber.from(mintNum),{value:parseEther((Number(price) * mintNum).toString())}).then(() =>setWaiting(''))
                                            //     .catch(()=>setWaiting(''))
                                        }}
                                        disabled= {!!waiting  || !library}
                                >{ waiting !== '' ? waiting : t('修改') }</Button>
                            </Box>
                        </Flex>

                    </AppBody>
                </Box>
            </Flex>
        </Page>
    )
}