import React, {FC, useState} from "react";
import {Flex, Box, Text, Heading, Button, ArrowForwardIcon, useMatchBreakpoints} from "@pancakeswap/uikit";
import Image from "next/image";
import styled from "styled-components";
import Page from 'components/Layout/Page'
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import {AppBody} from "../../components/App";

const StyledImage = styled(Image)`
  border-radius: 4px;
`

export const MintNFT: FC = () => {
    const {t} = useTranslation()
    const { isMobile } = useMatchBreakpoints()
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
                                <Flex alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('XXX:')}
                                    </Text>
                                    #100
                                </Flex>
                                <Button width='100%' minWidth={isMobile ? '131px' : '178px'}>{t('铸造')}</Button>
                            </Box>
                        </Flex>

                    </AppBody>
                </Box>
            </Flex>
        </Page>
    )
}