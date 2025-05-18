'use client'
import { ConnectButton } from '@mysten/dapp-kit'
import Image from 'next/image'
import { getUserProfile } from '@/lib/contracts'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect, useState } from 'react'
import { CategorizedObjects} from '@/utils/assetsHelpers'
import ImageUploader from "../hooks/upload";
import AddIcon from "@/hooks/addicon";
import ObjectIdQuery from "@/hooks/gettable";

export default function Home() {
  const account = useCurrentAccount();
  const [, setUserObjects] = useState<CategorizedObjects | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (account?.address) {
        try {
          const profile = await getUserProfile(account.address);
          setUserObjects(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }

    fetchUserProfile();
  }, [account]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo/logo.jpg" alt="Sui Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>

      <main className="flex-grow flex flex-col items-center p-8">
        <div>
          <ImageUploader/>
        </div>
        <div>
          <AddIcon />
          <ObjectIdQuery/>
        </div>

      </main>
    </div>
  );
}
