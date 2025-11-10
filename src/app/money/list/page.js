"use client";
import { Button } from "@/components/ui/button"

const MoneyList = () => {
    return (
        <>
            <div id="toolBar" className="flex justify-between">
                <div className="flex space-x-2">
                    <Button>（许）进帐</Button>
                    <Button>（刘）进帐</Button>
                </div>
                <Button>图表</Button>
            </div>
        </>
    )
}

export default MoneyList;