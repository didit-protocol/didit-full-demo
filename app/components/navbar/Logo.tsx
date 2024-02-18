"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/")}>
      <Image
        alt="Didit x Hotels"
        className="w-8 md:w-8 cursor-pointer"
        height="20"
        width="20"
        src="/images/favicon.ico"
      />
    </button>
  );
};

export default Logo;
