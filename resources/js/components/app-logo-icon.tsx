import { ImgHTMLAttributes } from 'react';
import logoTan from '@/../images/logo-tan.jpg';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={logoTan}
            alt="TAN Logistik"
            className={className}
            {...props}
        />
    );
}