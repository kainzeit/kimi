import Layout from "@/components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">about</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">just a regular person</h2>
            <ul className="text-sm space-y-2 text-muted-foreground">
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
            <h3 className="text-lg font-semibold mb-4">education</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">'27</span> business english— xiangnan university</p>
              <p><span className="text-muted-foreground">'25</span> business english— hunan industry polytechnic</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">internship</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">'25</span> admin assistant (office paperwork, basically)— changsha zhongbiaoyi information technology co., ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
