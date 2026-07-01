"use client";
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail"
import {
    useEffect,
    useState,
} from "react";
import supabase from "@/app/utils/database";
import ky from "ky";

export const revalidate = 0;

const GardenInviteRemarkUI = ({ id }) => {
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        const getUser = async (session) => {
            const response = await ky.post('/api/f_user/list/match', { json: { id: session.user.id } }).json();
            let userInfo = { ...session.user, ...(response.list[0]) }
            setUserInfo(userInfo);
        };

        supabase.auth.getSession().then(({ data }) => {
            getUser(data.session);
        });
    }, [])

    return <GreengrassDetail id={id} showToolbar={false} showRemarkbar={false} userFront={userInfo} />;
}

export default GardenInviteRemarkUI;