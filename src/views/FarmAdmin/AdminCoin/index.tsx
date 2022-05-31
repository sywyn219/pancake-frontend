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
    const [valueText,setValueText] = useState('');
    const farmCon = useFarm()

    const currentBlock = useCurrentBlock();

    const [status,setStauts] = useState<{
        miningLastRewardBlock: BigNumber;
        miningAccHSOPerShare: BigNumber;
        miningTotalAmount: BigNumber;
        miningRemainingAmount: BigNumber;
        miningRewardPerBlock: BigNumber;
        miningBlockEnd: BigNumber;
        widthAddr: string;
        pairHSO: string;
        balance: BigNumber;
        usersLen: BigNumber;
        userAddrsLen: BigNumber;
        ratePNC: BigNumber;
        level0: BigNumber;
        levelRate0: BigNumber;
        level1: BigNumber;
        levelRate1: BigNumber;
        level2: BigNumber;
        levelRate2: BigNumber;
        level3: BigNumber;
        levelRate3: BigNumber;
    }>({
        miningLastRewardBlock: BigNumber.from(0),
        miningAccHSOPerShare: BigNumber.from(0),
        miningTotalAmount: BigNumber.from(0),
        miningRemainingAmount: BigNumber.from(0),
        miningRewardPerBlock: BigNumber.from(0),
        miningBlockEnd: BigNumber.from(0),
        widthAddr: '',
        pairHSO: '',
        balance: BigNumber.from(0),
        usersLen: BigNumber.from(0),
        userAddrsLen: BigNumber.from(0),
        ratePNC: BigNumber.from(0),
        level0: BigNumber.from(0),
        levelRate0: BigNumber.from(0),
        level1: BigNumber.from(0),
        levelRate1: BigNumber.from(0),
        level2: BigNumber.from(0),
        levelRate2: BigNumber.from(0),
        level3: BigNumber.from(0),
        levelRate3: BigNumber.from(0)
    });
    useEffect(() => {
        const fetchStatus = async () => {
            const sa = await farmCon.getStatus();
            setStauts(sa);
        }
        fetchStatus();
    },[currentBlock.valueOf()])

    return  (
        <Box margin="12px">
            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                <Text fontSize="14px">
                    {t('最后结算块:')}
                </Text>
                {`${status.miningLastRewardBlock.toNumber()}`}
            </Flex>
            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                <Text fontSize="14px">
                    {t('奖励系数:')}
                </Text>
                {`${formatEther(status.miningAccHSOPerShare)} HSO`}
            </Flex>
            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                <Text fontSize="14px">
                    {t('总购买:')}
                </Text>
                {`${formatEther(status.miningTotalAmount)} HSO`}
            </Flex>
            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                <Text fontSize="14px">
                    {t('剩余总量:')}
                </Text>
                {`${formatEther(status.miningRemainingAmount)} HSO`}
            </Flex>
            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                <Text fontSize="14px">
                    {t('每个块奖励:')}
                </Text>
                {`${formatEther(status.miningRewardPerBlock)} HSO`}
            </Flex>
            <Flex alignItems="center"  justifyContent="space-between" marginTop="24px">
                <Text fontSize="14px">
                    {t('挖矿截至:')}
                </Text>
                {`${status.miningBlockEnd}`}
            </Flex>
                        <Wrapper style={{marginTop: "30px"}}>
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
                        <Text>{`${formatEther(status.balance)} HSO`}</Text>
                    </Flex>
            <Button
                marginTop="16px"
                variant='primary'
                onClick={() => {
                    setWaiting("添加等待中...")
                    farmCon.widthDrawOwner().then(r => {
                        setWaiting('')
                    }).catch(e => {
                        setWaiting('')
                    })
                }}
                width="100%"
                id="swap-button"
                disabled = { !!waiting}
            >
                {t('紧急提币')}
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