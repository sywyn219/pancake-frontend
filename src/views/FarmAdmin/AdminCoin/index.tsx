import React, {FC, useState} from "react";
import {Box, Button, Flex, Heading, Input, Text} from "@pancakeswap/uikit";
import {isAddress} from "@ethersproject/address";
import styled from "styled-components";
import PageHeader from "../../../components/PageHeader";
import {Adminrouter} from "../Adminrouter";
import Page from "../../../components/Layout/Page";
import {AppBody} from "../../../components/App";
import {useTranslation} from "../../../contexts/Localization";
import {useFarm} from "../../../hooks/useContract";
import {BigNumber} from "ethers";
import {parseEther} from "@ethersproject/units";



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


export const AdminCoin: FC = () => {
    const { t } = useTranslation()
    const [day,setDay] = useState('');
    const [dayText,setDayText] = useState('');
    const [waiting,setWaiting] = useState('')
    const [value,setValue] = useState('')
    const [valueText,setValueText] = useState('');
    const farmCon = useFarm()
    return  (
        <Page>
            <Adminrouter />
            <Flex width="100%" justifyContent="center" position="relative">
                <AppBody>
                    <Box margin="12px">
                        <Wrapper style={{marginTop: "20px"}}>
                            <Text>释放天数:</Text>
                        </Wrapper>
                        <InputPanel style={{ marginTop: "10px" }}>
                            <Container as="label">
                                <Input width='100%' type="text" value={day} onChange={ (e)=> {
                                    setDay(e.target.value)
                                    if (Number.isNaN( Number(e.target.value) ) || Number(e.target.value) < 1) {
                                        setDayText(`${e.target.value} 需大于等于1`)
                                    }else {
                                        setDayText('')
                                    }
                                }} />
                                <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                                    { day === '' ? '' : dayText !== '' ? dayText : '' }
                                </Text>
                            </Container>
                        </InputPanel>

                        <Wrapper style={{marginTop: "20px"}}>
                            <Text>存入金额:</Text>
                        </Wrapper>
                        <InputPanel style={{ marginTop: "10px" }}>
                            <Container as="label">
                                <Input width='100%' type="text" value={value} onChange={ (e)=> {
                                    setValue(e.target.value)
                                    if (Number.isNaN( Number(e.target.value) ) || Number(e.target.value) < 1) {
                                        setValueText(`${e.target.value} 金额需大于等于1`)
                                    }else {
                                        setValueText('')
                                    }
                                }} />
                                <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                                    { value === '' ? '' : valueText !== '' ? valueText : '' }
                                </Text>
                            </Container>
                        </InputPanel>

                        <Button
                            marginTop="16px"
                            variant='primary'
                            onClick={() => {
                                setWaiting("添加等待中...")
                                farmCon.addMining(BigNumber.from(day),{value: parseEther(value)}).then(r => {
                                    setWaiting('')
                                }).catch(e => {
                                    setWaiting('')
                                })
                            }}
                            width="100%"
                            id="swap-button"
                            disabled = { !!waiting || dayText !== '' || valueText !== ''}
                        >
                            {t('绑定')}
                        </Button>
                    </Box>
                </AppBody>
            </Flex>
        </Page>
      )
}