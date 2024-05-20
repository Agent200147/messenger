'use client';

import styles from './canvas.module.css'

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from 'next/navigation';

import { selectCurrentChat } from "@/store/slices/chat.slice";
import { useSetCanvasImageMutation } from "@/api/chats/chatsApi";
import {toast, ToastContainer} from "react-toastify";
import CustomToast from "@/components/CustomToast/CustomToast";
import SocketFactory from "@/socket/socket";
import ClearSvg from '../SvgComponents/Clear.svg';
import cn from 'classnames';
import Canvas, { ICanvas } from '@/canvas/canvas';
import {throttle} from "@/utils/throttle";
import {debounce} from "@/utils/debounce";

const CanvasComponent = () => {
    const params = useParams()

    const { slug: currentChatId } = params
    const canvasWrapperRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const commonCanvasRef = useRef<ICanvas>()

    const currentChat = useSelector(selectCurrentChat)

    const [updateCanvasFlag, setUpdateCanvasFlag] = useState(false)

    const recipientId = currentChat?.recipientInfo.user.id

    const myCanvasRef = useRef<ICanvas>()
    const recipientCanvasRef = useRef<ICanvas>()

    const [setCanvasImage] = useSetCanvasImageMutation()
    const { socket } = SocketFactory.create()

    useLayoutEffect(() => {
        if(!currentChatId) return
        const handleResize = () => {
            if (!canvasRef.current) {
                return
            }
            setUpdateCanvasFlag(prev => !prev)

            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight - 1
        }

        handleResize()

        const debounced = debounce(handleResize, 300)
        window.addEventListener('resize', debounced)
        return () => {
            window.removeEventListener('resize', debounced);
        }
    }, [currentChatId])

    useLayoutEffect(() => {
        if (!canvasRef.current) {
            return
        }

        commonCanvasRef.current = new Canvas({
            canvas: canvasRef.current,
            width: canvasRef.current.width,
            height: canvasRef.current.height,
            color: 'black'
        })

        if (!currentChat) {
            commonCanvasRef.current.clear()
            return
        }
        const canvasHtmlElement = canvasRef.current

        myCanvasRef.current = new Canvas({
            width: canvasHtmlElement.width,
            height: canvasHtmlElement.height,
            color: 'black'
        })
        recipientCanvasRef.current = new Canvas({
            width: canvasHtmlElement.width,
            height: canvasHtmlElement.height,
            color: 'red'
        })

        let isDrawing = false

        if(currentChat.canvasImage) {
            const image = new Image()
            image.onload = function() {
                commonCanvasRef.current?.drawImage(image)
                myCanvasRef.current?.drawImage(image)
            }
            image.crossOrigin="anonymous"
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            image.src = `${process.env.SERVER_URL}/canvas/${currentChat.canvasImage}?v=${uniqueSuffix}`
        }
        if(currentChat.recipientInfo.canvasImage) {
            const tempCanvas = new Canvas({
                width: canvasHtmlElement.width,
                height: canvasHtmlElement.height,
            })

            const image = new Image()
            image.onload = function() {
                tempCanvas.drawImage(image)
                tempCanvas.changeColorToRed()
                commonCanvasRef.current?.drawImage(tempCanvas.getCanvas())
                recipientCanvasRef.current?.drawImage(tempCanvas.getCanvas())
            }
            image.crossOrigin="anonymous"
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            image.src = `${process.env.SERVER_URL}/canvas/${currentChat.recipientInfo.canvasImage}?v=${uniqueSuffix}`

            }

        const throttledDispatch = throttle((x: number, y: number) => {
            if(recipientId) socket.emit('drawToRecipient', { chatId: currentChat.chatId, recipientId, x, y })
        }, 50)

        const drawHandler = (e: MouseEvent) => {
            if (!isDrawing) return

            commonCanvasRef.current?.draw(e.offsetX, e.offsetY, 'black')
            if(myCanvasRef.current) myCanvasRef.current.draw(e.offsetX, e.offsetY)
            throttledDispatch(e.offsetX, e.offsetY)
        }

        const finishDrawingHandler = async () => {
            if(!currentChat || !myCanvasRef.current) return
            if(isDrawing) {
                isDrawing = false

                const myCanvasImageData = myCanvasRef.current.toDataURL()
                try {
                    await setCanvasImage({ image: myCanvasImageData, chatId: currentChat?.chatId }).unwrap()
                    if(recipientId) socket.emit('endDrawToRecipient', { chatId: currentChat.chatId, recipientId })
                } catch (error) {
                    toast.error(<CustomToast text={'Ошибка при загрузке изображения'} />)
                }
            }
        }

        canvasHtmlElement.addEventListener('mousedown', (e: MouseEvent) => {
            isDrawing = true
            commonCanvasRef.current?.beginPath()
            myCanvasRef.current?.beginPath()
        })
        canvasHtmlElement.addEventListener('mousemove', drawHandler)
        canvasHtmlElement.addEventListener('mouseup', finishDrawingHandler)
        canvasHtmlElement.addEventListener('mouseleave', finishDrawingHandler)
        return () => {
            canvasHtmlElement.removeEventListener('mousedown', () => isDrawing = true)
            canvasHtmlElement.removeEventListener('mousemove', drawHandler)
            canvasHtmlElement.removeEventListener('mouseup', finishDrawingHandler)
            canvasHtmlElement.removeEventListener('mouseleave', finishDrawingHandler)
        }
    }, [currentChat?.chatId, canvasRef.current, updateCanvasFlag])

    useEffect(() => {
        if(!currentChat) return

        let isDrawing = false

        socket.on('getRecipientDraw', ({ chatId, x, y }) => {
            if(chatId !== currentChat.chatId) return

            if(!isDrawing) {
                commonCanvasRef.current?.beginPath()
                recipientCanvasRef.current?.beginPath()
            }
            isDrawing = true
            commonCanvasRef.current?.draw(x, y, 'red')
            recipientCanvasRef.current?.draw(x, y)
        })

        socket.on('getEndDrawToRecipient', (chatId) => {
            if(chatId !== currentChat.chatId) return
            isDrawing = false
        })

        socket.on('getClearRecipientCanvas', (chatId) => {
            if(chatId !== currentChat.chatId) return
            recipientCanvasRef.current?.clear()
            commonCanvasRef.current?.clear()
            if(myCanvasRef.current){
                commonCanvasRef.current?.drawImage(myCanvasRef.current.getCanvas())
            }
        })

        return () => {
            socket.off('getRecipientDraw')
            socket.off('getEndDrawToRecipient')
            socket.off('getClearRecipientCanvas')
        }
    }, [currentChat?.chatId])

    const clearHandler = async () => {
        if(!canvasRef.current || ! currentChat) return

        const canvasHtmlElement = canvasRef.current

        const tempCanvas = new Canvas({
            width: canvasHtmlElement.width,
            height: canvasHtmlElement.height,
        })

        const emptyImageData = tempCanvas.toDataURL()
        try {
            await setCanvasImage({ image: emptyImageData, chatId: currentChat?.chatId }).unwrap()
        } catch (error) {
            toast.error(<CustomToast text={'Ошибка при очистке изображения'} />)
            return
        }
        if(recipientId) socket.emit('clearCanvasToRecipient', { chatId: currentChat?.chatId, recipientId })

        commonCanvasRef.current?.clear()
        myCanvasRef.current?.clear()

        if(recipientCanvasRef.current) commonCanvasRef.current?.drawImage(recipientCanvasRef.current?.getCanvas());
    }

    return (
        <div ref={canvasWrapperRef} className={cn([styles.newsWrapper,!currentChatId && styles.closed])}>
            <button onClick={clearHandler} className={styles.clearBtnWrapper}>
                <ClearSvg/>
            </button>

            <canvas ref={canvasRef} className={styles.canvas}>

            </canvas>
        </div>
    )
}

export default CanvasComponent