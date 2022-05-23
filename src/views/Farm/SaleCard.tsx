import {Card, CardBody, Flex, Heading} from "@pancakeswap/uikit";
import styled, {css} from "styled-components";
import Image from "next/image";


const StyledImage = styled(Image)`
  border-radius: 4px;
`

const StyledHotCollectionCard = styled(Card)<{ disabled?: boolean }>`
  border-radius: 8px;
  border-bottom-left-radius: 56px;
  transition: opacity 200ms;

  & > div {
    border-radius: 8px;
    border-bottom-left-radius: 56px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    ${({ disabled }) =>
    disabled
        ? ''
        : css`
            &:hover {
              cursor: pointer;
              opacity: 0.6;
            }
          `}
  }
`

const SaleCard: React.FC<string> = (imgSrc) => {
    const renderBody = () => (
        <CardBody p="8px">
            <StyledImage src={imgSrc} height={125} width={375} />
        </CardBody>)
    return (
        <StyledHotCollectionCard disabled data-test="hot-collection-card">
            <div style={{ cursor: 'default' }}>{renderBody()}</div>
        </StyledHotCollectionCard>
    )
}

export default SaleCard