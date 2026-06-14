"use client";
import { Button } from "@/components/ui/button";





import supabase from "@/app/utils/database";



const Login = () => {

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/api/auth/callback?next=/money/garden`
      }
    })
  }

  return (
    <div className="relative min-h-[100dvh] bg-[url('/login.png')] bg-cover bg-center">
      <img src="/slogen.png" className="absolute w-1/2 top-20 left-20"></img>
      <div
        className="absolute flex justify-center left-1/2 top-[83%] -translate-x-1/2 -translate-y-1/2 bg-[#fffefa] backdrop-blur rounded-xl p-3 shadow gap-4"
      >
        <Button variant="outline" size="sm" onClick={handleLogin} className={`h-auto px-2 py-2`}>
          <span className="flex justify-center items-center gap-3">
            <img src="/google.svg" className="w-5 h-5" />
            <span className="text-[18px] leading-none text-muted-foreground">
              谷歌登陆
            </span>
          </span>
        </Button>
        {/* <Button variant="outline" size="sm" className={`h-auto px-1 py-1.5`}>
          <span className="flex justify-center items-center gap-3">
            <img src="/google.svg" className="w-5 h-5" />
            <span className="text-[18px] leading-none text-muted-foreground">
              谷歌登陆
            </span>
          </span>
        </Button> */}
      </div>
    </div>
  );
}
export default Login;