import ImageGenerator from '@/components/ImageGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Image Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with advanced AI technology. 
            Create high-quality images from simple text descriptions.
          </p>
        </div>
        <ImageGenerator />
      </div>
    </div>
  )
}