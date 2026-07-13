import Layout from "@/components/Layout";

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">contact</h1>
        <div className="space-y-8 max-w-2xl">
          <div>
            <h2 className="text-lg font-semibold mb-4">say hi</h2>
            <p className="text-muted-foreground mb-4">
              mail's the fastest way to reach me — or find me scattered around the internet.
            </p>
            <a href="mailto:woxiantao@icloud.com" className="text-primary hover:opacity-70 transition">
              woxiantao@icloud.com
            </a>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">find me</h3>
            <div className="space-y-2 text-sm">
              <div><a href="https://www.instagram.com/idbetterrun" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-70 transition">instagram</a></div>
              <div><a href="https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-70 transition">linkedin</a></div>
              <div><a href="https://github.com/idbetterrun" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-70 transition">github</a></div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">credits</h3>
            <div className="space-y-3 text-sm">
              <div>
                <a href="https://xhslink.com/m/6MKbqKKsp7" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:opacity-70 transition">
                  rednote@绒.Velour✨
                </a>
                <p className="text-muted-foreground">where the site's illustrations took their inspiration</p>
              </div>
              <div>
                <a href="https://github.com/Warren2060" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:opacity-70 transition">
                  github@Warren2060
                </a>
                <p className="text-muted-foreground">their 寒蝉手拙体 typeface is used in the new chinese adaptation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
