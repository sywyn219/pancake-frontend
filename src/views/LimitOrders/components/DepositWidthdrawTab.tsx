import {useState, useCallback, memo, PropsWithChildren} from 'react'
import styled from 'styled-components'
import {ButtonMenu, ButtonMenuItem, Card, Flex} from "@pancakeswap/uikit";
import {ORDER_CATEGORY} from "../types";
import useTheme from "../../../hooks/useTheme";
import {useTranslation} from "../../../contexts/Localization";

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

const DepositWidthdrawTab: React.FC<any> = (props) => {
    const { theme } = useTheme()
    const { t } = useTranslation()
    const [activeTab, setIndex] = useState<ORDER_CATEGORY>(ORDER_CATEGORY.Open)
    const handleClick = useCallback((tabType: ORDER_CATEGORY) => {
        setIndex(tabType)
        props.setActive(tabType)
    }, [])

    return (
        <Flex flex="1" justifyContent="center" mb="24px">
            <Card style={{ width: '100%', height: 'max-content' }}>
                <Wrapper>
                    <ButtonMenu activeIndex={activeTab} onItemClick={handleClick}>
                        {[t('充币'), t('提币')].map((content, idx) => (
                            <ButtonMenuItem
                                key={content}
                                style={{
                                    color: idx === activeTab ? theme.colors.text : theme.colors.textSubtle,
                                    backgroundColor: idx === activeTab ? theme.card.background : theme.colors.input,
                                }}
                            >
                                {content}
                            </ButtonMenuItem>
                        ))}
                    </ButtonMenu>
                </Wrapper>
            </Card>
        </Flex>
    )
}

export default memo(DepositWidthdrawTab)