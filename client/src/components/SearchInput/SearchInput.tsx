import styles from './searchInput.module.css'
import type {FC, InputHTMLAttributes} from "react";
import Image from "next/image";
import searchIcon from '@/public/search.svg'
import SearchSvg from "@/components/SvgComponents/SearchSvg";
type SearchInputProps = {
    onChange: (value: string) => void
}
const SearchInput: FC<SearchInputProps> = ({ onChange }) => {
    return (
        <div className={styles.searchInput}>
            <div className={styles.searchInputWrapper}>
                <SearchSvg/>
            </div>
            {/*<Image className={styles.img} src={searchIcon} alt='Иконка поиска'/>*/}
            <input placeholder='Введите имя собеседника...' type="text" onChange={(e) => onChange(e.target.value)}/>
        </div>
    );
};

export default SearchInput;