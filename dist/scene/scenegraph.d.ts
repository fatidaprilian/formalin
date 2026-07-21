import { Page } from 'puppeteer-core';
import { SceneNode } from '../types.js';
/**
 * Evaluates the page in the browser context and builds a unified Render Scene Graph.
 */
export declare function buildSceneGraph(page: Page): Promise<SceneNode>;
