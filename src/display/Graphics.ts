import { DisplayObject } from "../core/DisplayObject";


/**
 * 矢量绘制
 * 
 * @example let graphics = new gui.Graphics();
 * 
 * @namespace gui
 * 
 * @link https://vipkid-edu.github.io/vf-gui/play/#example/TestTimeLine
 */
export class Graphics extends DisplayObject {

    public constructor(geometry?: PIXI.GraphicsGeometry | undefined) {
        super();
        this.graphics = new PIXI.Graphics(geometry);
        this.container.addChild(this.graphics);
    }

    public readonly graphics: PIXI.Graphics;

}