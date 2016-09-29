import stockpile from 'stockpile.js'
import loop from 'loop.js'

const storage = stockpile('__promo__')

const height = el => Math.max(el.offsetHeight, el.scrollHeight, el.clientHeight)

const merge = (target, ...args) => {
  args.forEach(a => Object.keys(a).forEach(k => target[k] = a[k]))
  return target
}

const store = content => storage.set('root', {
  timestamp: new Date().getTime(),
  body: content
})

const isEnabled = (time, lifespan, body) => {
  let store = storage.get('root')
  let day = 1000*60*60*24

  if (!store) return true

  let daysPassed = (time - store.timestamp) / day

  return store.body !== body || daysPassed >= lifespan ? true : false 
}

const createPlaceholder = () => {
  let div = document.createElement('div')
  div.className = 'promo-placeholder'
  div.style.height = '0px'
  document.body.insertBefore(div, document.body.children[0])
  return div
}

const style = document.createElement('style')
document.body.insertBefore(style, document.body.children[0])

const css = (target, height = null) => {
  target.setAttribute('data-promo', height)
  style.innerHTML = `[data-promo] { ${height ? `transform: translateY(${height}px) }` : '' }`
}

/**
 * Apply transforms to all 
 * specified elements
 *
 * @param {array} nodes DOM nodes to apply transforms to
 * @param {number} height Distance to displace elements
 */
const displace = (targets, height = null) => targets.forEach(t => {
  if (Array.isArray(t)){
    !!t[1]() ? css(t[0], height ? height : null) : css(t[0])
  } else {
    css(t, height ? height : null)
  }
})

const offset = (target, check, height = null) => {
  check = 'function' === typeof check ? check() : check
  target.style.height = check ? `${height ? height : 0}px` : '0px'
}

export default (promo, opts = {}) => {
  const state = { 
    active: false, 
    enabled: true,
    height: height(promo) 
  }
  const content = promo.querySelector('.js-content').innerHTML
  const placeholder = createPlaceholder()
  const events = loop()
  const config = merge({
    resize: true,
    offset: true,
    displace: [],
    close: Array.prototype.slice.call(document.querySelectorAll('.js-promo-close')),
    lifespan: 1
  }, opts)

  const checkIfEnabled = () => {
    state.enabled = isEnabled(new Date().getTime(), config.lifespan, content) 
    return state.enabled
  }

  const render = (height = null) => {
    offset(placeholder, config.offset, height)
    displace(config.displace, height)
  }

  const show = () => {
    if (!state.enabled){ return }

    state.active = true 
    render(state.height)
    promo.classList.add('is-active')
    document.body.classList.add('promo-is-active')
    events.emit('show', state)
  }

  const hide = () => {
    if (!state.enabled){ return }

    state.active = false
    render()
    promo.classList.remove('is-active')
    document.body.classList.remove('promo-is-active')
    events.emit('hide', state)
  }

  const update = (force = false) => {
    checkIfEnabled()

    if (!state.enabled){ return }

    let h = height(promo)

    if (force || h !== state.height){
      state.height = h 
      state.active ? render(h) : show()
      events.emit('update', state)
    } 
  }

  const reset = () => {
    storage.remove('root')
    checkIfEnabled() 
  }

  config.resize ? window.addEventListener('resize', e => update()) : null

  config.close.forEach(t => t.addEventListener('click', e => {
    e.preventDefault()
    hide()
    store(content)
    checkIfEnabled() 
  }))

  checkIfEnabled()

  return {
    ...events,
    hide,
    show,
    update,
    reset,
    getState: () => state
  }
}
