import React, {FC, useCallback, useEffect, useState} from "react";
import Page from 'components/Layout/Page'
import {
    ArrowBackIcon,
    ArrowForwardIcon,
    Box,
    ButtonMenu,
    ButtonMenuItem,
    Flex,
    Grid,
    Card,
    Heading,
    Text, SubMenuItems, Input, Button
} from "@pancakeswap/uikit";
import {BigNumber} from "ethers";
import {AddressZero} from "@ethersproject/constants";
import styled from "styled-components";
import {isAddress} from "@ethersproject/address";
import {NEXT_PUBLIC_FARM} from "../../config/constants/endpoints";
import {useTranslation} from "../../contexts/Localization";
import {Adminrouter} from "./Adminrouter";
import {AppBody} from "../../components/App";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {useCurrentBlock} from "../../state/block/hooks";
import {useFarm} from "../../hooks/useContract";


const Wrapper = styled.div`
  & > div {
    width: 100%;
    background-color: ${({ theme }) => theme.colors.input};
    border: 0;
  }
  & button {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }
`

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

export const FarmAdmin: FC = () => {
    const { t } = useTranslation()
    const [accAddr,setAccAddr] = useState('')
    const [accAddrText,setAccAddrText] = useState('')
    const {account } = useActiveWeb3React()
    const currentBlock = useCurrentBlock()
    const farmCon = useFarm()
    const [waiting,setWaiting] = useState('')

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

    return  (
        <Page>
          <Adminrouter />
            <Flex width="100%" justifyContent="center" position="relative">
            <AppBody>
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
                        {t('绑定')}
                    </Button>
                </Box>
            </AppBody>
            </Flex>
        </Page>
    )
}


//        <Card style={{ width: '100%', height: 'max-content' }}>
//                 <Wrapper>
//                     <ButtonMenu activeIndex={activeTab} onItemClick={handleClick}>
//                         {[t('代理/产币'),t('查询'),t('参数'),].map((content, idx) => (
//                             <ButtonMenuItem
//                                 key={content}
//                                 style={{
//                                     color: idx === activeTab ? theme.colors.text : theme.colors.textSubtle,
//                                     backgroundColor: idx === activeTab ? theme.card.background : theme.colors.input,
//                                 }}
//                             >
//                                 {content}
//                             </ButtonMenuItem>
//                         ))}
//                     </ButtonMenu>
//                 </Wrapper>
//             </Card>