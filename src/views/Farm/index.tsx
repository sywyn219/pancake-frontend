import { FC } from 'react'
import Farm, { FarmContext } from './Farm'

export const FarmPageLayout: FC = ({ children }) => {
    return <Farm>{children}</Farm>
}

export { FarmContext }

