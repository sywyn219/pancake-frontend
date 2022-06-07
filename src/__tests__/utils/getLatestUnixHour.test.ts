import { fromUnixTime } from 'date-fns'
import getLatestUnixHour from 'utils/getLatestUnixHour'

describe('getLatestUnixHour', () => {
  it('returns correct starting hour', () => {
    const sampleDate = fromUnixTime(1636390053) // 2021-11-8 01:47:33 PM GMT
    const expected = 1636387200 // 2021-11-8 01:00:00 PM GMT
    expect(getLatestUnixHour(sampleDate)).toBe(expected)
  })
})
