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
interface HotCollectionCardProps {
    imgSrc: string
}
const SaleCard: React.FC<HotCollectionCardProps> = (
    {imgSrc,
        children
    }) => {
    const renderBody = () => (
        <CardBody p="8px">
            <StyledImage src={imgSrc} height={125} width={375} />
            {children}
        </CardBody>)

    return (
        <Card>
            {renderBody()}
        </Card>
    )
}

export default SaleCard