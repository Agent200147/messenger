import { useEffect } from "react";
import { setLastOnline } from "@/utils/ClientServices";
import {useDispatch} from "react-redux";
import {disconnectSocket} from "@/store/slices/socket.slice";

export const useSetLastOnlineOnUnload = () => {
    const dispatch = useDispatch()
    const handleUnload = () => dispatch(disconnectSocket())
    useEffect(() => {
        // const handleUnload = async () => {
        //     await setLastOnline();
        // };

        window.addEventListener('beforeunload', handleUnload);
        // window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            // window.removeEventListener('unload', handleUnload);
        };
    }, []);
}
