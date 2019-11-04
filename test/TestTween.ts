import vfui from "../src/pixi-vfui";

export default class TestTween {

    public constructor(app: PIXI.Application, uiStage: vfui.Stage) {
        this.onLoad(app,uiStage)
    }

    private onLoad(app: PIXI.Application, uiStage: vfui.Stage) {

        let root = new vfui.Container();
        root.style.backgroundColor = 0x136086;
        root.style.height = 10;
        root.style.width = 100;
        root.style.bottom = 0;
        root.style.left = "50%";
        root.style.pivotX = 5;
        root.style.pivotY = 5;
        root.style.rotation = -95;
        uiStage.addChild(root);

        new vfui.Tween(root.style).to({rotation:-85},2000)
        .repeat(Infinity)
        .easing(vfui.Easing.Linear.None)
        .yoyo(true)
        .start(0);


        let rootNode = new Node(undefined,root);
        this.createBiTree(rootNode,0);
    }


    protected createBiTree(node:Node, layer:number) {
        if(layer>7){
            return;
        }
        node.leftChild = new Node(node);
        node.leftChild.isLeft = true;
        node.leftChild.div.style.rotation = 35;
        this.createBiTree(node.leftChild, ++layer);
        node.rightChild = new Node(node);
        node.rightChild.div.style.rotation = -35;
        this.createBiTree(node.rightChild, layer);
    }


}


class Node {
    public constructor(parent?: Node,root?:vfui.Container) {
        let div = this.div;
        div.style.backgroundColor = 0x4caf50;
        div.style.height = 10;
        div.style.width = 100;
        div.style.left = 100;
        div.style.top = 0;
        div.style.pivotX = 5;
        div.style.pivotY = 5;
        div.style.scaleX = 0.9;
        div.style.scaleY = 0.9;

        new vfui.Tween(div.style).to({rotation:0,scaleX:0.1,scaleY:0.1},7000)
        .repeat(Infinity)
        .easing(vfui.Easing.Linear.None)
        .yoyo(true)
        .start().delay(2000);

        new vfui.Tween({ color: "#4caf50"})
        .to({ color: "#136086" }, 7000)
        .repeat(Infinity)
        .easing(vfui.Easing.Quadratic.InOut)
        .yoyo(true)
        .on(vfui.Tween.Event.update, (obj: any) => {
            if (obj.color.indexOf("-") === -1) {
                div.style.backgroundColor = vfui.Utils.rgbStrToNumber(obj.color);
            }
        })
        .start();

        if(root){
            root.addChild(div);
        }else{
            this.parent = parent;
            parent.div.addChild(div);
        }
        
    }

    public div = new vfui.Container();
    public parent:Node;
    public isLeft = false;
    public leftChild:Node = null;
    public rightChild:Node = null;
}
