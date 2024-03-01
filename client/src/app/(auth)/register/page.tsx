import styles  from '@/app/(auth)/auth.module.css'
import RegisterForm from "@/components/Forms/Register/Register";

const Register = () => {
    return (
        <div className={styles.wrapper}>
            <RegisterForm/>
        </div>
    );
};

export default Register;