const block = ({ tabId }) => {
  chrome.browserAction.setIcon({ tabId, path: 'assets/icon-hi.png' })

  return { cancel: true }
}

const strap = (list = '') => {
  const urls = !!list && list.split('\n')

  if (urls) {
    chrome.storage.sync.set({ list: urls })
    chrome.webRequest.onBeforeRequest.addListener(block, { urls }, ['blocking'])
  }
}

const extra = 'blacklist.txt'

const setup = (from = chrome.runtime.getURL(extra)) => fetch(from)
  .then((response) => {
    if (response.status !== 200) {
      throw Error('HTTP error')
    }

    response
      .text()
      .then((text) => {
        if (text === '') {
          throw Error('List empty')
        }

        strap(text)
      })
  })
  .catch(() => {
    if (from.includes(extra)) {
      strap()
    } else {
      // Fallback
      setup()
    }
  })

// Runs on load, reload, and after browser or extension updates
chrome.runtime.onInstalled.addListener(() => {
  // Retrieve options from store
  chrome.storage.sync.get(['list'], ({ list }) => {
    if (list && Object.keys(list).length) {
      strap(list.join('\n'))
    } else {
      const from = 'https://gist.githubusercontent.com/thewhodidthis/55df956812fedff1443b510179551954/raw'

      setup(from)
    }
  })
})

// Updating domain for synchronous checking in onBeforeRequest
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo === 'loading') {
    chrome.browserAction.setIcon({ tabId, path: 'assets/icon.png' })
  }
})
