import styles  from '@/app/(auth)/auth.module.css'

import LoginForm from "@/components/Forms/Login/Login";
const Login = () => {
    return (
        <div className={styles.wrapper}>
            <LoginForm/>
        </div>
    );
};

export default Login;