"use client";
import { Rating, RoundedStar } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'
import { useState } from 'react'

const StarBar = ({ value, onChange }) => {

    let comment = ["", "一言难尽", "差强人意", "中规中矩", "可圈可点", "无脑必冲"];

    return (
        <>
            <div className="flex items-center justify-center gap-4">
                <Rating className="size-sm w-[120px]" value={value} onChange={onChange} itemShapes={RoundedStar} />

                <span className="text-sm text-gray-500 whitespace-nowrap">
                    {comment[value]}
                </span>
            </div>
        </>
    )
}

export default StarBar;