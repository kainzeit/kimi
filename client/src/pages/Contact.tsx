import Layout from "@/components/Layout";

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-4">two cups clinking</p>
            <div className="w-full h-64 bg-gray-200 rounded border-2 border-dashed border-yellow-400 flex items-center justify-center">
              [Image placeholder]
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">say hi.</h2>
              <p className="text-sm text-gray-700 mb-4">
                mail's the fastest way to reach me — or find me scattered around the internet.
              </p>
              <a href="mailto:woxiantao@icloud.com" className="text-sm font-bold hover:opacity-70 transition">
                woxiantao@icloud.com
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">find me</h3>
              <div className="space-y-2 text-sm">
                <div><a href="https://www.instagram.com/idbetterrun" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">instagram</a></div>
                <div><a href="https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">linkedin</a></div>
                <div><a href="https://xhslink.com/m/xy3yXF6OmK" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">rednote</a></div>
                <div><a href="https://v.douyin.com/9Ga_apWjjQg/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">douyin</a></div>
                <div><a href="https://github.com/idbetterrun" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">github</a></div>
                <div><a href="https://www.reddit.com/user/No-Town-2478/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">reddit</a></div>
                <div><a href="https://bonjour.bio/idbetterrun" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">bonjour!</a></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">credits</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <a href="https://xhslink.com/m/6MKbqKKsp7" target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-70 transition">
                    rednote@绒.Velour✨
                  </a>
                  <p className="text-gray-600">where the site's illustrations took their inspiration</p>
                </div>
                <div>
                  <a href="https://github.com/Warren2060" target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-70 transition">
                    github@Warren2060
                  </a>
                  <p className="text-gray-600">their 寒蝉手拙体 typeface is used in the new chinese adaptation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
