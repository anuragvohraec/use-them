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

### **Scaffold**
```ts
<ut-scaffold>
    <animated-grad-bg slot="appbar-bg" use="gradients: #ee7752, #e73c7e, #23a6d5, #23d5ab"></animated-grad-bg>
    <div slot="title"><ut-h1 use="color: white">hello</ut-h1></div>
    <div slot="body" style="height: 100%">
    This is body.
    </div>
</ut-scaffold>
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
