'use client';

import styles from './news.module.css'
import {useEffect, useLayoutEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    selectCurrentChat,
    selectRecipientCanvas,
    drawToRecipient,
    selectIsDrawingRecipient, endDrawToRecipient
} from "@/store/slices/chatSlice";

const throttle = (callback, delay) => {
    let lastCall = 0;

    return function(...args) {
        const now = new Date().getTime();

        if (now - lastCall < delay) {
            return;
        }

        lastCall = now;
        callback(...args);
    }
}

const News = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dispatch = useDispatch()
    const recipientCanvas = useSelector(selectRecipientCanvas)
    const isDrawingRecipient = useSelector(selectIsDrawingRecipient)

    const currentChat = useSelector(selectCurrentChat)
    const recipientId = currentChat?.recipientInfo.user.id
    // console.log('recipientId', recipientId)
    const draw = (ctx, x, y) => {
        if(!recipientId) return
        // ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        // lastX = x
        // lastY = y
    }

    const beginPath = (ctx) => {
        ctx.beginPath()
    }

    const closePath = (ctx) => {
        ctx.closePath()
    }

    useEffect(() => {
        console.log('useEffect')
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        const ctx = canvas.getContext('2d')
        const ctx2 = canvas.getContext('2d')
        if (!ctx) return
        let isDrawing = false
        let lastX = 0
        let lastY = 0;
        // ctx.strokeStyle = 'whitesmoke'

        ctx.lineWidth = 5


        const throttledDispatch = throttle((x, y) => {
            dispatch(drawToRecipient({ recipientId, x, y }))
        }, 50)

        const drawHandler = (e: MouseEvent) => {
            if (!isDrawing) return
            ctx.strokeStyle = 'black'
            draw(ctx, e.offsetX, e.offsetY)
            // dispatch(drawToRecipient({recipientId, x: e.offsetX, y: e.offsetY}))
            throttledDispatch(e.offsetX, e.offsetY)
        };

        canvas.addEventListener('mousedown', (e: MouseEvent) => {
            ctx2.beginPath()
            isDrawing = true;

            // lastX = e.offsetX;
            // lastY = e.offsetY;
        });

        canvas.addEventListener('mousemove', drawHandler);

        canvas.addEventListener('mouseup', () => {
            // closePath(ctx)
            isDrawing = false;
            dispatch(endDrawToRecipient(recipientId))
        });

        // canvas.addEventListener('mouseout', () => {
        //     ctx.closePath()
        //     isDrawing = false;
        // });

        canvas.addEventListener('mouseleave', () => {
            // closePath(ctx)
            isDrawing = false;
            dispatch(endDrawToRecipient(recipientId))
        })

        return () => {
            canvas.removeEventListener('mousedown', () => isDrawing = true);
            canvas.removeEventListener('mousemove', drawHandler);
            canvas.removeEventListener('mouseup', () => isDrawing = false);
            canvas.removeEventListener('mouseout', () => isDrawing = false);
        }
    }, [recipientId])

    useEffect(() => {
        if(!isDrawingRecipient) return
        const canvas = canvasRef.current
        if(!canvas || !recipientCanvas) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return

        beginPath(ctx)
    }, [isDrawingRecipient])

    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas || !recipientCanvas) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return
        ctx.strokeStyle = 'red'
        // if(isDrawingRecipient) beginPath(ctx)
        // else {
        //     closePath(ctx)
        //     return
        // }

        // if(!isDrawingRecipient) {
        //     closePath(ctx)
        //     return
        // }
        draw(ctx, recipientCanvas.x, recipientCanvas.y)
    }, [recipientCanvas])



    return (
        <div className={styles.newsWrapper}>
            <canvas ref={canvasRef} className={styles.canvas}>

            </canvas>
        </div>

    );
};

export default News;