export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-col items-center gap-6 text-center px-6 py-20 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI Daily
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          每日 AI 技术日报 -- 精选全球 AI 资讯，支持中英文切换和语音播放
        </p>
      </main>
    </div>
  );
}
