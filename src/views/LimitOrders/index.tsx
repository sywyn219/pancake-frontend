import { useCallback, useEffect, useState } from 'react'
import { CurrencyAmount, Token, Trade } from '@pancakeswap/sdk'
import {Button, Box, Flex, useModal, useMatchBreakpoints, BottomDrawer, Link, Text} from '@pancakeswap/uikit'

import { useTranslation } from 'contexts/Localization'
import Column, { AutoColumn } from 'components/Layout/Column'
import { AppBody } from 'components/App'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Footer from 'components/Menu/Footer'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useDefaultsFromURLSearch } from 'state/limitOrders/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { GELATO_NATIVE, LIMIT_ORDERS_DOCS_URL } from 'config/constants'
import { Wrapper, StyledInputCurrencyWrapper, StyledSwapContainer } from './styles'
import Page from '../Page'
import LimitOrderTable from './components/LimitOrderTable'
import DepositWidthdrawTab from "./components/DepositWidthdrawTab";
import {mainnetTokens} from "../../config/constants/tokens";
import DepositWidthCurrency from "../../components/CurrencyInputPanel/DepositWidthCurrency";
import {ORDER_CATEGORY} from "./types";
import {useDerivedSwapInfo, useSwapActionHandlers, useSwapState} from "../../state/swap/hooks";
import { Field } from '../../state/swap/actions'
import {useCurrency} from "../../hooks/Tokens";
import useWrapCallback, {WrapType} from "../../hooks/useWrapCallback";
import shouldShowSwapWarning from "../../utils/shouldShowSwapWarning";
import {useIsTransactionUnsupported} from "../../hooks/Trades";
import Trans from "../../components/Trans";
import {useIntOut} from "../../hooks/useContract";
import { toUtf8Bytes } from '@ethersproject/strings'


const LimitOrders = () => {
  // Helpers
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()

  // TODO: use returned loadedUrlParams for warnings
  useDefaultsFromURLSearch()

  // TODO: fiat values
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(mainnetTokens.usdt.address)

  const outputCurrency = useCurrency(outputCurrencyId)

  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(
      independentField,
      typedValue,
      inputCurrencyId,
      inputCurrency,
      outputCurrencyId,
      outputCurrency,
      recipient,
  )

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)


  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const handleTypeInput = useCallback(
      (value: string) => {
        onUserInput(Field.INPUT, value)
      },
      [onUserInput],
  )

  const [active,setActive] = useState(0)

  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)
  const intout = useIntOut()

  const output = async ()=> {
    console.log("intout----------------_",await intout.widthdraw("1000000",toUtf8Bytes("aaaaaaaaaaaaaafew")))
  }

  output()

  
  const handleInputSelect = useCallback(
      (currencyInput) => {
        setApprovalSubmitted(false) // reset 2 step UI for approvals
        onCurrencySelection(Field.INPUT, currencyInput)
        const showSwapWarning = shouldShowSwapWarning(currencyInput)
        if (showSwapWarning) {
          setSwapWarningCurrency(currencyInput)
        } else {
          setSwapWarningCurrency(null)
        }
      },
      [onCurrencySelection],
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = showWrap
      ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
      : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  return (
      <Page
          removePadding={false}
          hideFooterOnDesktop={false}
          noMinHeight
          helpUrl={LIMIT_ORDERS_DOCS_URL}
      >
        <Flex
            width="100%"
            justifyContent="center"
            position="relative"
            mb={null}
            mt={null}
        >
          {!isMobile && (
              <Flex width='50%' flexDirection="column">
                <Box width="100%">
                  <LimitOrderTable isCompact={isTablet} />
                </Box>
              </Flex>
          )}
          <Flex flexDirection="column" alignItems="center">
            <StyledSwapContainer $isChartExpanded={false}>
              <StyledInputCurrencyWrapper>
                <AppBody>
                  <DepositWidthdrawTab setActive={setActive} />
                  <Wrapper id="limit-order-page" style={{ minHeight: '412px' }}>
                    <AutoColumn gap="sm">
                      <DepositWidthCurrency
                          active={active}
                          value={formattedAmounts[Field.INPUT]}
                          label={independentField === Field.OUTPUT ? t('From (estimated)') : t('From')}
                          currency={currencies[Field.INPUT]}
                          onUserInput={handleTypeInput}
                          onMax={handleMaxInput}
                          onCurrencySelect={handleInputSelect}
                          otherCurrency={currencies[Field.OUTPUT]}
                          id="limit-order-currency-input"
                       />
                    </AutoColumn>
                    <Box mt="0.25rem">
                      {swapIsUnsupported ? (
                          <Button width="100%" disabled>
                            {t('Unsupported Asset')}
                          </Button>
                      ) : !account ? (
                          <ConnectWalletButton width="100%" />
                      ) : showWrap ? (
                          <Button width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                            {wrapInputError ??
                            (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                          </Button>
                      ) : active === ORDER_CATEGORY.Open ? <></> :
                          <Button width="100%">
                            <Trans>确认</Trans>
                          </Button>
                      }
                    </Box>
                  </Wrapper>
                </AppBody>
              </StyledInputCurrencyWrapper>
            </StyledSwapContainer>
            {isMobile && (
                <Flex mt="24px" width="100%">
                  <LimitOrderTable isCompact />
                </Flex>
            )}
            <Box display={['none', null, null, 'block']} width="100%" height="100%">
              <Footer variant="side" helpUrl={LIMIT_ORDERS_DOCS_URL} />
            </Box>
          </Flex>
        </Flex>
      </Page>
  )
}

export default LimitOrders