import stockpile from 'stockpile.js'
import loop from 'loop.js'

const storage = stockpile('promobar')

const now = () => new Date().getTime()

const height = el => Math.max(el.offsetHeight, el.scrollHeight, el.clientHeight)

const merge = (target, ...args) => {
  args.forEach(a => Object.keys(a).forEach(k => target[k] = a[k]))
  return target
}

const store = content => storage.set('root', {
  timestamp: new Date().getTime(),
  body: content
})

const isEnabled = (lifespan, body) => now => {
  let store = storage.get('root')
  let day = 1000*60*60*24

  if (!store) return true

  let time = (now - store.timestamp) / day

  return store.body !== body || time >= lifespan ? true : false 
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

const addAttributes = targets => targets.forEach(t => {
  if (Array.isArray(t)){
    !!t[1]() ? t[0].setAttribute('data-promobar', 'true') : t.removeAttribute('data-promobar') 
  } else {
    t.setAttribute('data-promobar', 'true') 
  }
})

const offsetPlaceholder = (target, check, height = null) => {
  if ('function' === typeof check ? check() : check){
    target.style.height = height ? `${height}px` : '0px'
  } else {
    target.style.height = '0px'
  }
}

export default (root, opts = {}) => {
  const placeholder = createPlaceholder()
  const style = createStyle()
  const events = loop()
  const config = merge({
    content: document.getElementById('promobarContent').innerHTML,
    resize: true,
    placeholder: true,
    offsets: [],
    close: Array.prototype.slice.call(document.querySelectorAll('.js-promobarClose')),
    lifespan: 1
  }, opts)
  const enabled = isEnabled(config.lifespan, config.content)
  const state = { 
    active: false, 
    enabled: enabled(now()),
    height: height(root) 
  }

  const offset = (height = null) => {
    offsetPlaceholder(placeholder, config.placeholder, height)
    addAttributes(config.offsets)
    style.innerHTML = `[data-promobar] { ${height ? `transform: translateY(${height}px) }` : '}' }`
  }

  const show = () => {
    if (!state.enabled){ return }

    state.active = true 

    offset(state.height)
    root.classList.add('is-active')
    document.body.classList.add('promobar-is-active')

    events.emit('show', state)
  }

  const hide = () => {
    if (!state.enabled){ return }

    state.active = false

    offset()
    root.classList.remove('is-active')
    document.body.classList.remove('promobar-is-active')

    events.emit('hide', state)
  }

  const update = (force = false) => {
    if (!state.enabled){ return }

    let h = height(root)

    if (force || h !== state.height){
      state.height = h 
      state.active ? offset(h) : show()
      events.emit('update', state)
    } 
  }

  const reset = () => {
    storage.remove('root')
    state.enabled = enabled(now()) 
  }

  config.resize ? window.addEventListener('resize', e => update()) : null

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
