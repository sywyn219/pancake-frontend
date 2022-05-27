import {FC} from "react";
import Page from 'components/Layout/Page'
import {ArrowBackIcon, ArrowForwardIcon, Box, Flex, Grid, Text} from "@pancakeswap/uikit";
import {NEXT_PUBLIC_FARM} from "../../config/constants/endpoints";


export const FarmAdmin: FC = () => {
    console.log("NEXT_PUBLIC_FARM-->",NEXT_PUBLIC_FARM)
    return  (
        <Page>
            <Flex flex="1" justifyContent="center">
                <h1>fefefw</h1>
            </Flex>
        </Page>
    )
}