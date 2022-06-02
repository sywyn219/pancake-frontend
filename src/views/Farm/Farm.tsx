import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import { useRouter } from 'next/router'
import Page from 'components/Layout/Page'
import {Button, Flex, Grid, Heading, Link, Text, useMatchBreakpoints, useModal} from "@pancakeswap/uikit";
import styled from "styled-components";
import {AddressZero} from "@ethersproject/constants";
import {
    MENU_HEIGHT,
    MOBILE_MENU_HEIGHT,
    TOP_BANNER_HEIGHT,
    TOP_BANNER_HEIGHT_MOBILE
} from "@pancakeswap/uikit/src/widgets/Menu/config";
import {Currency, Trade} from "@pancakeswap/sdk";
import {BigNumber} from "@ethersproject/bignumber";
import {parseEther} from "@ethersproject/units";
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import {useFarm, usePigPunk} from "../../hooks/useContract";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {formatBigNumber} from "../../utils/formatBalance";
import SaleCard from "./SaleCard";
import {useCurrencyBalance} from "../../state/wallet/hooks";
import NextLink from "next/link";
import {assignWith} from "lodash";



const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
  ${({ theme }) => theme.mediaQueries.xxl} {
    margin-bottom: 0;
  }
`

const TextTitle = styled(Text)`
  font-size: 16px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 20px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 40px;
  }
`

const TextSubTitle = styled(Text)`
  font-size: 12px;
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 16px;
  }
`
const Container = styled.div`
  position: sticky;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: auto;
  padding: 16px;
  z-index: 21;
  transition: top 0.2s;
  border-bottom: 1px ${({ theme }) => theme.colors.secondary} solid;
  border-left: 1px ${({ theme }) => theme.colors.secondary} solid;
  border-right: 1px ${({ theme }) => theme.colors.secondary} solid;
  border-radius: ${({ theme }) => `0 0 ${theme.radii.card} ${theme.radii.card}`};
  background: ${({ theme }) =>
    theme.isDark
        ? 'linear-gradient(360deg, rgba(49, 61, 92, 0.9) 0%, rgba(61, 42, 84, 0.9) 100%)'
        : 'linear-gradient(180deg, rgba(202, 194, 236, 0.9) 0%,  rgba(204, 220, 239, 0.9) 51.04%, rgba(206, 236, 243, 0.9) 100%)'};
  ${({ theme }) => theme.mediaQueries.xxl} {
    width: 1120px;
    padding: 24px 40px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    flex-direction: row;
  }
`

// {/*<Button minWidth={isMobile ? '131px' : '178px'}>{t('购买')}</Button>*/}
//                //http://14.116.138.103:8080/ipfs/QmbBJbWeQdRsEtgoNCYYvRnQ4eDMbdWyHRhyKsPUyuBFbJ




const Farm: React.FC = ({ children }) => {

    const { t } = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const [stickPosition, setStickyPosition] = useState<number>(0)
    const chosenFarmsMemoized = useMemo(() => {
        return  []
    }, [
    ])
    const refPrevOffset = useRef(typeof window === 'undefined' ? 0 : window.pageYOffset)


    const {account,library } = useActiveWeb3React()
    const pigPunk = usePigPunk();

    const [sale,setSale] = useState<{id:string,url:string}[]>([])
    const [baseURL,setBaseURL] = useState('')
    const [openSea,setOpenSea] = useState('')

    useEffect(() => {
        const scrollEffect = () => {
            const currentScroll = window.pageYOffset
            if (currentScroll <= 0) {
                setStickyPosition(0)
                return
            }
            if (currentScroll >= refPrevOffset.current) {
                setStickyPosition(0)
            } else {
                const warningBannerHeight = document.querySelector('.warning-banner')
                const topBannerHeight = isMobile ? TOP_BANNER_HEIGHT_MOBILE : TOP_BANNER_HEIGHT
                const topNavHeight = isMobile ? MENU_HEIGHT : MOBILE_MENU_HEIGHT
                const totalTopMenuHeight = warningBannerHeight ? topNavHeight + topBannerHeight : topNavHeight
                setStickyPosition(totalTopMenuHeight)
            }
            refPrevOffset.current = currentScroll
        }

        window.addEventListener('scroll', scrollEffect)
        return () => window.removeEventListener('scroll', scrollEffect)
    }, [isMobile])

    useEffect( () => {
        if (!library || !pigPunk) {
            return
        }
        const fetchBaseURI = async () => {
            const ipfsurl = await pigPunk.baseURI()
            setBaseURL(ipfsurl.substring(7))
        }
       fetchBaseURI()
    },[account,library])

    useEffect( () => {
        if (!library || baseURL === '') {
            return
        }
        const fetchNFT = async () => {
            const data = await pigPunk.getNFTListByOwner(account)

            const nftURL: {id:string,url:string}[] = await Promise.all(data.map( async (item) => {
                const resp = await fetch(`http://ipfs.io/ipfs/${baseURL}${item.toNumber()}`)
                const r = await resp.json()
                console.log("r-----.",r)
                const result = JSON.parse(JSON.stringify(r))
                return {id:item.toString(),url:`http://14.116.138.103:8080/ipfs/${result.image}`}
            }))

            setSale(nftURL)
        }
        fetchNFT()
    },[account,library,baseURL])

    return (
        <FarmContext.Provider value={{ chosenFarmsMemoized }}>

            <Container style={{ top: `${stickPosition}px` }}>
                <TextGroup>
                    <TextTitle bold>{t('我的NFT')}</TextTitle>
                </TextGroup>
            </Container>

            <Page>
                {sale && <Grid
                    gridGap="16px"
                    gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
                    mb="32px"
                    data-test="nft-collection-row"
                >
                    {sale.map((item,k) => {
                        return (
                            <SaleCard key={item.url} imgSrc={item.url}>
                                <Flex alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('NFT:')}
                                    </Text>
                                    {`PigPunk #${item.id}`}
                                </Flex>

                                <Flex alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('OpenSea:')}
                                    </Text>
                                    <Link rel="preconnect" href={`https://testnets.opensea.io/assets/rinkeby/${pigPunk.address}/${item.id}`}>
                                        {t(`https://opensea.io/.../${item.id}`)} </Link>
                                </Flex>

                            </SaleCard>
                        )
                    })}
                </Grid>}
            </Page>
        </FarmContext.Provider>
    )
}


export const FarmContext = createContext({ chosenFarmsMemoized: [] })

export default Farm