import styles from './server-error.module.css'
import ServerErrorSvg from "@/components/SvgComponents/serverError.svg";
import ErrorComponent from "@/components/ErrorComponent/ErrorComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Ошибка",
}

const Page = () => {
    return <ErrorComponent/>
}

export default Page