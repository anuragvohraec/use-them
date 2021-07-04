# \<use-them>

A set of Webcomponents to create apps. Seamlessly works with **bloc-them** 

## Installation
```bash
npm i use-them
```

## Build
```
npx rollup -c rollup.config.js
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
### "version": "7.0.4"
1. Added vibration to many components.
2. Added Sound to scan.

### "version": "7.0.3"
1. Bug fixes

### "version" : "7.0.2"
1. `CreateSearchableSelector` class for easily creating searchable selectors.

### "version" : "7.0.1"
1. QRCode/barCode scanner
2. `ut-dialogue` now if has blank attribute then it will render blank when is hidden.
3. Text input bug fixes, form value state change were not reflecting there values.
4. some beautification of some elements.
5. ConfirmationDialogue widget now has two additional methods `show_in_progress` and `show_buttons`, which can be used to do show circular progress indicator before closing teh dialogue.

### "version" : "7.0.0"
1. Updated the way FormInputBuilder were created.
2. Added TextAreaInput for getting multi line text input from user.
3. While delegating change, message bloc is not mandatory.
4. Raised button color change at run time. `<my-dialogue-button use="primaryColor: #0e1f3e;"></my-dialogue-button>` will change it color at run time.

### "version" : "6.1.0"
1. Added file picker
2. Location fo title of scaffold
3. Snack bar visibility

### "version" : "6.0.11"
1. Fixed shadow of backable screen title
2. Upgraded bloc-them lib

### "version" : "6.0.10"
1. Bug fix: ConfirmationDialogue and BackableScreen's z-index
### "version" : "6.0.9"
1. Added ConfirmationDialogue class to easily create confirmation dialogues.

### "version" : "6.0.7"
1. Updated z-index of menu bar

### "version" : "6.0.5"
1. Added hookups to RouteThemBloc on pop and Goto calls. One need to extends `RouteThemNavigationHookBloc` class and provide it as bloc before apppage bloc.

### "version" : "6.0.4"
1. Added `ut-indeterminate-loading-bar`.

### "version" : "6.0.3"
1. Route-them: Now certain pages can be modified to confirmation message before pop up. To achieve this when you call `routeThemBloc.goToPage(url,data)`, the data must have `confirmation_message:string` type property. This message will be used to get confirmation before popup.

### "version" : "6.0.1"
1. Exposed text input in index.ts

### "version" : "6.0.0"
1. Removed iron icons and added `ut-icon` tag instead. Will help minimize build size and only allow packing of icons which are required by the app.
2. Added rollup support. Now the use-them libs can be used externally too as a script module.

### "version" : "5.0.11"
1. HorizontalScrollLimitDetector and VerticalScrollLimitDetector, to detect scroll end and beginning .
2. Generalized usage of Dialogue (ut-dialogue)

### "version": "5.0.8"
1. SelectorWidgetUnstructured

### "version": "5.0.7"
1. NoBlocRaisedButton

### "version": "5.0.6"
1. Added double-tap for GestureDetector. Also added GestureDetectorBuilder widget.

### "version": "5.0.5"
1. added ut-horizontal-circular-slider and CircularCounterBloc. Always call CircularCounterBloc.setMaxCount before using the slider's left or right swipe.

### "version": "5.0.1"
1. added loading-cell : helpful for creating loading placeholder while content loads.

### "version": "5.0.0"
1. Upgraded to 5.0.0 of bloc-them lib
2. Added lay-them and bloc-them lib code inside this lib and removed there external dependency. Maintaining separate repository for each one of them was difficult. Now can maintain codes from one place.

### "version": "4.2.2"
1. Added circular-progress-indicator

### "version": "4.2.1"
1. Added circular-icon-button and labeled-icon-button

### "version": "4.2.0"
1. Backable screen: One you can go back to previous screen on pressing back.
2. Run time update to use attribute on widgetbuilder will effect re-rendering

### "version": "4.1.0"
1. Added date picker

### "version": "V4.0.0"
1. Added onchange listener to selector bloc

### "version": "V3.0.4"
1. Refactored selector

### "version": "3.0.3"
1. Added selector element

### "version": "V3.0.1"
1. Forgot to upgrade bloc-them and route-them indeed.

### "version": "3.0.0"
1. Upgraded bloc-them  and route-them libs

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