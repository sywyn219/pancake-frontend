import React, {FC} from "react";
import {Flex, Heading, SubMenuItems, Text} from "@pancakeswap/uikit";
import {useRouter} from "next/router";
import {useTranslation} from "../../contexts/Localization";
import PageHeader from "../../components/PageHeader";


export const Adminrouter: FC = () => {
    const { t } = useTranslation()
    const router = useRouter()
    return  (
        <>
            <PageHeader>
                <Flex width="100%" justifyContent="center"  position="relative">
                    <Heading scale="lg" color="text">
                        {t('总后台')}
                    </Heading>
                </Flex>
            </PageHeader>
            <SubMenuItems
                items={[
                    {
                        label: t('代理'),
                        href: '/admin-farm',
                    },
                    {
                        label: t('产币'),
                        href: '/admin-coin',
                    },
                    {
                        label: t('审批'),
                        href: '/admin-width',
                    },
                    {
                        label: t('参数'),
                        href: '/admin-setup',
                    },
                ]}
                activeItem={router.route}
            />
        </>
    )
}

