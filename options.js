((window, document) => {
  const pieces = 'flash,input,reset,store'.split(',')
  const gather = (o, k) => Object.assign(o, { [k]: document.getElementById(k) })

  const { flash, input, reset, store } = pieces.reduce(gather, {})

  // Cleanup blacklisted urls
  const filter = x => x.split(/\n/)
    // Trim whitespace
    .map(v => v.trim())
    // Remove empty lines
    .filter(v => v.length)
    // Dedupe
    .filter((v, k, a) => a.indexOf(v) === k)

  const render = ({ list } = {}) => {
    input.value = list.reduce((a, b) => (a.length ? `${a}\n${b}` : b), '')
  }

  const signal = (text) => {
    // Set flash mesage, escaped on input
    flash.innerHTML = text || ''

    // Clear out after a short while
    setTimeout(() => {
      flash.textContent = ''
    }, 2000)
  }

  chrome.storage.sync.get(['list'], (list) => {
    render(list)

    reset.addEventListener('click', () => {
      render(list)
      signal('Options reset, hit save to apply!')
    })

    // Click save to store the list, update form if successful
    store.addEventListener('click', () => {
      const data = { list: filter(input.value) }

      chrome.storage.sync.set(data, () => {
        render(data)
        signal('Options saved!')
      })
    })
  })
})(window, document)
