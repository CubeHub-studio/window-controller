// Window Controller — Gandi IDE extension
// Browser pages cannot move/resize the browser's outer window or read its OS-level
// screen position. Those operations require a browser extension with permissions.
// This extension therefore exposes browser-safe state and optional controls.

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Window Controller must run unsandboxed.');
  }

  class WindowController {
    getInfo() {
      return {
        id: 'windowcontroller',
        name: 'Window Controller',
        color1: '#4C97FF',
        color2: '#3373CC',
        color3: '#2E5DA8',
        blocks: [
          { opcode:'windowWidth', blockType:Scratch.BlockType.REPORTER, text:'window width' },
          { opcode:'windowHeight', blockType:Scratch.BlockType.REPORTER, text:'window height' },
          { opcode:'screenWidth', blockType:Scratch.BlockType.REPORTER, text:'screen width' },
          { opcode:'screenHeight', blockType:Scratch.BlockType.REPORTER, text:'screen height' },
          { opcode:'devicePixelRatio', blockType:Scratch.BlockType.REPORTER, text:'device pixel ratio' },
          { opcode:'isFullscreen', blockType:Scratch.BlockType.BOOLEAN, text:'tab is fullscreen?' },
          { opcode:'fullscreenState', blockType:Scratch.BlockType.REPORTER, text:'fullscreen state' },
          { opcode:'innerX', blockType:Scratch.BlockType.REPORTER, text:'window X (viewport)' },
          { opcode:'innerY', blockType:Scratch.BlockType.REPORTER, text:'window Y (viewport)' },
          { opcode:'scrollX', blockType:Scratch.BlockType.REPORTER, text:'page scroll X' },
          { opcode:'scrollY', blockType:Scratch.BlockType.REPORTER, text:'page scroll Y' },
          { opcode:'requestFullscreen', blockType:Scratch.BlockType.COMMAND, text:'request fullscreen' },
          { opcode:'exitFullscreen', blockType:Scratch.BlockType.COMMAND, text:'exit fullscreen' },
          { opcode:'resizeViewport', blockType:Scratch.BlockType.COMMAND, text:'resize viewport to width [W] height [H]',
            arguments:{W:{type:Scratch.ArgumentType.NUMBER,defaultValue:800},H:{type:Scratch.ArgumentType.NUMBER,defaultValue:600}} }
        ]
      };
    }

    windowWidth() { return window.innerWidth; }
    windowHeight() { return window.innerHeight; }
    screenWidth() { return window.screen.availWidth || window.screen.width; }
    screenHeight() { return window.screen.availHeight || window.screen.height; }
    devicePixelRatio() { return window.devicePixelRatio; }
    isFullscreen() { return !!document.fullscreenElement; }
    fullscreenState() { return document.fullscreenElement ? 'fullscreen' : 'windowed'; }
    // Browsers intentionally do not expose the outer browser-window screen coordinates
    // to normal web pages. These return the viewport's origin, which is always (0, 0).
    innerX() { return 0; }
    innerY() { return 0; }
    scrollX() { return window.scrollX; }
    scrollY() { return window.scrollY; }

    requestFullscreen() {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    }

    exitFullscreen() {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    resizeViewport(args) {
      // A normal page cannot resize its outer browser window. We can only attempt
      // window.resizeTo(), which browsers generally ignore for tabs.
      const w = Math.max(1, Number(args.W) || 800);
      const h = Math.max(1, Number(args.H) || 600);
      try { window.resizeTo(w, h); } catch (_) {}
    }
  }

  Scratch.extensions.register(new WindowController());
})(Scratch);
