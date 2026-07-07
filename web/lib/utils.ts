import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HelpCircleIcon, LineChartIcon, Link2Icon, LockIcon, NewspaperIcon, QrCodeIcon } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const NAV_LINKS = [
    // {
    //     title: "Features",
    //     href: "/features",
    //     menu: [
    //         {
    //             title: "Link Shortening",
    //             tagline: "Shorten links and track their performance.",
    //             href: "/features/link-shortening",
    //             icon: Link2Icon,
    //         },
    //         {
    //             title: "Password Protection",
    //             tagline: "Secure your links with a password.",
    //             href: "/features/password-protection",
    //             icon: LockIcon,
    //         },
    //         {
    //             title: "Advanced Analytics",
    //             tagline: "Gain insights into who is clicking your links.",
    //             href: "/features/analytics",
    //             icon: LineChartIcon,
    //         },
    //         {
    //             title: "Custom QR Codes",
    //             tagline: "Use QR codes to reach your audience.",
    //             href: "/features/qr-codes",
    //             icon: QrCodeIcon,
    //         },
    //     ],
    // },
    // {
    //     title: "Pricing",
    //     href: "/pricing",
    // },
    // {
    //     title: "Enterprise",
    //     href: "/enterprise",
    // },
    // {
    //     title: "Resources",
    //     href: "/resources",
    //     menu: [
    //         {
    //             title: "Blog",
    //             tagline: "Read articles on the latest trends in tech.",
    //             href: "/resources/blog",
    //             icon: NewspaperIcon,
    //         },
    //         {
    //             title: "Help",
    //             tagline: "Get answers to your questions.",
    //             href: "/resources/help",
    //             icon: HelpCircleIcon,
    //         },
    //     ]
    // },
    // {
    //     title: "Changelog",
    //     href: "/changelog",
    // },
];

export const COMPANIES = [
    {
        name: "Asana",
        logo: "/assets/dkloud.svg",
    },
    // {
    //     name: "Tidal",
    //     logo: "/assets/company-02.svg",
    // },
    // {
    //     name: "Innovaccer",
    //     logo: "/assets/company-03.svg",
    // },
    // {
    //     name: "Linear",
    //     logo: "/assets/company-04.svg",
    // },
    // {
    //     name: "Raycast",
    //     logo: "/assets/company-05.svg",
    // },
    // {
    //     name: "Labelbox",
    //     logo: "/assets/company-06.svg",
    // }
] as const;