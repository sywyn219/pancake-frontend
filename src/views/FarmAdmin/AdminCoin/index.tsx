import React, {FC, useEffect, useState} from "react";
import {Box, Button, Flex, Heading, Input, Text} from "@pancakeswap/uikit";
import {isAddress} from "@ethersproject/address";
import {BigNumber} from "ethers";
import {formatEther, parseEther} from "@ethersproject/units";
import {useTranslation} from "../../../contexts/Localization";
import {useFarm} from "../../../hooks/useContract";
import {InputPanel,Wrapper,Container} from "../styleAdmin";
import {useCurrentBlock} from "../../../state/block/hooks";


export const AdminCoin: FC = () => {
    const { t } = useTranslation()
    const [day,setDay] = useState('');
    const [dayText,setDayText] = useState('');
    const [waiting,setWaiting] = useState('')
    const [value,setValue] = useState('')
    const [outValue,setOutValue] = useState('')
    const [outValueText,setOutValueText] = useState('')
    const [valueText,setValueText] = useState('');
    const farmCon = useFarm()

    const [balance,setBalance] = useState('');
    const currentBlock = useCurrentBlock()
    useEffect(() => {
        const fetchBa = async () => {
            const ba = await farmCon.getBalance();
            setBalance(formatEther(ba))
        }
        fetchBa()
    },[currentBlock.valueOf()])

    return  (
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
                            disabled = { !!waiting || dayText !== '' || valueText !== '' || value === '' || day === ''}
                        >
                            {t('存币')}
                        </Button>
                    <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                        <Text>合约余额:</Text>
                        <Text>{`${balance} HSO`}</Text>
                    </Flex>

                    <Wrapper style={{marginTop: "20px"}}>
                        <Text>提币:</Text>
                    </Wrapper>
                    <InputPanel style={{ marginTop: "10px" }}>
                         <Container as="label">
                        <Input width='100%' type="text" value={outValue} onChange={ (e)=> {
                            setOutValue(e.target.value)
                         if (Number.isNaN( Number(e.target.value) ) || Number(e.target.value) < 1) {
                            setOutValueText(`${e.target.value} 金额需大于等于1`)
                            }else {
                             setOutValueText('')
                            }
                        }} />
                    <Text color="red" fontSize="13px" style={{ display: 'inline', cursor: 'pointer' }}>
                        { value === '' ? '' : outValueText !== '' ? outValueText : '' }
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
                disabled = { !!waiting || outValueText !== '' || outValue === ''}
            >
                {t('提币')}
            </Button>
            <Flex width="100%" justifyContent="center"  position="relative" marginTop="24px">
                <Text fontSize="16px">
                    {t('存币记录')}
                </Text>
            </Flex>
            <Text>....待开放</Text>
                    </Box>
      )
}