'use client';

import styles from './news.module.css'
import {useEffect, useLayoutEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    selectCurrentChat,
    selectRecipientCanvas,
    drawToRecipient,
    selectIsDrawingRecipient,
    endDrawToRecipient,
} from "@/store/slices/chatSlice";
import {useSetCanvasImageMutation} from "@/api/chats/chatsApi";
import {selectUser} from "@/store/slices/authSlice";
import {toast, ToastContainer} from "react-toastify";
import CustomToast from "@/components/CustomToast/CustomToast";
import SocketFactory from "@/socket/socket";
import {SocketEmitEvent, SocketOnEvent} from "@/store/middleware/socket.middleware";

const throttle = (callback: (...args: any[]) => void, delay: number) => {
    let lastCall = 0;

    return function(...args: any[]) {
        const now = new Date().getTime()

        if (now - lastCall < delay) {
            return
        }

        lastCall = now
        callback(...args)
    }
}

const News = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dispatch = useDispatch()
    const recipientCanvas = useSelector(selectRecipientCanvas)
    const isDrawingRecipient = useSelector(selectIsDrawingRecipient)
    const user = useSelector(selectUser)
    const currentChat = useSelector(selectCurrentChat)
    const recipientId = currentChat?.recipientInfo.user.id
    const recipientCanvasHistoryRef = useRef<{x: number, y: number}[]>([])
    const [setCanvasImage] = useSetCanvasImageMutation()
    const socket = SocketFactory.create()


    const draw = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        if(!recipientId) return
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    const beginPath = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath()
    }

    useEffect(() => {
        if (!canvasRef.current || !user || !currentChat) return

        const canvas = canvasRef.current
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (!currentChat) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            return
        }


        if(currentChat?.canvasImage) {
            const image = new Image()
            image.onload = function() {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

            }
            image.crossOrigin="anonymous"
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            image.src = `${process.env.SERVER_URL}/canvas/${currentChat.canvasImage}?v=${uniqueSuffix}`
        }
        if(currentChat?.recipientInfo.canvasImage) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if(!tempCtx) return

            const image = new Image()
            image.onload = function() {
                tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height)

                const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                        data[i] = 255
                        data[i + 1] = 0
                        data[i + 2] = 0
                    }
                }

                tempCtx.putImageData(imageData, 0, 0)
                ctx.drawImage(tempCanvas, 0, 0);
            }
            image.crossOrigin="anonymous"
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            image.src = `${process.env.SERVER_URL}/canvas/${currentChat?.recipientInfo.canvasImage}?v=${uniqueSuffix}`
        }

        let isDrawing = false

        ctx.lineWidth = 5


        const throttledDispatch = throttle((x, y) => {
            dispatch(drawToRecipient({ chatId: currentChat.chatId, recipientId, x, y }))
        }, 50)

        const drawHandler = (e: MouseEvent) => {
            if (!isDrawing) return

            ctx.strokeStyle = 'black'
            draw(ctx, e.offsetX, e.offsetY)
            throttledDispatch(e.offsetX, e.offsetY)
        }

        const finishDrawingHandler = async () => {
            if(!currentChat) return
            if(isDrawing) {
                isDrawing = false

                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = canvas.width
                tempCanvas.height = canvas.height
                const tempCtx = tempCanvas.getContext('2d')
                if(!tempCtx) return

                tempCtx.drawImage(canvas, 0, 0)

                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
                        data[i + 3] = 0
                    }
                }

                tempCtx.putImageData(imageData, 0, 0)

                const blackLinesImageData = tempCanvas.toDataURL()

                try {
                    await setCanvasImage({ image: blackLinesImageData, chatId: currentChat?.chatId }).unwrap()
                    dispatch(endDrawToRecipient({chatId: currentChat.chatId, recipientId}))
                } catch (error) {
                    toast.error(<CustomToast text={'Ошибка при загрузке изображения'} />)
                }
            }
        }

        canvas.addEventListener('mousedown', (e: MouseEvent) => {
            isDrawing = true
            ctx.beginPath()

        })
        canvas.addEventListener('mousemove', drawHandler)
        canvas.addEventListener('mouseup', finishDrawingHandler)
        canvas.addEventListener('mouseleave', finishDrawingHandler)
        return () => {
            canvas.removeEventListener('mousedown', () => isDrawing = true)
            canvas.removeEventListener('mousemove', drawHandler)
            canvas.removeEventListener('mouseup', finishDrawingHandler)
            canvas.removeEventListener('mouseleave', finishDrawingHandler)
        }
    }, [currentChat?.chatId])

    useEffect(() => {
        console.log('isDrawingRecipient:', isDrawingRecipient)
        if(!isDrawingRecipient) return
        const canvas = canvasRef.current
        if(!canvas || !recipientCanvas) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return

        beginPath(ctx)
    }, [isDrawingRecipient])

    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas || !recipientCanvas || !currentChat) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return
        ctx.strokeStyle = 'red'

        draw(ctx, recipientCanvas.x, recipientCanvas.y)
        recipientCanvasHistoryRef.current?.push({x: recipientCanvas.x, y: recipientCanvas.y})
    }, [currentChat, recipientCanvas])

    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas || ! currentChat) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return

        socket.socket.on(SocketOnEvent.GetClearCanvasToRecipient, (chatId) => {
            if(chatId !== currentChat.chatId) return

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
                    data[i + 3] = 0
                }
            }

            ctx.putImageData(imageData, 0, 0)
        })

        return () => {
            socket.socket.off(SocketOnEvent.GetClearCanvasToRecipient)
        }

    }, [canvasRef, currentChat])

    const clearHandler = async () => {
        const canvas = canvasRef.current
        if(!canvas || ! currentChat) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return

        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height

        const emptyImageData = tempCanvas.toDataURL()
        try {
            await setCanvasImage({ image: emptyImageData, chatId: currentChat?.chatId }).unwrap()
        } catch (error) {
            toast.error(<CustomToast text={'Ошибка при очистке изображения'} />)

            return
        }

        // dispatch(clearRecipientCanvas(recipientId))
        socket.socket.emit(SocketEmitEvent.ClearCanvasToRecipient, {chatId: currentChat?.chatId, recipientId})
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                data[i + 3] = 0
            }
        }
        ctx.putImageData(imageData, 0, 0)
    }

    return (
        <div className={styles.newsWrapper}>
            <ToastContainer/>

            <button onClick={clearHandler} style={{fontSize: 24, background: 'var(--main-color)'}}>Clear</button>
            <canvas ref={canvasRef} className={styles.canvas}>

            </canvas>
        </div>
    )
}

export default News;