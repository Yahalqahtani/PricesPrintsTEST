import Image from 'next/image';
import React from 'react';

import { Inter } from 'next/font/google';
import { ChangeEvent, JSXElementConstructor, useState } from 'react';
import PriceData from '../Prices.json';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    //total pages
    const [totalPages, settotalPages] = useState<number | undefined>(undefined);
    const [error, seterror] = useState<string>('');
    const [Finalcalc, setFinalcalc] = useState<JSX.Element>();
    const [showCopyButton, setShowCopyButton] = useState(false);

    //types

    type PriceRange = {
        range: [number, number | null];
        price: number;
    };

    type CoverPrices = {
        بلاستيك: PriceRange[];
        حديد: PriceRange[];
        شطرطون: PriceRange[];
    };

    type PriceData = {
        PagesRange: any[]; // Define this based on its structure
        CoverPrice: CoverPrices;
    };

    // get input from user and use it if number
    function HandelInput(e: ChangeEvent<HTMLInputElement>): void {
        const a = e.target.value;
        const numValue = /^\d*$/.test(a) ? parseInt(a, 10) : 0;

        if (!a) {
            // If the input is empty, reset the states
            seterror('');
            setFinalcalc(undefined);
            setShowCopyButton(false);
        } else if (isNaN(numValue)) {
            seterror('Please enter a valid number.');
            setFinalcalc(undefined);
            setShowCopyButton(false);
        } else {
            seterror('');
            setFinalcalc(calcaa(numValue));
            setShowCopyButton(true);
        }
    }
    // function prevent char in input
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
    function PreventChar(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    }

    // function calculate price based on input user
    const calcaa = (userPages: number): JSX.Element => {
        let colorP = 0;
        let normalP = 0;
        let coverPrices: Record<string, number> = {}; // Initialize as an empty object

        for (const rangeItem of PriceData.PagesRange) {
            if (userPages >= rangeItem.range[0] && (rangeItem.range[1] === undefined || userPages <= rangeItem.range[1])) {
                for (const operation of rangeItem.Print.operations) {
                    if (operation.type === 'color') {
                        colorP = operation.method === 'multiply' ? userPages * operation.value : userPages / operation.value;
                    } else if (operation.type === 'normal') {
                        normalP = operation.method === 'multiply' ? userPages * operation.value : userPages / operation.value;
                    }
                }
                break;
            }
        }

        // Calculate cover prices for all types

        // coverType should be set to the desired key
        for (const coverTypeKey in PriceData.CoverPrice) {
            coverPrices[coverTypeKey] = 0;
            for (const range of PriceData.CoverPrice[coverTypeKey as keyof CoverPrices]) {
                if (userPages >= range.range[0] && (range.range[1] === undefined || userPages <= range.range[1])) {
                    coverPrices[coverTypeKey] = range.price;
                    break;
                }
            }
        }
        return (
            <>
                <div>سعر طباعة ملون: {Math.floor(colorP)}</div>
                <div>سعر طباعة عادي: {Math.floor(normalP)}</div>
                <div>
                    <div className="pt-4 font-semibold">إذا أردت تغليف يضاف له السعر حسب اختيارك : </div>
                    {Object.entries(coverPrices).map(([coverType, price]) => (
                        <div key={coverType}>
                            سعر تغليف {coverType}: {price}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    function handleCopy() {
        const content = document.getElementById('priceResults');
        if (content) {
            const textToCopy = content.innerText;
            navigator.clipboard.writeText(textToCopy);
        }
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <div className="p-3 text-slate-300 font-light">Enter Pages Total</div>
                <input className="mb-4" type="text" onChange={HandelInput} onKeyDown={PreventChar} />
                <div className="p-4 text-slate-100" id="priceResults">
                    {Finalcalc}
                </div>
                {showCopyButton && (
                    <button
                        onClick={handleCopy}
                        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Copy Prices
                    </button>
                )}
            </div>
        </div>
    );
}
