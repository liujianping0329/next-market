"use client";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import FormGranaryItems from "../form/FormGranaryItems";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";

const GranaryItems = ({ userInfo }) => {
  const [list, setList] = useState([]);

  const [editVer, setEditVer] = useState(0);

  const fetchList = async () => {
    const response = await ky.post('/api/granary/granary_user_template/list/match', {
      json: {
        userId: userInfo.id
      }
    }).json();
    console.log(response);
    setList(response.list);
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">

        {/* <div className="flex items-center justify-between">
          <GranaryItems trigger={
            <Button size="sm" variant="outline">新增</Button>
          } onSuccess={() => {
            // fetchList();
          }} />
        </div> */}
      </div>
      <div id="cardContainer" className="p-4">
        sssss
      </div>
    </>
  )
}

export default GranaryItems;