import logoTan from '@/../images/logo-tan.jpg';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-16 items-center justify-center rounded-md overflow-hidden">
                <img
                    src={logoTan}
                    alt="TAN Logistik"
                    className="size-full object-cover"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    TAN Logistik
                </span>
            </div>
        </>
    );
}