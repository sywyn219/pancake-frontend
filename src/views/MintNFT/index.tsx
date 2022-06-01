import React, {FC, useEffect, useState} from "react";
import {Flex, Box, Text, Heading, Button, IconButton,  useMatchBreakpoints} from "@pancakeswap/uikit";
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

export const MintNFT: FC = () => {
    const {t} = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const {account,library } = useActiveWeb3React()
    const [balance,setBalance] = useState('0.0')
    const [price,setPrice] = useState('0.0')
    const [waiting,setWaiting] = useState('')
    const [mintNum,setMintNum] = useState(1)
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
            <PageHeader>
                <Heading as="h1" scale="xxl" color="secondary" mb="14px">
                    {t('铸造 NFT')}
                </Heading>
                <Heading scale="lg" color="text">
                    {t('NFT集合，他们正在我们眼前构建新的自由世界。')}
                </Heading>
            </PageHeader>
                    <AppBody>
                        <Flex flexDirection="column">
                            <Box margin="12px">
                                <StyledImage src="/images/farm/999.png" height={250} width={375} />
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
                                        铸造数量:
                                    </Text>
                                    {`${mintNum} NFT`}
                                </Flex>


                                <Flex marginTop='14px' marginLeft='40px' marginRight='40px' alignItems="center"  justifyContent="space-between">
                                        <Button onClick={() => setMintNum(mintNum - 1 < 1 ? 10 : mintNum - 1)}> - </Button>
                                         <Button onClick={() => setMintNum(mintNum + 1 >10 ? 1 : mintNum + 1)}> + </Button>
                                </Flex>
                                {
                                     !library &&
                                        <Text fontSize="14px" marginTop='14px' color="red">
                                            钱包连接不正确
                                        </Text>
                                }


                                <Button marginTop='30px' width='100%' minWidth={isMobile ? '131px' : '178px'}
                                        onClick={  () => {
                                            setWaiting('交易确认中...')
                                            if (!pigPunk || !library) {
                                                setWaiting('')
                                                return
                                            }
                                            pigPunk.mintApe(BigNumber.from(mintNum),{value:parseEther((Number(price) * mintNum).toString())}).then(() =>setWaiting(''))
                                                .catch(()=>setWaiting(''))
                                        }}
                                        disabled= {!!waiting  || !library || balance < (Number(price) * mintNum).toString()  }
                                >{ waiting !== '' ? waiting : t('铸造') }</Button>
                            </Box>
                        </Flex>

                    </AppBody>
                </Box>
            </Flex>
        </Page>
    )
}