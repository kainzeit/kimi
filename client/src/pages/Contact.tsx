import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Contact() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "contact" });

  const defaultContent = `say hi
mail's the fastest way to reach me — or find me scattered around the internet.
woxiantao@icloud.com

find me
instagram: https://www.instagram.com/idbetterrun
linkedin: https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278
github: https://github.com/idbetterrun`;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">contact</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="max-w-2xl space-y-4 leading-relaxed">
            {(pageContent?.content || defaultContent).split('\n').map((line, idx) => {
              if (!line.trim()) return null;
              
              // Check if it's a URL
              if (line.includes('http')) {
                const parts = line.split(': ');
                if (parts.length === 2) {
                  return (
                    <p key={idx} className="text-sm">
                      {parts[0]}: <a href={parts[1]} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-70 transition">{parts[1]}</a>
                    </p>
                  );
                }
              }
              
              // Check if it's an email
              if (line.includes('@')) {
                return (
                  <p key={idx} className="text-sm">
                    <a href={`mailto:${line}`} className="text-primary hover:opacity-70 transition">{line}</a>
                  </p>
                );
              }
              
              return (
                <p key={idx} className="text-sm">
                  {line}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
