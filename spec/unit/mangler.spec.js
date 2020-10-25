const { mangleMe, partsMangler } = require('../../components/mangler')

describe('mangler', () => {
  it('should return an array of words', () => {
    const pattern = [0, 0, 2]
    const acro = 'PoS'
    const result = partsMangler(acro, null, pattern)
    expect(result).toBeDefined()
    expect(result).toHaveSize(3)
  })

  it('should return a valid response', () => {
    const body = {
      text: 'BJM'
    }
    let result
    const resp = {
      send: (payload) => {
        result = payload
      }
    }
    mangleMe(body, resp)
    expect(result.text).toContain('*BJM:*')
  })
})