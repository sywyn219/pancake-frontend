import React, {FC, useCallback, useEffect, useState} from "react";
import Page from 'components/Layout/Page'
import {
    Box,
    ButtonMenu,
    ButtonMenuItem,
    Flex,
    Grid,
    Card,
    Heading,
    Text, SubMenuItems, Input, Button
} from "@pancakeswap/uikit";
import {useTranslation} from "../../contexts/Localization";
import {AppBody} from "../../components/App";
import PageHeader from "../../components/PageHeader";
import useTheme from "../../hooks/useTheme";
import {AdminProxy} from "./AdminProxy";
import {AdminCoin} from "./AdminCoin";
import {AdminParameter} from "./AdminParameter";

const Items =  [
    {content:"产币",item: <AdminCoin />},
    {content: "代理",item: <AdminProxy />},
    {content:"审批",item: <h1>待开放...</h1>},
    {content:"参数",item: <AdminParameter/>}]

export const FarmAdmin: FC = () => {
    const { t } = useTranslation()
    const [activeTab, setIndex] = useState(0)
    const handleClick = useCallback((tabType) => {
        setIndex(tabType)
    }, [])

    const { theme } = useTheme()

    return  (
        <Page>
            <PageHeader>
                <Flex width="100%" justifyContent="center"  position="relative">
                    <Heading scale="lg" color="text">
                        {t('总后台')}
                    </Heading>
                </Flex>
            </PageHeader>
            <Box mr="20px">
                <Flex width="100%" justifyContent="center"  position="relative">
                    <ButtonMenu activeIndex={activeTab} onItemClick={handleClick} scale="sm" ml="24px">
                        {Items.map((sub, idx) => (
                            <ButtonMenuItem
                                key={sub.content}
                                style={{
                                    color: idx === activeTab ? theme.colors.text : theme.colors.textSubtle,
                                    backgroundColor: idx === activeTab ? theme.card.cardHeaderBackground.default : theme.colors.input,
                                }}
                            >
                                {sub.content}
                            </ButtonMenuItem>
                        ))}
                    </ButtonMenu>
                </Flex>
            </Box>

            <Flex width="100%" justifyContent="center" position="relative">
            <AppBody>
                {Items[activeTab].item}
            </AppBody>
            </Flex>
        </Page>
    )
}
