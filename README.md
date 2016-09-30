# promobar 
A lightweight and easily configurable promo bar in ES6. 

**~1.94kb gzipped**

## Install 
```bash
npm i promobar --save
```

## Basic Usage
This library requires some markup and styles. By default, the promo bar is *not* shown. Once shown, it will continue to show until a user closes it. Once closed, the promo bar will not show for that user again until either the `content` has been updated, or the time interval specified in `lifespan` is reached.

```javascript
import promobar from 'promobar'

const target = document.getElementById('promobar')

const promo = promobar(target, {
  content: document.getElementById('promoContent').innerHTML,
  lifespan: 1,
  resize: true,
  placeholder: () => /products|posts/.test(window.location.pathname),
  offsets: [
    [document.getElementById('header'), () => /\//.test(window.location.pathname)],
    document.getElementById('nav')
  ],
  close: [ document.getElementById('promoClose') ]
})

promo.show()
```

## Configuration
### promobar(target[, {...configation}])
The constructor takes two params, and return an instance object with API methods attached. 
- `target` - the outer element of your promo bar 
- `configuration`
  - `content` - the text and/or markup that is the content of your promo bar `type: string - default: document.getElementById('promoContent').innerHTML`
  - `lifespan` - the number of days before the promo expires and is enabled again for the user `type: number - default: 1`
  - `resize` - to watch the height of the bar on resize and adjust offsets to match `type: boolean - default: true`
  - `placeholder` - inserts a placeholder element that displaces the site by the height of the promo bar. Pass a function that returns a boolean to conditionally use a placeholder `type: function|boolean - default: true` 
  - `close` - an array of elements that, when clicked, should trigger the hide sequence of the promo bar `type: array - default: Array.prototype.slice.call(document.querySelectorAll('.js-promobarClose'))`
  - `offsets` - an array of elements that need to be displaced when the promo bar is active. These elements will receive an attribute that is styled with `transformY`. `type: array - default: []`

## API: Methods
#### .show()
Show the promo bar. If expired, bar will not show.
```javascript
promobar.show()
```

#### .hide()
Hide the promo bar.
```javascript
promobar.hide()
```

#### .on()
Attach event handlers
```javascript
promobar.on('show', state => /* do stuff */)
```

#### .reset()
If promo bar is expired, clear data and re-enable the promo bar. To show the bar after `.reset()`, call `.show()`.
```javascript
promobar.reset()
```

#### .getState()
Return the promo bar's state object.
```javascript
promobar.getState()

/*
{
  active: true|false, // shown or not
  enabled: true|false, // expired or not
  height: 50px // height of `target` outer element
}
*/
```

#### .emit()
You can also run handlers by emitting events manually.
```javascript
promobar.emit('hide')
```

## Events
Promobar emits a few lifecycle events. All callbacks receive a state object.
- `show` - when shown
- `hide` - when hidden 
- `update` - when updated 
- `disabled` - when a user closes the bar 

## Markup and Styles 
Please see `src/promobar.html` and `src/promobar.scss` for **suggested** markup and styles. 

## TODO 
1. Very tests
2. Much QA

MIT License
