'use client'
import { useSearchParams } from 'next/navigation'
import ImageKitTransformer from '../components/ImageKitEditor'

const page = () => {
    const searchParams= useSearchParams();
    const imageUrl = searchParams.get("imageUrl");
    return (
    <ImageKitTransformer imageurl={imageUrl}/>
  )
}

export default page