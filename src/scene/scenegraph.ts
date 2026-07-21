import { Page } from 'puppeteer-core';
import { SceneNode } from '../types.js';

/**
 * Evaluates the page in the browser context and builds a unified Render Scene Graph.
 */
export async function buildSceneGraph(page: Page): Promise<SceneNode> {
  const rootNode = await page.evaluate(() => {
    let idCounter = 1;

    function getUniqueSelector(el: Element): string {
      if (el.id) {
        return `#${el.id}`;
      }
      if (el === document.body) {
        return 'body';
      }
      const parent = el.parentElement;
      if (!parent) {
        return el.tagName.toLowerCase();
      }
      const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
      const index = siblings.indexOf(el) + 1;
      const tag = el.tagName.toLowerCase();
      return siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag;
    }

    function extractNode(el: Element): any {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      // Omit non-visible elements
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
        return null;
      }

      const viewportArea = window.innerWidth * window.innerHeight;
      const elementArea = rect.width * rect.height;
      const visualWeight = parseFloat((elementArea / viewportArea).toFixed(4));

      let typography;
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON', 'LABEL'].includes(el.tagName)) {
        typography = {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: style.color,
          fontFamily: style.fontFamily
        };
      }

      // Check dataset for source map location annotations
      let sourceLocation;
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset) {
        const file = htmlEl.dataset.sourceFile || htmlEl.dataset.file;
        const line = htmlEl.dataset.sourceLine || htmlEl.dataset.line;
        if (file) {
          sourceLocation = {
            file,
            line: line ? parseInt(line, 10) : 1
          };
        }
      }

      const children: any[] = [];
      for (const child of Array.from(el.children)) {
        const childNode = extractNode(child);
        if (childNode) {
          children.push(childNode);
        }
      }

      return {
        id: `node-${idCounter++}`,
        tagName: el.tagName.toLowerCase(),
        selector: getUniqueSelector(el),
        sourceLocation,
        boundingBox: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        visualWeight,
        typography,
        computedStyle: {
          display: style.display,
          position: style.position,
          backgroundColor: style.backgroundColor,
          margin: style.margin,
          padding: style.padding,
          borderRadius: style.borderRadius
        },
        children
      };
    }

    return extractNode(document.body);
  });

  return rootNode as SceneNode;
}
