/**
 * The CursorPointer class
 */
import { appendDivTo } from './utils/functions.js';
;
export class CursorPointer {
    constructor(div, editorView) {
        // Root element in which verovio-ui is created
        this.element = div;
        // EditorView object
        this.editorView = editorView;
        this.lines = appendDivTo(this.element, { class: `vrv-cursor-lines` });
        this.pointer = appendDivTo(this.element, { class: `vrv-cursor-pointer` });
        this.activated = false;
        this.inputMode = false;
        this.pixPerPix = 0;
        this.viewTop = 0;
        this.viewLeft = 0;
        this.lastEvent = null;
        this.scrollTop = 0;
        this.scrollLeft = 0;
        this.elementClass = '';
        this.elementId = '';
        this.elementType = '';
        this.elementNode = null;
        this.staffNode = null;
        this.elementX = 0;
        this.elementY = 0;
        this.selectedItems = [];
        this.initX = 0;
        this.initY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.fixedX = true;
        this.fixedY = false;
        this.forceOnPitch = true;
        this.cursorImageHeight = 68;
        this.cursorImageWidth = 90;
        this.ledgerLineImageWidth = 106;
        this.currentHeight = this.cursorImageHeight;
        this.currentWidth = this.cursorImageWidth;
        this.currentLedgerlineWidth = this.ledgerLineImageWidth;
        this.marginLeft = 0;
        this.marginTop = 0;
        this.MEIunit = 90;
        this.lastPitchLine = null;
        this.topLine = null;
        this.bottomLine = null;
    }
    xToMEI(x) {
        return Math.round(x - this.viewLeft + this.scrollLeft) * this.pixPerPix - this.marginLeft;
    }
    yToMEI(y) {
        return Math.round((y - this.viewTop + this.scrollTop) * this.pixPerPix - this.marginTop);
    }
    xToView(x) {
        return (x + this.marginLeft) / this.pixPerPix - this.scrollLeft + this.viewLeft;
    }
    yToView(y) {
        return (y + this.marginTop) / this.pixPerPix - this.scrollTop + this.viewTop;
    }
    init(svgRoot, top, left) {
        const svgViewBox = svgRoot.querySelector('svg');
        const actualSizeArr = svgViewBox.getAttribute('viewBox').split(' ');
        const actualHeight = parseInt(actualSizeArr[3]);
        const svgHeight = parseInt(svgRoot.getAttribute('height'));
        // get the margins
        this.marginLeft = 0;
        this.marginTop = 0;
        try {
            const g = svgViewBox.querySelector('g.page-margin');
            const transform = g.getAttribute('transform');
            const regexp = /translate\((\d*),\ (\d*)/g;
            const match = regexp.exec(transform);
            this.marginLeft = Number(match[1]);
            this.marginTop = Number(match[2]);
        }
        catch (err) {
            console.debug("Loading margin failed");
        }
        this.pixPerPix = (actualHeight / svgHeight);
        this.viewTop = top;
        this.viewLeft = left;
    }
    initEvent(event, id, node) {
        this.selectedItems = [];
        this.add(id, node);
        if (this.selectedItems.length === 0) {
            return;
        }
        this.activated = true;
        this.initX = this.xToMEI(event.pageX);
        this.initY = this.yToMEI(event.pageY);
        this.lastPitchLine = null;
        this.initStaff(node);
        const scale = 2 * this.MEIunit / this.cursorImageHeight;
        this.currentHeight = this.cursorImageHeight * scale;
        this.currentWidth = this.cursorImageWidth * scale;
        this.currentLedgerlineWidth = this.ledgerLineImageWidth * scale;
        this.pointer.style.height = `${this.currentHeight / this.pixPerPix}px`;
        this.pointer.style.width = `${this.currentWidth / this.pixPerPix}px`;
        this.pointer.style.backgroundSize = `${this.currentWidth / this.pixPerPix}px ${this.currentHeight / this.pixPerPix}px`;
        this.lines.style.height = `${this.currentHeight / this.pixPerPix}px`;
        this.lines.style.width = `${this.currentLedgerlineWidth / this.pixPerPix}px`;
        this.lines.style.backgroundSize = `${this.currentLedgerlineWidth / this.pixPerPix}px ${this.currentHeight / this.pixPerPix}px`;
    }
    initStaff(node) {
        this.staffNode = this.editorView.getClosestMEIElement(node, "staff");
        if (!this.staffNode)
            return;
        let staffLines = this.staffNode.querySelectorAll('g.staff > path');
        if (staffLines.length === 0)
            return;
        this.topLine = null;
        this.bottomLine = null;
        try {
            const d1 = staffLines[0].getAttribute('d');
            const regexp1 = /M\d*\ (\d*)/g;
            const match1 = regexp1.exec(d1);
            this.topLine = Number(match1[1]);
            const d2 = staffLines[staffLines.length - 1].getAttribute('d');
            const regexp2 = /M\d*\ (\d*)/g;
            const match2 = regexp2.exec(d2);
            this.bottomLine = Number(match2[1]);
            if (staffLines.length > 1) {
                this.MEIunit = (this.bottomLine - this.topLine) / (staffLines.length - 1) / 2;
            }
        }
        catch (err) {
            console.debug("Loading staff line position failed");
        }
    }
    add(id, node, clicked = true) {
        let positionNode = node;
        if (node.classList.contains('note') || node.classList.contains('rest')) {
            positionNode = node.querySelector('use');
        }
        if (!positionNode) {
            console.debug("Cannot find node with dragging position");
            return;
        }
        let item = {
            elementType: node.classList[0],
            elementNode: node,
            elementId: id,
            elementX: parseInt(positionNode.getAttribute('x')),
            elementY: parseInt(positionNode.getAttribute('y'))
        };
        this.selectedItems.push(item);
        this.inputMode = false;
        if (!clicked)
            return;
        this.elementId = item.elementId;
        this.elementNode = item.elementNode;
        this.elementType = item.elementType;
        this.elementX = item.elementX;
        this.elementY = item.elementY;
        //this.initX = this.xToMEI( event.pageX );
        //this.initY = this.yToMEI( event.pageY );
        let children = node.querySelectorAll('g:not(.bounding-box):not(.ledgerLines):not(.articPart):not(.notehead):not(.dots):not(.flag):not(.stem)');
        for (let child of children) {
            const element = child;
            const childId = element.getAttribute(id);
            this.add(childId, element, false);
        }
        //console.debug( this.selectedItems );
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    moveToLastEvent(display = true) {
        this.currentX = this.xToMEI(this.lastEvent.pageX);
        this.currentY = this.yToMEI(this.lastEvent.pageY);
        if (this.forceOnPitch && this.topLine) {
            this.currentY = this.currentY - ((this.currentY - this.topLine) % this.MEIunit);
            this.lastPitchLine = this.currentY;
        }
        if (this.fixedX) {
            if ((this.currentX < this.initX - this.currentWidth * 1.0) || (this.currentX > this.initX + this.currentWidth * 1.0)) {
                this.hide();
                return;
            }
            this.currentX = this.elementX;
        }
        else if (this.fixedY) {
            if ((this.currentY < this.initY - this.currentHeight * 1.0) || (this.currentY > this.initY + this.currentHeight * 1.0)) {
                this.hide();
                return;
            }
            this.currentY = this.elementY;
        }
        //const topLineToCurrentY = this.topLine - this.currentY;
        //const bottomLineToCurrentY = this.bottomLine - this.currentY;
        if (display)
            this.update();
    }
    update() {
        this.inputMode = false;
        if (!this.activated)
            return;
        if (this.elementNode !== this.selectedItems[0].elementNode)
            return;
        if (!["note", "rest", "chord"].includes(this.elementType))
            return;
        return;
        /*
        this.inputMode = true;

        this.element.style.display = 'block';
        this.element.style.left = `${ this.xToView( this.elementX ) - this.viewLeft }px`;
        this.element.style.top = `${ this.yToView( this.elementY ) - this.viewTop }px`;

        let currentToElementX = this.currentX - this.elementX;
        let currentToElementY = this.currentY - this.elementY;
        if ( !this.fixedX )
        {
            currentToElementX -= this.currentWidth / 2;
        }
        else if ( !this.fixedY )
        {
            currentToElementY -= this.currentHeight / 2;
        }
        this.pointer.style.left = `${ currentToElementX / this.pixPerPix }px`;
        this.pointer.style.top = `${ currentToElementY / this.pixPerPix }px`;

        this.lines.classList.toggle( "top", false );
        this.lines.classList.toggle( "bottom", false );

        if ( !this.topLine || !this.bottomLine ) return;

        const ledgerX = - ( this.currentLedgerlineWidth - this.currentWidth ) / 2;
        this.lines.style.left = `${ ledgerX / this.pixPerPix }px`;

        const topLineToElementY = this.topLine - this.elementY;
        const topLineToCurrentY = this.topLine - this.currentY;

        const bottomLineToElementY = this.bottomLine - this.elementY;
        const bottomLineToCurrentY = this.bottomLine - this.currentY;

        //console.debug( bottomLineToElementY, bottomLineToCurrentY, this.bottomLine );
        //console.debug( topLineToElementY, topLineToCurrentY, this.topLine );

        if ( bottomLineToCurrentY < -this.MEIunit )
        {
            this.lines.style.bottom = ``;
            this.lines.style.top = `${ ( bottomLineToElementY + this.MEIunit ) / this.pixPerPix }px`;
            this.lines.style.height = `${ ( -bottomLineToCurrentY - Math.round( 0.25 * this.currentHeight ) ) / this.pixPerPix }px`;
            this.lines.classList.toggle( "bottom", true );

        }
        else if ( topLineToCurrentY > this.MEIunit )
        {
            this.lines.style.top = ``;
            this.lines.style.bottom = `${ ( -topLineToElementY + this.MEIunit ) / this.pixPerPix }px`;
            this.lines.style.height = `${ ( topLineToCurrentY - Math.round( 0.25 * this.currentHeight ) ) / this.pixPerPix }px`;
            this.lines.classList.toggle( "top", true );
        }
        */
    }
    staffEnter(staffNode) {
        if (!this.staffNode) {
            return;
        }
        else if (this.staffNode !== staffNode) {
            this.activated = false;
            this.hide();
        }
        else if (!this.activated) {
            this.activated = true;
            this.moveToLastEvent();
        }
    }
    hide() {
        //console.debug( "hide cursor" );
        this.inputMode = false;
        this.element.style.left = '-1000px';
        this.element.style.top = '-1000px';
        this.element.style.display = 'none';
    }
}
//# sourceMappingURL=cursor-pointer.js.map