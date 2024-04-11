import type { FC } from 'react';
type ReadCheckMarkProp= {
    isRead: boolean
}
const ReadCheckMarkSvg: FC<ReadCheckMarkProp> = ({ isRead }) => {
    return (
        isRead
            ? (
                <svg viewBox="0 0 29 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_35_683)">
                        <path d="M1.10354 8.93304L6.09177 14.5273L18.0635 1.10107M13.0753 12.2896L15.0706 14.5273L27.0424 1.10107" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                        <clipPath id="clip0_35_683">
                            <rect width="29" height="16" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            )
            : (
            <svg viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_35_690)">
                    <path d="M1 9.125L6 14.75L18 1.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                    <clipPath id="clip0_35_690">
                        <rect width="19" height="16" fill="white"/>
                    </clipPath>
                </defs>
            </svg>
            )

    )
}

export default ReadCheckMarkSvg;