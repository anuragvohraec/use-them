# \<use-them>

A set of Webcomponents to create apps. Seamlessly works with **bloc-them** 

## Installation
```bash
npm i use-them
```

## Usage
```html
<script type="module">
  import 'use-them/use-them.js';
</script>

<use-them></use-them>
```



## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`
```bash
npm start
```
To run a local development server that serves the basic demo located in `demo/index.html`


## Components

### **Animated gradient BG**
```ts
<animated-grad-bg use="gradients: #ee7752, #e73c7e, #23a6d5, #23d5ab"></animated-grad-bg>
```
In the use attribute you can mention, the gradient colors you waned to be animated.
See next section to see its demonstration.

### **Scaffold**
```ts
<ut-scaffold>
    <animated-grad-bg slot="appbar-bg" use="gradients: #ee7752, #e73c7e, #23a6d5, #23d5ab"></animated-grad-bg>
    <div slot="title"><ut-h1 use="color: white">hello</ut-h1></div>
    <div slot="body" style="height: 100%">
    This is body.
    </div>
    <div slot="menu">
      <ut-p>
        Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book 
      </ut-p>
    </div>
</ut-scaffold>
```
![scaffold demo](ui-screenshots/scaffold.gif?raw=true "Scaffold Demo")

* Scaffold has a **appbar-bg** slot to insert a back ground content for appbar. In above example, an animated gradient background is inserted in teh slot.
* In title slot one can mention the title.
* body slot for body of the scaffold.
* menu bar slot for menu options.
* one can emit snack bar messages too, using blocs.
```ts
export class MyButton extends RaisedButton<ScaffoldBloc,ScaffoldState>{
    onPress(): void {
        this.bloc?.postMessageToSnackBar("Hi this is a message for you!")
    }
    constructor(){
        super(ScaffoldBloc)
    }
}
```



### **Tabs**
```ts
<ut-tab-controller disableswipe>
  <ut-tabs>
    <ut-tab index="0" icon="account-circle" >Item 0</ut-tab>
    <ut-tab index="1" icon="account-balance">Item 1</ut-tab>
    <ut-tab index="2" icon="card-travel">Item 2</ut-tab>
  </ut-tabs>
</ut-tab-controller>
```
If you want to detect hand gesture to change tabs, remove **disableswipe** attribute.\
![tabs demo](ui-screenshots/tabs.gif?raw=true "Tabs Demo")


### Other components
* Forms
* Form inputs.
* Range selector
* Progress bars.
* Toggle button.

They can be best be seen working in the demo/index.html.
Simple run `npm run start` to see the demo of the components of **use-them**.

# Change release
## "version": "2.0.12"
1. Upgraded route-them lib

### "version": "2.0.10"
1. Bug fixed Form bloc. Was not deleting a disabled entry from internal set for disable and enable functionality of form bloc to work correctly.

### "version": "2.0.8"
1. Added **delegateChangeTo** function to form bloc for creating easily delegate onChange from any form input. 

### "version": "2.0.7"
1. Separate snackbar for an overall messaging system for app, without dependency of scaffold. Scaffold itself has its own snackbar too. 
However this new snack bar support many confirmation to change background color and text color. This snackbar also supports i18n.

### "version": "2.0.6"
1. Upgraded route-them

### "version": "2.0.5"
1. upgraded bloc-them and route them lib, as tabs seems to have bugs when nested

## "version": "2.0.4"
1. upgraded route-them lib

## "version": "2.0.3"
1. upgraded route-them lib

## "version": "2.0.2"
1. Inkwell
2. Tabs label

## "version": "2.0.1"
1. Adjustable button height
2. Dialogues


## "version": "2.0.0"
1. Configurable active color for tabs.
2. Input font weight can be controlled.
3. Check box input added.
4. Clear button on single line input. If its a data list , then clear button will appear automatically and if for an input its required then add an attribute **clearable** on it.

## "version": "1.0.0"
1. Made it responsive

## "version": "0.0.1"
1. First functioning release with following components: tabs, scaffold, toggle button, range selector, form inputs , Raise button, progress-bars, i18n, apptheme blocs.