import Layout from "@/components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-4">notebook and coffee doodle</p>
            <div className="w-full h-64 bg-gray-200 rounded border-2 border-dashed border-yellow-400 flex items-center justify-center">
              [Image placeholder]
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">just a regular person</h2>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>likes building stuff, makes little apps here and there</li>
                <li>loves music and movies — can only tell you if it's good or not, writing's too rough for actual reviews</li>
                <li>loves to travel, just haven't been many places yet</li>
                <li>studying english, still don't think i'm any good at it</li>
                <li>some days i feel unstoppable, some days everything's falling apart</li>
                <li>some nights i dream the most beautiful things, some days it all feels over</li>
                <li>saw other people writing little things on their own sites, so i figured i'd try too</li>
                <li>thanks for making it this far :)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">education</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">'27</span> business english— xiangnan university</p>
                <p><span className="text-gray-600">'25</span> business english— hunan industry polytechnic</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">internship</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">'25</span> admin assistant (office paperwork, basically)— changsha zhongbiaoyi information technology co., ltd.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
