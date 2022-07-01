import {FC, useEffect, useRef, useState} from "react";
import { init, dispose } from 'klinecharts'
import styled from "styled-components";
import {Box} from "@pancakeswap/uikit";
import klinedata from "../../utils/klinedata";





const textColorDark = '#929AA5'
const gridColorDark = '#292929'
const axisLineColorDark = '#333333'
const crossTextBackgroundColorDark = '#373a40'

const textColorLight = '#76808F'
const gridColorLight = '#ededed'
const axisLineColorLight = '#DDDDDD'
const crossTextBackgroundColorLight = '#686d76'

function getThemeOptions (theme) {
        const textColor = theme === 'dark' ? textColorDark : textColorLight
        const gridColor = theme === 'dark' ? gridColorDark : gridColorLight
        const axisLineColor = theme === 'dark' ? axisLineColorDark : axisLineColorLight
        const crossLineColor = theme === 'dark' ? axisLineColorDark : axisLineColorLight
        const crossTextBackgroundColor = theme === 'dark' ? crossTextBackgroundColorDark : crossTextBackgroundColorLight
        return {
                grid: {
                        horizontal: {
                                color: gridColor
                        },
                        vertical: {
                                color: gridColor
                        }
                },
                candle: {
                        priceMark: {
                                high: {
                                        color: textColor
                                },
                                low: {
                                        color: textColor
                                }
                        },
                        tooltip: {
                                text: {
                                        color: textColor
                                }
                        }
                },
                technicalIndicator: {
                        tooltip: {
                                text: {
                                        color: textColor
                                }
                        }
                },
                xAxis: {
                        axisLine: {
                                color: axisLineColor
                        },
                        tickLine: {
                                color: axisLineColor
                        },
                        tickText: {
                                color: textColor
                        }
                },
                yAxis: {
                        axisLine: {
                                color: axisLineColor
                        },
                        tickLine: {
                                color: axisLineColor
                        },
                        tickText: {
                                color: textColor
                        }
                },
                separator: {
                        color: axisLineColor
                },
                crosshair: {
                        horizontal: {
                                line: {
                                        color: crossLineColor
                                },
                                text: {
                                        backgroundColor: crossTextBackgroundColor
                                }
                        },
                        vertical: {
                                line: {
                                        color: crossLineColor
                                },
                                text: {
                                        backgroundColor: crossTextBackgroundColor
                                }
                        }
                }
        }
}
const FlexKline = styled.div<{ selected: boolean }>`
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  padding: 15px;
`

export const KlineChart: FC = () => {

        function updateData (kLineChart) {
                setTimeout(() => {
                        if (kLineChart) {
                                const dataList = kLineChart.getDataList()
                                const lastData = dataList[dataList.length - 1]
                                const newData = klinedata(lastData.timestamp, lastData.close, 1)[0]
                                newData.timestamp += 1000 * 60
                                kLineChart.updateData(newData)
                        }
                        updateData(kLineChart)
                }, 1000)
        }

        useEffect(() => {
                const kLineChart = init('update-k-line')
                kLineChart.applyNewData(klinedata())
                kLineChart.setStyleOptions(getThemeOptions('light'))
                updateData(kLineChart)
                return () => {
                        dispose('update-k-line')
                }
        }, [])

        return (
            <Box id="update-k-line" width="100%" height="100%"/>
        )
}