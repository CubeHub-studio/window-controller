// Window Controller — Gandi IDE extension
// Requires the WindowAPI Chrome extension in the WindowAPI/ folder.
// The Gandi extension and Chrome extension use the same message schema:
// { source: "cubehub-window-controller", type, requestId, ... }

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Window Controller must run unsandboxed.');
  }

  const SOURCE = 'cubehub-window-controller';
  let requestCounter = 0;
  let apiReady = false;
  const pending = new Map();

  window.addEventListener('message', event => {
    if (event.source !== window) return;
    const message = event.data;
    if (!message || message.source !== SOURCE) return;

    if (message.type === 'ready') {
      apiReady = true;
      return;
    }

    if (message.type === 'response' && message.requestId) {
      const request = pending.get(message.requestId);
      if (!request) return;
      pending.delete(message.requestId);
      clearTimeout(request.timeout);
      request.resolve(message.data);
    }
  });

  class WindowController {
    getInfo() {
      return {
        id: 'windowcontroller',
        name: 'Window Controller',
        color1: '#4C97FF',
        color2: '#3373CC',
        color3: '#2E5DA8',
        blocks: [
          { opcode:'apiAvailable', blockType:Scratch.BlockType.BOOLEAN, text:'Window API available?' },
          { opcode:'gandiTabFocused', blockType:Scratch.BlockType.BOOLEAN, text:'Gandi tab focused?' },
          { opcode:'gandiTabActive', blockType:Scratch.BlockType.BOOLEAN, text:'Gandi tab active?' },

          { opcode:'windowX', blockType:Scratch.BlockType.REPORTER, text:'window X' },
          { opcode:'windowY', blockType:Scratch.BlockType.REPORTER, text:'window Y' },
          { opcode:'windowWidth', blockType:Scratch.BlockType.REPORTER, text:'window width' },
          { opcode:'windowHeight', blockType:Scratch.BlockType.REPORTER, text:'window height' },
          { opcode:'windowState', blockType:Scratch.BlockType.REPORTER, text:'window state' },
          { opcode:'windowFocused', blockType:Scratch.BlockType.BOOLEAN, text:'window focused?' },
          { opcode:'windowType', blockType:Scratch.BlockType.REPORTER, text:'window type' },
          { opcode:'gandiTabURL', blockType:Scratch.BlockType.REPORTER, text:'Gandi tab URL' },
          { opcode:'gandiTabTitle', blockType:Scratch.BlockType.REPORTER, text:'Gandi tab title' },

          { opcode:'tabFullscreen', blockType:Scratch.BlockType.BOOLEAN, text:'tab fullscreen?' },
          { opcode:'pageFullscreenState', blockType:Scratch.BlockType.REPORTER, text:'tab fullscreen state' },

          { opcode:'screenWidth', blockType:Scratch.BlockType.REPORTER, text:'screen width' },
          { opcode:'screenHeight', blockType:Scratch.BlockType.REPORTER, text:'screen height' },
          { opcode:'devicePixelRatio', blockType:Scratch.BlockType.REPORTER, text:'device pixel ratio' },
          { opcode:'scrollX', blockType:Scratch.BlockType.REPORTER, text:'page scroll X' },
          { opcode:'scrollY', blockType:Scratch.BlockType.REPORTER, text:'page scroll Y' },

          {
            opcode:'newTab',
            blockType:Scratch.BlockType.COMMAND,
            text:'open new tab [URL]',
            arguments:{URL:{type:Scratch.ArgumentType.STRING,defaultValue:'https://www.google.com/'}}
          },

          {
            opcode:'moveWindow',
            blockType:Scratch.BlockType.COMMAND,
            text:'move window to X [X] Y [Y]',
            arguments:{
              X:{type:Scratch.ArgumentType.NUMBER,defaultValue:0},
              Y:{type:Scratch.ArgumentType.NUMBER,defaultValue:0}
            }
          },
          {
            opcode:'resizeWindow',
            blockType:Scratch.BlockType.COMMAND,
            text:'resize window to width [W] height [H]',
            arguments:{
              W:{type:Scratch.ArgumentType.NUMBER,defaultValue:800},
              H:{type:Scratch.ArgumentType.NUMBER,defaultValue:600}
            }
          },
          {
            opcode:'setWindowState',
            blockType:Scratch.BlockType.COMMAND,
            text:'set window state [STATE]',
            arguments:{
              STATE:{
                type:Scratch.ArgumentType.STRING,
                menu:'windowStates',
                defaultValue:'normal'
              }
            }
          }
        ],
        menus: {
          windowStates: {
            acceptReporters: true,
            items: ['normal','maximized','minimized','fullscreen']
          }
        }
      };
    }

    apiAvailable() {
      return apiReady;
    }

    async request(type, extra = {}) {
      const requestId = 'window-controller-' + (++requestCounter);
      return new Promise(resolve => {
        const timeout = setTimeout(() => {
          pending.delete(requestId);
          resolve({ok:false,error:'Window API unavailable or timed out.'});
        }, 1000);

        pending.set(requestId, {resolve, timeout});
        window.postMessage({
          source: SOURCE,
          type,
          requestId,
          ...extra
        }, '*');
      });
    }

    async getWindow() {
      return this.request('getWindow');
    }

    async getTab() {
      return this.request('getTab');
    }

    async gandiTabFocused() {
      const result = await this.getTab();
      return !!result.ok && !!result.focused;
    }

    async gandiTabActive() {
      const result = await this.getTab();
      return !!result.ok && !!result.active;
    }

    async gandiTabURL() {
      const result = await this.getTab();
      return result.ok ? (result.url || '') : '';
    }

    async gandiTabTitle() {
      const result = await this.getTab();
      return result.ok ? (result.title || '') : '';
    }

    async windowX() {
      const result = await this.getWindow();
      return result.ok ? result.left : 0;
    }

    async windowY() {
      const result = await this.getWindow();
      return result.ok ? result.top : 0;
    }

    async windowWidth() {
      const result = await this.getWindow();
      return result.ok ? result.width : window.innerWidth;
    }

    async windowHeight() {
      const result = await this.getWindow();
      return result.ok ? result.height : window.innerHeight;
    }

    async windowState() {
      const result = await this.getWindow();
      return result.ok ? result.state : 'unknown';
    }

    async windowFocused() {
      const result = await this.getWindow();
      return !!result.ok && !!result.focused;
    }

    async windowType() {
      const result = await this.getWindow();
      return result.ok ? result.type : 'unknown';
    }

    tabFullscreen() {
      return !!document.fullscreenElement;
    }

    pageFullscreenState() {
      return document.fullscreenElement ? 'fullscreen' : 'windowed';
    }

    screenWidth() {
      return window.screen.availWidth || window.screen.width;
    }

    screenHeight() {
      return window.screen.availHeight || window.screen.height;
    }

    devicePixelRatio() {
      return window.devicePixelRatio;
    }

    scrollX() {
      return window.scrollX;
    }

    scrollY() {
      return window.scrollY;
    }

    async newTab(args) {
      await this.request('newTab', {url: String(args.URL || '')});
    }

    async moveWindow(args) {
      await this.request('updateWindow', {
        left: Number(args.X) || 0,
        top: Number(args.Y) || 0
      });
    }

    async resizeWindow(args) {
      await this.request('updateWindow', {
        width: Math.max(1, Number(args.W) || 800),
        height: Math.max(1, Number(args.H) || 600)
      });
    }

    async setWindowState(args) {
      const state = String(args.STATE);
      if (['normal','maximized','minimized','fullscreen'].includes(state)) {
        await this.request('updateWindow', {state});
      }
    }
  }

  Scratch.extensions.register(new WindowController());
})(Scratch);
