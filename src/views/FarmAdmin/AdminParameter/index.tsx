import React, {FC, useState} from "react";
import {Box, Button, Input, Text} from "@pancakeswap/uikit";
import {parseEther} from "@ethersproject/units";
import {isAddress} from "@ethersproject/address";
import {Container, InputPanel} from "../styleAdmin";
import {useTranslation} from "../../../contexts/Localization";
import {useFarm} from "../../../hooks/useContract";


export const AdminParameter: FC = () => {
    const [amount,setAmount] = useState('0.0')
    const [waiting,setWaiting] = useState('')
    const { t } = useTranslation()
    const farmCon = useFarm()

    return (
        <Box margin="12px">
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
                    farmCon.addSale(parseEther(amount)).then(r => {
                        setWaiting('')
                    }).catch(e => {
                        setWaiting('')
                    })
                }}
                width="100%"
                id="swap-button"
                disabled = { Number.isNaN( Number(amount) ) || !!waiting || Number(amount) <= 0}
            >
                {t('新增NFT')}
            </Button>
        </Box>
    )
}
