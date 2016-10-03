import stockpile from 'stockpile.js'
import loop from 'loop.js'

const storage = stockpile('promobar')

const now = () => new Date().getTime()

const height = el => Math.max(el.offsetHeight, el.scrollHeight, el.clientHeight)

const merge = (target, ...args) => {
  args.forEach(a => Object.keys(a).forEach(k => target[k] = a[k]))
  return target
}

const error = {
  content: () => console.warn('promobar: content is undefined')
}

const createPlaceholder = () => {
  let div = document.createElement('div')
  div.className = 'promobar-placeholder'
  div.style.height = '0px'
  document.body.insertBefore(div, document.body.children[0])
  return div
}

const createStyle = () => {
  let style = document.createElement('style')
  document.body.insertBefore(style, document.body.children[0])
  return style
}

/**
 * Add content to localStorage with timestamp
 * @param {string} content Content of promo bar
 */
const store = content => storage.set('root', {
  timestamp: new Date().getTime(),
  body: content
})

/**
 * Curried function: check if bar is enabled
 * @param {number} now Current time in milliseconds 
 * @return {boolean} if bar is eligible to be shown
 */
const isEnabled = (lifespan, body) => now => {
  let store = storage.get('root')
  let day = 1000*60*60*24

  if (!store) return true

  let time = (now - store.timestamp) / day

  return store.body !== body || time >= lifespan ? true : false 
}

/**
 * Add data-promobar attributes to elements,
 * providing they pass their optional checks
 */
const addAttributes = targets => targets.forEach(t => {
  if (!t){ return }

  if (Array.isArray(t)){
    !!t[1]() ? t[0].setAttribute('data-promobar', 'true') : t[0].removeAttribute('data-promobar') 
  } else {
    t.setAttribute('data-promobar', 'true') 
  }
})

/**
 * Set height of placeholder element
 */
const offsetPlaceholder = (target, height = null) => target.style.height = height ? `${height}px` : '0px'

export default (root, opts = {}) => {

  /**
   * Emitter
   */
  const events = loop()

  /**
   * Merge options with defaults
   */
  const config = merge({
    content: document.getElementById('promobarContent').innerHTML,
    resize: true,
    placeholder: true,
    offsets: [],
    close: Array.prototype.slice.call(document.querySelectorAll('.js-promobarClose')),
    lifespan: 1
  }, opts)

  if (!config.content){ return error.content() }

  /**
   * Boolean values and helpers
   */
  const enabled = isEnabled(config.lifespan, config.content)
  const usePlaceholder = () => 'function' === typeof config.placeholder ? config.placeholder() : config.placeholder
  const useOffsets = config.offsets.length > 0 ? true : false

  /**
   * Generated elements
   */
  const placeholder = createPlaceholder() 
  const style = useOffsets ? createStyle() : null

  const state = { 
    active: false, 
    enabled: enabled(now()),
    height: height(root) 
  }

  /**
   * Set height of placeholder element
   * Set styles for other offset elements
   * @param {number} height Height in pixels of the promo bar
   */
  const offset = (height = null) => {
    usePlaceholder() ? offsetPlaceholder(placeholder, height) : offsetPlaceholder(placeholder)

    if (useOffsets){
      addAttributes(config.offsets)
      style.innerHTML = `[data-promobar] { ${height ? `transform: translateY(${height}px) }` : '}' }`
    }
  }

  const show = () => {
    if (!state.enabled){ return }

    state.active = true 

    // Set offsets, add active classes
    offset(state.height)
    root.classList.add('is-active')
    document.body.classList.add('promobar-is-active')

    events.emit('show', state)
  }

  const hide = (force = false) => {
    if (!state.enabled){ return }

    state.active = false

    if (force){
      store(config.content)
      state.enabled = enabled(now()) 
    }

    /**
     * Reset offsets, remove active classes
     */
    offset()
    root.classList.remove('is-active')
    document.body.classList.remove('promobar-is-active')

    events.emit('hide', state)
  }

  /**
   * @param {boolean} force Force recalculation of offsets
   */
  const update = (force = false) => {
    if (!state.enabled){ return }

    let h = height(root)

    if (force || h !== state.height){
      state.height = h 
      state.active ? offset(h) : show()
      events.emit('update', state)
    } 
  }

  /**
   * Clear storage, set state.enabled
   */
  const reset = () => {
    storage.remove('root')
    state.enabled = enabled(now()) 
  }

  config.resize ? window.addEventListener('resize', e => update()) : null

  /**
   * On close, store content to await expiration
   * update state.enabled
   */
  config.close.forEach(t => t.addEventListener('click', e => {
    e.preventDefault()
    hide()
    store(config.content)
    state.enabled = enabled(now()) 
    events.emit('disabled', state)
  }))

  return {
    ...events,
    hide,
    show,
    update,
    reset,
    getState: () => state
  }
}
