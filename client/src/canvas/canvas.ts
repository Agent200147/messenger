export interface ICanvas {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D | null,
    draw: (x: number, y: number, color?: string) => void
    drawImage: (image: HTMLImageElement | HTMLCanvasElement) => void
    beginPath: () => void,
    getCanvas: () => HTMLCanvasElement
    clear: () => void,
    toDataURL: () => string,
    changeColorToRed: () => void
}

type CanvasOptions = {
    canvas?: HTMLCanvasElement,
    width: number, 
    height: number, 
    color?: string,
}

class Canvas implements ICanvas {
    public canvas: HTMLCanvasElement
    public ctx: CanvasRenderingContext2D | null

    constructor({
        canvas,
        width,
        height,
        color
    }: CanvasOptions) {
        this.canvas = canvas || document.createElement('canvas')
        this.canvas.width = width
        this.canvas.height = height
        this.ctx = this.canvas.getContext('2d')
        if (!this.ctx) return
        if (color) this.ctx.strokeStyle = color
    }

    getCanvas = () => {
        return this.canvas;
    }

    getContext = () => {
        return this.ctx
    }

    draw = (x: number, y: number, color?: string) => {
        if (!this.ctx) return
        if(color) this.ctx.strokeStyle = color
        this.ctx.lineWidth = 4
        this.ctx.lineTo(x, y)
        this.ctx.stroke()
    }

    drawImage = (image: HTMLImageElement | HTMLCanvasElement) => {
        if (!this.ctx) return
        this.ctx.drawImage(image, 0, 0)
    }

    beginPath = () => {
        if (!this.ctx) return
        this.ctx.beginPath()
    }

    clear = () => {
        if (!this.ctx) return
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    toDataURL = () => {
        return this.canvas.toDataURL()
    }

    changeColorToRed = () => {
        if(!this.ctx) return
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                data[i] = 255
                data[i + 1] = 0
                data[i + 2] = 0
            }
        }
        this.ctx.putImageData(imageData, 0, 0)
    }
}

export default Canvas
