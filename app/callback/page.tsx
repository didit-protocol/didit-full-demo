import React from "react";
import Image from "next/image";

const CallbackPage = () => {
  return (
    <div className="h-screen grow flex flex-col text-center max-lg:justify-center lg:pt-[274px]">
      <div className="text-center max-w-[330px] mx-auto">
        <Image
          src="/images/loader.png"
          alt="Loader"
          className="w-[70px] mx-auto animate-spin"
          width={70}
          height={70}
        />
      </div>
    </div>
  );
};

export default CallbackPage;
